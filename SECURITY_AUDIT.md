# Security Audit

Defensive review of `main` / approved baseline. No production database was read or modified. Last updated 2026-11-10.

> Detail memo for the granular implementation notes lives in `docs/security-audit.md` on branch `fix/issue-15-security-hardening` (PR #21). This file is the canonical register until that branch merges; reconcile the two at merge time instead of keeping duplicate tables.

## Findings

| ID | Severity | Finding | Location | Status |
| --- | --- | --- | --- | --- |
| SEC-1 | **High** | SSRF: admin media importer fetched arbitrary http(s) URLs, including loopback, private ranges and cloud metadata, following redirects blindly. | `src/app/api/admin/upload/route.ts` | Fixed in PR #21 — DNS resolution + private-range rejection + per-hop redirect validation + streaming cap (`src/lib/safe-fetch.ts`). Residual: DNS rebinding window; admin-only. |
| SEC-2 | **Medium** | Cron endpoint failed open without `CRON_SECRET`; anyone could publish scheduled posts. | `src/app/api/cron/publish-scheduled/route.ts` | Fixed in PR #21 — 503 in production when unset; constant-time bearer comparison. |
| SEC-3 | Low | CSRF relied on `SameSite=Strict` only; no `Origin` verification on admin mutations. | `src/lib/api-helpers.ts` | Fixed in PR #21 — mismatched `Origin`/`Host` rejected with 403. |
| SEC-4 | Low | `robots.ts` allows everything, including `/admin` and `/api`. | `src/app/robots.ts` | Fixed in PR #46 (disallow rules). |
| SEC-5 | Low | Rate limiter is an in-process `Map`; per-instance on serverless. | `src/lib/rate-limit.ts` | Accepted residual risk; no auth bypass, only weaker throttling. |
| SEC-6 | Low | No Content-Security-Policy header. | `next.config.mjs` | Accepted for now; Next.js inline bootstrap requires a nonce strategy. |
| SEC-7 | Low | Single shared admin password; no MFA and no session revocation list. | `src/lib/adminSession.ts` | Accepted; rotating `PAGE_ACCESS_PASSWORD` invalidates all sessions (HKDF-derived key). |
| SEC-8 | Info | Supabase/Resend error strings returned to authenticated admin clients. | various admin routes | Accepted; public endpoints already return generic messages. |

## Verified controls (independently checked)

- Every `/api/admin/*` handler requires a signed cookie server-side via `adminRoute`/`requireAdmin`; `/api/admin/auth` is intentionally public and rate-limited.
- Session token: `HMAC-SHA256` over expiry, HKDF-derived key, constant-time verify, expiry enforced. Cookie `HttpOnly`, `SameSite=Strict`, `Secure` in production, 7-day TTL, cleared on sign-out.
- Login: 25 attempts / 15 min / IP; password comparison constant-time over SHA-256 digests.
- Uploads: magic-byte validation (JPEG/PNG/WebP/GIF/MP4/WebM), 8 MB image / 60 MB video caps, server-generated storage paths, filename allowlist on delete.
- Public writes (`contact`, `subscribers`, `unsubscribe`, `comments`, `reactions`, `views`): rate-limited, length-bounded, honeypot where a form exists; comments require an existing published slug; reactions require a published post.
- Unsubscribe tokens are HMAC-signed and verified in constant time.
- Service-role key and admin password never appear in the client bundle; `src/lib/env.ts` is now `server-only` (Kilo commit `32e94f1`), alongside existing guards on data/settings/supabase modules.
- Security headers present: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Permissions-Policy`, HSTS in production.
- No secrets tracked in git: `.env*` ignored except `.env.example`; `.env.local` is local-only.

## Rules for agents

1. Never print, log or commit secret values.
2. Never modify production data to "fix" content issues such as junk tag slugs.
3. Never weaken an auth check, rate limit or validation to make a test pass.
4. Report a suspected vulnerability in this file; do not exploit it.
