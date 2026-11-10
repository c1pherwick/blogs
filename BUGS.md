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

### BUG-3 — Cmd/Ctrl+S silently unpublishes a live post (High)

- **Where:** `src/components/admin/PostEditor.tsx` keyboard handler.
- **Cause:** `Cmd/Ctrl+S` called `save("draft")`; `save()` applies the status explicitly, so a habitual save on a published post demoted it to draft and took it offline.
- **Status:** **Fixed** in PR #50 (`bd29814`). The shortcut now calls `save()` and keeps the current status.
- **Exit:** saving a published post leaves it published; demotion stays an explicit click.

### BUG-4 — Block deletion is irreversible (Medium)

- **Where:** `PostEditor.tsx` `removeBlock()`.
- **Cause:** the block was filtered out of the array immediately; all typed content was lost with no undo.
- **Status:** **Fixed** in PR #50 — deletion shows an Undo toast that reinserts the block at its original index.

### BUG-5 — Missing headline only reported as a remote banner (Low)

- **Where:** editor save path + `src/lib/post-input.ts` (server requires a title).
- **Cause:** the request failed and the message appeared in the command bar, far from the field, without moving focus.
- **Status:** **Fixed** in PR #50 — inline `role="alert"` under the title, `aria-invalid` + `aria-describedby`, Write tab restored, title focused.

### BUG-6 — Delete post used `window.confirm` (Low)

- **Where:** editor “More actions” menu.
- **Cause:** raw browser dialog, inconsistent with every other Studio destructive action.
- **Status:** **Fixed** in PR #50 — uses the shared `useConfirm()` dialog with the post title in the body.

### BUG-7 — Cron publishes without authentication when `CRON_SECRET` is unset (Medium)

- **Where:** `src/app/api/cron/publish-scheduled/route.ts`.
- **Cause:** guard is `if (secret) { … }` — unset secret means no check, so any caller can publish scheduled posts in production.
- **Status:** fix in PR #21 (fails closed with 503 in production, constant-time compare).
- **Exit:** production request without the secret is refused.

### BUG-8 — Media importer is an SSRF primitive (High)

- **Where:** `src/app/api/admin/upload/route.ts` (`{ url }` JSON branch).
- **Cause:** `fetch(url, { redirect: "follow" })` on any http(s) target — loopback, RFC1918, link-local metadata (`169.254.169.254`) — with no address validation and no per-hop re-check.
- **Status:** fix in PR #21 (`src/lib/safe-fetch.ts`: DNS resolution, private-range rejection, manual redirects re-validated, streaming byte cap).
- **Residual:** DNS-rebinding window between check and fetch remains; import is admin-only.

### BUG-9 — Duplicate tag slugs in hosted content (Low, data)

- **Where:** production database.
- **Evidence:** the build prerenders `/blog/tag/2` among tag routes.
- **Cause:** numeric/junk tags exist as rows; `allTags()` slugifies them verbatim.
- **Status:** no code change planned. Requires content cleanup by the owner (production data must not be edited by agents).

### BUG-10 — No `/series` index route (Low)

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
