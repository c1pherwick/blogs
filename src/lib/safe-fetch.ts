import "server-only";

import { lookup } from "node:dns/promises";
import { checkRemoteUrl, isPrivateAddress } from "@/lib/security";

const MAX_REDIRECTS = 3;

export type RemoteFetchResult =
  | { ok: true; bytes: Uint8Array; contentType: string }
  | { ok: false; status: number; error: string };

async function assertPublicHost(url: URL): Promise<string | null> {
  const host = url.hostname.replace(/^\[|\]$/g, "");
  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    return "That host could not be resolved";
  }
  if (addresses.length === 0) return "That host could not be resolved";
  for (const entry of addresses) {
    if (isPrivateAddress(entry.address)) {
      return "Private or local addresses are not allowed";
    }
  }
  return null;
}

/**
 * Download a remote file for the admin media importer with SSRF protections:
 * http(s) only, no credentials, private/loopback/link-local addresses blocked,
 * every redirect hop re-validated, and a hard byte cap on the body.
 */
export async function fetchRemoteFile(
  raw: string,
  maxBytes: number,
  timeoutMs = 20_000,
): Promise<RemoteFetchResult> {
  const checked = checkRemoteUrl(raw);
  if (!checked.ok) return { ok: false, status: 400, error: checked.reason };

  let current = checked.url;
  const signal = AbortSignal.timeout(timeoutMs);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const hostError = await assertPublicHost(current);
    if (hostError) return { ok: false, status: 400, error: hostError };

    const response = await fetch(current.toString(), {
      redirect: "manual",
      headers: { "user-agent": "Mozilla/5.0 (compatible; SiteUploadImport/1.0)" },
      signal,
    }).catch(() => null);

    if (!response) return { ok: false, status: 400, error: "Could not download that URL" };

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return { ok: false, status: 400, error: "The remote server sent an invalid redirect" };
      const next = checkRemoteUrl(new URL(location, current).toString());
      if (!next.ok) return { ok: false, status: 400, error: next.reason };
      current = next.url;
      continue;
    }

    if (!response.ok) return { ok: false, status: 400, error: "Could not download that URL" };

    const declared = Number(response.headers.get("content-length") ?? 0);
    if (Number.isFinite(declared) && declared > maxBytes) {
      return { ok: false, status: 413, error: "Remote file is too large" };
    }

    const reader = response.body?.getReader();
    if (!reader) return { ok: false, status: 400, error: "The remote file was empty" };

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, status: 413, error: "Remote file is too large" };
      }
      chunks.push(value);
    }
    if (total === 0) return { ok: false, status: 413, error: "Remote file is empty or too large" };

    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return {
      ok: true,
      bytes,
      contentType: response.headers.get("content-type") ?? "application/octet-stream",
    };
  }

  return { ok: false, status: 400, error: "Too many redirects" };
}
