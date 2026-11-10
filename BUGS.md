# Bugs

Confirmed defects only, with evidence. Last updated 2026-11-10.

## Open

### BUG-1 — Homepage renders the same personal story twice (High)

- **Where:** `src/app/(site)/page.tsx` (baseline `dd25e36`).
- **Cause:** the spotlight rail is built from *all* posts (`combined`), while the journal band separately selects the newest personal posts — the same row appears in both.
- **Evidence:** `combined` has no exclusion of journal entries; issue #1 reproduces the duplication.
- **Status:** fix implemented in PR #27 (`src/lib/home-selection.ts` + test); duplicate attempt in #23.
- **Exit:** one selection pass returns non-overlapping sets; test covers feature pinned to a personal post.

### BUG-2 — Single-record delete confirmations do not name the record (Medium)

- **Where:** `src/app/admin/comments/page.tsx`, `src/app/admin/messages/page.tsx`.
- **Cause:** generic copy ("Delete this comment?") gave no author, post, sender or subject.
- **Status:** **Fixed** in PR #48 (commit `5f18d51`).
- **Verification:** typecheck + build exit 0.

### BUG-3 — Cron publishes without authentication when `CRON_SECRET` is unset (Medium)

- **Where:** `src/app/api/cron/publish-scheduled/route.ts`.
- **Cause:** guard is `if (secret) { … }` — unset secret means no check, so any caller can publish scheduled posts in production.
- **Status:** fix in PR #21 (fails closed with 503 in production, constant-time compare).
- **Exit:** production request without the secret is refused.

### BUG-4 — Media importer is an SSRF primitive (High)

- **Where:** `src/app/api/admin/upload/route.ts` (`{ url }` JSON branch).
- **Cause:** `fetch(url, { redirect: "follow" })` on any http(s) target — loopback, RFC1918, link-local metadata (`169.254.169.254`) — with no address validation and no per-hop re-check.
- **Status:** fix in PR #21 (`src/lib/safe-fetch.ts`: DNS resolution, private-range rejection, manual redirects re-validated, streaming byte cap).
- **Residual:** DNS-rebinding window between check and fetch remains; import is admin-only.

### BUG-5 — Duplicate tag slugs in hosted content (Low, data)

- **Where:** production database.
- **Evidence:** the build prerenders `/blog/tag/2` among tag routes.
- **Cause:** numeric/junk tags exist as rows; `allTags()` slugifies them verbatim.
- **Status:** no code change planned. Requires content cleanup by the owner (production data must not be edited by agents).

### BUG-6 — No `/series` index route (Low)

- **Where:** `src/app/(site)/series/[slug]` exists; `/series` does not, and nothing links to it.
- **Status:** enhancement implemented in PR #41 (`series/page.tsx` + index styles + route helper).

## Fixed

| Bug | Fix | Verified by |
| --- | --- | --- |
| Ad-hoc per-page loading text in Studio; tables without accessible names; `Segmented` claiming `tablist` without panels; Authors empty state linking to `#` | PR #48 (`5f18d51`) | typecheck + build exit 0 |
| Header drawer did not trap focus / overlays unlabelled | PR #44 | Vercel build green |
| Reading progress inaccurate; broken images unhandled | PR #42 | Vercel build green |
| Search lost filters and accepted invalid params | PR #40 | Vercel build green |
| Gallery album fallbacks missing; photo labels unclear | PR #43 | Vercel build green |
