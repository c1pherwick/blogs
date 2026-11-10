# Security audit — admin authentication, APIs and secrets

Scope: the HKDF-signed admin cookie, `/api/admin/*`, public write endpoints
(contact, comments, newsletter, views, unsubscribe), Supabase service-role
usage, uploads, rate limiting and error handling. No production database was
read or modified during this audit.

## Findings

| Severity | Finding | Status |
| --- | --- | --- |
| High | The media importer (`POST /api/admin/upload` with `{ url }`) fetched any http(s) URL, including loopback, private ranges and cloud metadata (`169.254.169.254`), and followed redirects blindly (SSRF). | Fixed in `src/lib/safe-fetch.ts`; the host is resolved and every address is checked, redirects are re-validated hop by hop, and the body is capped. |
| Medium | `/api/cron/publish-scheduled` failed open when `CRON_SECRET` was unset: anyone could trigger publishing of scheduled posts in production. | Fixed: production now returns `503` and refuses to publish without a secret. Bearer comparison is constant-time. |
| Low | Admin mutations relied on `SameSite=Strict` alone for CSRF defence. | Hardened: `adminRoute` also rejects `Origin` headers that do not match the request/deployment host. Non-browser clients without an `Origin` still require a valid cookie. |
| Low | Supabase/Resend error strings are returned to admin clients in several handlers. | Accepted for authenticated admin responses; public write endpoints already return generic messages. Tracked for a follow-up if non-admin exposure changes. |
| Low | Rate limiting is an in-process `Map`; on multi-instance/serverless deployments limits are per instance. | Documented residual risk. Not a correctness or auth bypass. |
| Low | No Content-Security-Policy header. | Not added in this pass because Next.js inline bootstrap scripts require a nonce strategy; tracked separately. |

## Verified controls

- Every `/api/admin/*` handler requires a signed session cookie **independently
  on the server** (`adminRoute` or explicit `requireAdmin`); the `/admin` proxy
  is only a UX redirect, never the sole gate.
- Session tokens are `HMAC-SHA256` over an expiry timestamp with a key derived
  from `PAGE_ACCESS_PASSWORD`; verification is constant-time and expiry-checked.
- Cookie flags: `HttpOnly`, `SameSite=Strict`, `Path=/`, 7-day `Max-Age`, and
  `Secure` in production. Sign-out expires the cookie.
- Login is rate-limited (25 attempts / 15 min / IP) and password comparison is
  constant-time over SHA-256 digests.
- Uploads are limited to 8 MB images / 60 MB videos and validated by magic
  bytes, not the client-supplied MIME type; storage paths are server-generated.
- Resulting production bundle contains **0** occurrences of the Supabase
  service-role key and **0** of the admin password. `src/lib/env.ts` is now
  guarded with `server-only` in addition to the existing guards on the data,
  settings and Supabase client modules.
- Public write endpoints are rate-limited and use a honeypot; contact and
  comment payloads are length-bounded and validated; unsubscribe tokens are
  HMAC-signed and verified in constant time.

## Residual risks / follow-ups

- DNS rebinding between the DNS check and `fetch()` is not fully eliminated;
  imports remain admin-only. A future improvement is an undici dispatcher with
  a pinned `lookup`.
- Rate limits are not shared between instances.
- No MFA or session revocation list beyond password rotation/expiry.
