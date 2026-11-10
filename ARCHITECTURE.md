# Architecture

Maintained by **Freebuff**. Last verified against `dd25e36` + PR branches on 2026-11-10.

## Rendering

- Next.js 16 App Router. Public site under `src/app/(site)` (route group, shared header/footer/layout), Studio under `src/app/admin`, APIs under `src/app/api`.
- Server Components by default; interactive islands are client components (`SiteHeader` drawer, forms, editor, tables).
- `src/proxy.ts` is the Next 16 replacement for `middleware.ts`: it 301-redirects renamed slugs and gates `/admin` on a signed cookie. Matcher: `/admin/:path*`, `/blog/:path*`, `/series/:path*`.
- `next.config.mjs` sets security headers, a permanent `/categories → /topics` redirect, image remote patterns for the Supabase bucket, and `poweredByHeader: false`.

## Data layer

`src/lib/data.ts` is the single access point for posts, topics, series, albums, authors and comments.

- Uses the Supabase service-role client (`src/lib/supabase/server.ts`, `server-only`).
- **File fallback:** when Supabase env is absent, it serves demo content from `src/content/*` so the site never breaks before the database is seeded.
- **Empty-safe:** when Supabase is configured but unreachable, it returns empty collections rather than silently mixing demo content into real data.
- Missing-schema errors are detected (`isMissingSchema`) and surfaced as friendly states instead of 500s.
- Cache revalidation is centralized in `revalidateContentCache()`, called by admin mutations and the cron route.

## Content model

Posts store blocks as `jsonb` (paragraph, heading, quote, callout, code, list, image, video, table, divider, related tout, jump links, image rows/carousels). Sanitization lives in `src/lib/sanitize-rich.ts` (38 KB) and request shaping in `src/lib/post-input.ts`; both are shared by every post write path.

## Authentication and authorization

- `src/lib/adminSession.ts`: session token = `<expiryUnix>.<hex HMAC-SHA256>`, key derived with HKDF-SHA256 from `PAGE_ACCESS_PASSWORD`. Constant-time verification, 7-day TTL.
- Cookie: `admin_auth`, `HttpOnly`, `SameSite=Strict`, `Secure` in production.
- `src/lib/adminAuth.ts`: `requireAdmin()` re-checks the cookie **inside every route handler**; the proxy is UX only, never the sole gate.
- `src/lib/api-helpers.ts`: `adminRoute()` wraps mutations with auth, JSON error handling, cache revalidation and (on PR #21) an `Origin` check.

## Public write endpoints

`/api/contact`, `/api/subscribers`, `/api/unsubscribe`, `/api/comments`, `/api/comments/reactions`, `/api/views` all use the in-process limiter in `src/lib/rate-limit.ts`, a honeypot field where a form exists, and length-bounded input validation. Unsubscribe links carry HMAC tokens (`src/lib/unsubscribe.ts`).

## Admin Studio

Pages: Overview, Posts (+ new/edit block editor with revision history UI), Media, Gallery (+ folder), Comments, Inbox, Topics, Series, Authors, Subscribers, Settings. Shared primitives live in `src/components/admin/kit.tsx` (`PageHeader`, `Card`, `Table`, `Segmented`, `StatusChip`, `EmptyState`, `LoadingState`) with `Feedback.tsx` supplying toasts and confirm dialogs.

## Integrations

| Service | Purpose | Configuration |
| --- | --- | --- |
| Supabase | Postgres + public Storage bucket | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` |
| Resend | Newsletter and reply mail (optional) | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| Vercel | Hosting + daily cron | `vercel.json` → `/api/cron/publish-scheduled` at 00:05 UTC; `CRON_SECRET` |

## Directory map

```
src/app/(site)/      public routes (home, blog, topics, tags, series, gallery, search, about, personal, resources, newsletter, privacy, unsubscribe, rss, sitemap, robots)
src/app/admin/       Studio pages
src/app/api/         admin CRUD + public write endpoints + cron
src/components/      site/ blog/ admin/ gallery/ ui/ icons/
src/lib/             data, auth, session, settings, sanitize, recommend, mailer, rate-limit, routing
src/content/         file-based demo fallbacks
supabase/schema.sql  idempotent schema, RLS, triggers, storage bucket
scripts/             legacy importer
```
