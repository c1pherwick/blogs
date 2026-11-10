/**
 * Small, dependency-free security helpers shared by API routes and tests.
 * Keep this module free of Node-only or Next-only imports so it can be unit
 * tested in plain Node.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
]);

const DOCUMENTATION_V4 = [
  [192, 0, 2, 0, 24],
  [198, 51, 100, 0, 24],
  [203, 0, 113, 0, 24],
] as const;

const PRIVATE_V4 = [
  [0, 0, 0, 0, 8],
  [10, 0, 0, 0, 8],
  [100, 64, 0, 0, 10],
  [127, 0, 0, 0, 8],
  [169, 254, 0, 0, 16],
  [172, 16, 0, 0, 12],
  [192, 0, 0, 0, 24],
  [192, 168, 0, 0, 16],
  [198, 18, 0, 0, 15],
  [224, 0, 0, 0, 4],
  [240, 0, 0, 0, 4],
  [255, 255, 255, 255, 32],
  ...DOCUMENTATION_V4,
] as const;

function v4ToInt(address: string): number | null {
  const parts = address.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = (value << 8) + octet;
  }
  return value >>> 0;
}

function inV4Cidr(value: number, base: readonly number[], bits: number): boolean {
  const baseValue = v4ToInt(base.join("."));
  if (baseValue === null) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (value & mask) === (baseValue & mask);
}

export function isPrivateAddress(address: string): boolean {
  const raw = address.trim().replace(/^\[|\]$/g, "").replace(/%.+$/, "").toLowerCase();
  if (!raw) return true;

  // IPv4-mapped IPv6, e.g. ::ffff:127.0.0.1
  const mapped = raw.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return isPrivateAddress(mapped[1]);

  // IPv4-mapped IPv6 in hex groups, e.g. ::ffff:7f00:1
  const mappedHex = raw.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    return isPrivateAddress(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }

  const v4 = v4ToInt(raw);
  if (v4 !== null) {
    return PRIVATE_V4.some(([a, b, c, d, bits]) =>
      inV4Cidr(v4, [a, b, c, d], bits),
    );
  }

  if (raw === "::" || raw === "::1") return true;
  if (raw.startsWith("fe8") || raw.startsWith("fe9") || raw.startsWith("fea") || raw.startsWith("feb")) {
    return true; // fe80::/10 link-local
  }
  if (/^f[cd][0-9a-f]{2}:/.test(raw) || /^f[cd][0-9a-f]{3}:/.test(raw)) {
    return true; // fc00::/7 unique-local
  }
  if (raw.startsWith("2001:db8")) return true; // documentation
  if (raw.startsWith("64:ff9b:")) return true; // NAT64 — may embed private IPv4
  if (raw.startsWith("100::")) return true; // discard-only
  if (raw.startsWith("2001:2:") || raw.startsWith("2001:10:") || raw.startsWith("2001:20:")) {
    return true; // benchmarking / ORCHID
  }

  return false;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host.endsWith(".home.arpa")) return true;
  return false;
}

export type RemoteUrlCheck =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

export function checkRemoteUrl(raw: string): RemoteUrlCheck {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "Enter a valid http(s) URL" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "Only http(s) URLs can be imported" };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "URLs with embedded credentials are not allowed" };
  }
  if (isBlockedHostname(url.hostname)) {
    return { ok: false, reason: "That host is not allowed" };
  }
  // IP literals can be checked without DNS.
  if (/^[\d.]+$/.test(url.hostname) || url.hostname.includes(":")) {
    if (isPrivateAddress(url.hostname)) {
      return { ok: false, reason: "Private or local addresses are not allowed" };
    }
  }
  return { ok: true, url };
}

/**
 * Same-origin guard for state-changing admin requests. SameSite=Strict cookies
 * are the primary CSRF defence; this adds a second, explicit check when the
 * browser sends an Origin header. Non-browser clients (no Origin) still need a
 * valid session cookie.
 */
export function isSameOrigin(
  origin: string | null | undefined,
  allowedHosts: (string | null | undefined)[],
): boolean {
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }
  return allowedHosts.some((host) => {
    if (!host) return false;
    return host.trim().toLowerCase() === originHost;
  });
}

/** Constant-time-ish comparison for short secrets (avoids early-exit timing). */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
