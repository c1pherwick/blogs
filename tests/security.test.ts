import { describe, expect, it } from "vitest";
import {
  checkRemoteUrl,
  isBlockedHostname,
  isPrivateAddress,
  isSameOrigin,
  timingSafeEqualStrings,
} from "@/lib/security";

describe("isPrivateAddress", () => {
  it.each([
    "127.0.0.1",
    "127.1.2.3",
    "0.0.0.0",
    "10.0.0.1",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "224.0.0.1",
    "255.255.255.255",
    "::1",
    "::",
    "fe80::1",
    "fc00::1",
    "fd12:3456::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "2001:db8::1",
  ])("blocks %s", (address) => {
    expect(isPrivateAddress(address)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "93.184.216.34", "2606:4700:4700::1111", "2001:4860:4860::8888"])(
    "allows public %s",
    (address) => {
      expect(isPrivateAddress(address)).toBe(false);
    },
  );
});

describe("host and URL validation", () => {
  it("blocks local hostnames and suffixes", () => {
    expect(isBlockedHostname("localhost")).toBe(true);
    expect(isBlockedHostname("api.localhost")).toBe(true);
    expect(isBlockedHostname("printer.local")).toBe(true);
    expect(isBlockedHostname("metadata.google.internal")).toBe(true);
    expect(isBlockedHostname("example.com")).toBe(false);
  });

  it("rejects non-http, credentialed and private URLs", () => {
    expect(checkRemoteUrl("file:///etc/passwd").ok).toBe(false);
    expect(checkRemoteUrl("https://user:pass@example.com/a.png").ok).toBe(false);
    expect(checkRemoteUrl("http://127.0.0.1/a.png").ok).toBe(false);
    expect(checkRemoteUrl("http://[::1]/a.png").ok).toBe(false);
    expect(checkRemoteUrl("http://localhost:3000/a.png").ok).toBe(false);
    expect(checkRemoteUrl("http://169.254.169.254/latest/meta-data").ok).toBe(false);
  });

  it("accepts ordinary public https URLs", () => {
    expect(checkRemoteUrl("https://example.com/photo.png").ok).toBe(true);
  });
});

describe("isSameOrigin", () => {
  const hosts = ["blogs.example.com", "localhost:3000"];

  it("allows absent Origin (non-browser clients)", () => {
    expect(isSameOrigin(null, hosts)).toBe(true);
  });

  it("allows matching origins and rejects mismatches", () => {
    expect(isSameOrigin("https://blogs.example.com", hosts)).toBe(true);
    expect(isSameOrigin("http://localhost:3000", hosts)).toBe(true);
    expect(isSameOrigin("https://evil.example", hosts)).toBe(false);
    expect(isSameOrigin("not a url", hosts)).toBe(false);
  });
});

describe("timingSafeEqualStrings", () => {
  it("compares without accepting prefixes", () => {
    expect(timingSafeEqualStrings("Bearer abc", "Bearer abc")).toBe(true);
    expect(timingSafeEqualStrings("Bearer abc", "Bearer abd")).toBe(false);
    expect(timingSafeEqualStrings("Bearer abc", "Bearer ab")).toBe(false);
  });
});
