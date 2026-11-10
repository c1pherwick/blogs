# Route Quality Inventory

Last updated: 2026-11-10
Primary audit issue: #19

## Verification evidence captured in this pass

- App Router route inventory taken from `src/app/**/page.tsx`, `src/app/**/route.ts`, `src/app/(site)/sitemap.ts`, `src/app/robots.ts`, `next.config.mjs`, and `src/proxy.ts`.
- Internal literal-link scan result: `unknown count 0` (all hardcoded `href="/..."` destinations matched valid internal routes, API paths, or intentional aliases like `/categories`).
- Dynamic unknown-slug handling verified in code:
  - `/blog/[slug]`, `/blog/category/[slug]`, `/blog/tag/[slug]`, `/gallery/[slug]`, `/series/[slug]` call `notFound()`.
  - `/admin/gallery/[id]` renders a “Folder not found” recovery state.
- Shared site loading/error/not-found boundaries verified at `(site)` segment level:
  - `src/app/(site)/loading.tsx`
  - `src/app/(site)/error.tsx`
  - `src/app/(site)/not-found.tsx`
- DB unavailable/file fallback behavior verified in data/settings layers:
  - File fallback when Supabase is not configured: `src/lib/data.ts`, `src/lib/settings.ts`, `src/lib/env.ts`.
  - Empty-safe behavior when Supabase is configured but unavailable: `src/lib/data.ts` returns empty collections instead of demo content.
- CI log check (per quality workflow): GitHub Actions run `42836753373` currently has no failed jobs (`failed_jobs: 0`).

---

## Public UI routes (App Router)

| Route | Access | Key layout/components | Audit issue coverage | Verification status |
| --- | --- | --- | --- | --- |
| `/` | Public | `(site)/layout.tsx`, `(site)/page.tsx`, `NewsletterSection`, `StoryCarousel` | #19, #3, #4 | ✅ Route exists, links/boundaries covered |
| `/about` | Public | `(site)/layout.tsx`, `(site)/about/page.tsx`, `ContactForm`, `ShareMenu` | #19, #18 | ✅ Route exists, links/boundaries covered |
| `/blog` | Public | `(site)/blog/page.tsx`, `Breadcrumb` | #19, #5 | ✅ Route exists, links/boundaries covered |
| `/blog/[slug]` | Public (dynamic) | `(site)/blog/[slug]/page.tsx`, `PostContent`, `RelatedCarousel`, `ArticleDiscussion` | #19, #5 | ✅ Unknown slug handled via `notFound()` |
| `/blog/category/[slug]` | Public (dynamic) | `(site)/blog/category/[slug]/page.tsx`, `Breadcrumb` | #19, #7 | ✅ Unknown slug handled via `notFound()` |
| `/blog/tag/[slug]` | Public (dynamic) | `(site)/blog/tag/[slug]/page.tsx`, `LatestSection` | #19, #7 | ✅ Unknown slug handled via `notFound()` |
| `/gallery` | Public | `(site)/gallery/page.tsx`, `Breadcrumb` | #19, #8 | ✅ Route exists, links/boundaries covered |
| `/gallery/[slug]` | Public (dynamic) | `(site)/gallery/[slug]/page.tsx`, `AlbumGrid`, `AlbumNav` | #19, #8 | ✅ Unknown slug handled via `notFound()` |
| `/newsletter` | Public | `(site)/newsletter/page.tsx`, `NewsletterForm`, `PageHero` | #19, #17 | ✅ Route exists, links/boundaries covered |
| `/personal` | Public | `(site)/personal/page.tsx`, `Breadcrumb` | #19, #18 | ✅ Route exists, links/boundaries covered |
| `/personal/blogs` | Public | `(site)/personal/blogs/page.tsx` | #19, #18 | ✅ Route exists, links/boundaries covered |
| `/privacy` | Public | `(site)/privacy/page.tsx` | #19, #4 | ✅ Route exists, links/boundaries covered |
| `/resources` | Public | `(site)/resources/page.tsx`, `Breadcrumb` | #19, #18 | ✅ Route exists, links/boundaries covered |
| `/search` | Public | `(site)/search/page.tsx`, `SearchFilters` | #19, #6 | ✅ Route exists, links/boundaries covered |
| `/series/[slug]` | Public (dynamic) | `(site)/series/[slug]/page.tsx` | #19, #7 | ✅ Unknown slug handled via `notFound()` |
| `/tags` | Public | `(site)/tags/page.tsx` | #19, #7 | ✅ Route exists, links/boundaries covered |
| `/topics` | Public | `(site)/topics/page.tsx` | #19, #7 | ✅ Route exists, links/boundaries covered |
| `/unsubscribe` | Public | `(site)/unsubscribe/page.tsx`, `UnsubscribeForm` | #19, #17 | ✅ Route exists, links/boundaries covered |
| `/categories` | Public redirect | `next.config.mjs` redirect to `/topics` | #19, #7 | ✅ Permanent redirect configured |

---

## Admin UI routes (App Router)

| Route | Access | Key layout/components | Audit issue coverage | Verification status |
| --- | --- | --- | --- | --- |
| `/admin/login` | Public auth gate | `admin/login/layout.tsx`, `admin/login/page.tsx` | #19, #9, #15 | ✅ Login route present; proxy guard in `src/proxy.ts` |
| `/admin` | Authenticated admin | `admin/layout.tsx`, `admin/page.tsx` | #19, #9, #10 | ✅ Route present; DB setup/empty-safe messaging exists |
| `/admin/posts` | Authenticated admin | `admin/posts/page.tsx`, `PostsTable` | #19, #10, #11 | ✅ Route present |
| `/admin/posts/new` | Authenticated admin | `admin/posts/new/page.tsx`, `PostEditor` | #19, #11 | ✅ Route present |
| `/admin/posts/[id]/edit` | Authenticated admin | `admin/posts/[id]/edit/page.tsx`, `PostEditor` | #19, #11 | ✅ Route present |
| `/admin/media` | Authenticated admin | `admin/media/page.tsx` | #19, #12 | ✅ Route present |
| `/admin/gallery` | Authenticated admin | `admin/gallery/page.tsx` | #19, #12 | ✅ Route present |
| `/admin/gallery/[id]` | Authenticated admin (dynamic) | `admin/gallery/[id]/page.tsx` | #19, #12 | ✅ Missing album handled with in-page fallback |
| `/admin/topics` | Authenticated admin | `admin/topics/page.tsx` | #19, #10, #12 | ✅ Route present |
| `/admin/series` | Authenticated admin | `admin/series/page.tsx` | #19, #10, #12 | ✅ Route present |
| `/admin/authors` | Authenticated admin | `admin/authors/page.tsx` | #19, #10 | ✅ Route present |
| `/admin/comments` | Authenticated admin | `admin/comments/page.tsx` | #19, #10, #13 | ✅ Route present |
| `/admin/messages` | Authenticated admin | `admin/messages/page.tsx` | #19, #10, #17 | ✅ Route present |
| `/admin/subscribers` | Authenticated admin | `admin/subscribers/page.tsx` | #19, #10, #17 | ✅ Route present |
| `/admin/settings` | Authenticated admin | `admin/settings/page.tsx` | #19, #10, #15 | ✅ Route present |

---

## Non-UI routes (metadata, feeds, API)

### Metadata and feed routes

| Route | Type | Source | Audit issue coverage | Verification status |
| --- | --- | --- | --- | --- |
| `/sitemap.xml` | Metadata | `src/app/(site)/sitemap.ts` | #19, #16 | ✅ Route exists; includes static + dynamic content URLs |
| `/robots.txt` | Metadata | `src/app/robots.ts` | #19, #16 | ✅ Route exists |
| `/rss.xml` | Feed route handler | `src/app/(site)/rss.xml/route.ts` | #19, #16 | ✅ Route exists |

### API routes

| Route | Access | Audit issue coverage | Verification status |
| --- | --- | --- | --- |
| `/api/contact` | Public | #19, #17 | ✅ Route handler exists |
| `/api/comments` | Public | #19, #5, #13 | ✅ Route handler exists |
| `/api/comments/reactions` | Public | #19, #5, #13 | ✅ Route handler exists |
| `/api/subscribers` | Public | #19, #17 | ✅ Route handler exists |
| `/api/unsubscribe` | Public | #19, #17 | ✅ Route handler exists |
| `/api/views` | Public | #19, #5 | ✅ Route handler exists |
| `/api/cron/publish-scheduled` | System/cron | #19, #14 | ✅ Route handler exists |
| `/api/admin/auth` | Admin/auth | #19, #15 | ✅ Route handler exists |
| `/api/admin/analytics` | Admin/auth | #19, #10, #15 | ✅ Route handler exists |
| `/api/admin/upload` | Admin/auth | #19, #12, #15 | ✅ Route handler exists |
| `/api/admin/send-email` | Admin/auth | #19, #17, #15 | ✅ Route handler exists |
| `/api/admin/albums` | Admin/auth | #19, #12, #15 | ✅ Route handler exists |
| `/api/admin/albums/[id]` | Admin/auth (dynamic) | #19, #12, #15 | ✅ Route handler exists |
| `/api/admin/authors` | Admin/auth | #19, #10, #15 | ✅ Route handler exists |
| `/api/admin/authors/[id]` | Admin/auth (dynamic) | #19, #10, #15 | ✅ Route handler exists |
| `/api/admin/comments` | Admin/auth | #19, #10, #13, #15 | ✅ Route handler exists |
| `/api/admin/comments/[id]` | Admin/auth (dynamic) | #19, #10, #13, #15 | ✅ Route handler exists |
| `/api/admin/comments/bulk` | Admin/auth | #19, #10, #13, #15 | ✅ Route handler exists |
| `/api/admin/messages` | Admin/auth | #19, #10, #17, #15 | ✅ Route handler exists |
| `/api/admin/messages/[id]` | Admin/auth (dynamic) | #19, #10, #17, #15 | ✅ Route handler exists |
| `/api/admin/photos` | Admin/auth | #19, #12, #15 | ✅ Route handler exists |
| `/api/admin/photos/[id]` | Admin/auth (dynamic) | #19, #12, #15 | ✅ Route handler exists |
| `/api/admin/posts` | Admin/auth | #19, #10, #11, #15 | ✅ Route handler exists |
| `/api/admin/posts/[id]` | Admin/auth (dynamic) | #19, #10, #11, #15 | ✅ Route handler exists |
| `/api/admin/posts/[id]/mail` | Admin/auth (dynamic) | #19, #11, #17, #15 | ✅ Route handler exists |
| `/api/admin/posts/[id]/revisions` | Admin/auth (dynamic) | #19, #11, #15 | ✅ Route handler exists |
| `/api/admin/posts/bulk` | Admin/auth | #19, #10, #11, #15 | ✅ Route handler exists |
| `/api/admin/posts/unfeature-others` | Admin/auth | #19, #10, #11, #15 | ✅ Route handler exists |
| `/api/admin/series` | Admin/auth | #19, #10, #12, #15 | ✅ Route handler exists |
| `/api/admin/series/[id]` | Admin/auth (dynamic) | #19, #10, #12, #15 | ✅ Route handler exists |
| `/api/admin/settings` | Admin/auth | #19, #10, #15 | ✅ Route handler exists |
| `/api/admin/subscribers` | Admin/auth | #19, #10, #17, #15 | ✅ Route handler exists |
| `/api/admin/topics` | Admin/auth | #19, #10, #12, #15 | ✅ Route handler exists |
| `/api/admin/topics/[id]` | Admin/auth (dynamic) | #19, #10, #12, #15 | ✅ Route handler exists |

---

## Explicitly unverified / pending manual checks

1. End-to-end runtime behavior for every API error branch (malformed payloads, upstream provider failures, and auth edge cases) is **not** exhaustively exercised in this pass.
2. Browser-level validation of loading skeleton timing and visual empty/error states across all routes is **not** fully exercised here.
3. Live database outage simulation in deployed environments is **not** executed in this pass; only fallback behavior was verified through code paths.
4. Content-driven links inside rich-text blocks and database-managed nav/footer settings are dynamic; static literal-link scan does not fully validate all runtime content rows.
