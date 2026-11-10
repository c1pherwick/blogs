# Changelog

Notable changes, newest first. Dates are commit dates (2026).

## 2026-11-10

### Added
- `docs/agent-operating-docs`: project operating documents (status, architecture, plan, tasks, bugs, security register, handoff) — this branch.
- PR #48 — shared `LoadingState`, labelled table regions (`role="region"` + `aria-label`), `EmptyState.onAction`, `Segmented` as a labelled button group with `aria-pressed`, error toasts as `role="alert"`, and record-specific delete confirmations for single comments and messages (14 files).
- PR #41 — `/series` index page, topic/tag discovery tightening, sitemap/route updates.
- PR #26 — GitHub Actions quality gates (typecheck, lint, tests, build), ESLint config, Vitest, `docs/quality-gates.md`.
- PR #21 — `src/lib/security.ts`, `src/lib/safe-fetch.ts` (SSRF-safe importer), cron fail-closed, CSRF origin check, `server-only` on `env.ts`, `docs/security-audit.md`, security tests.
- PR #29 — public newsletter/contact/unsubscribe form hardening.
- PR #27 / #23 — homepage de-duplication (`src/lib/home-selection.ts` + tests).
- PR #38 — restore the approved October 29 tree (`dd25e36`), removing `route-inventory.md` added by #20.
- Commit `32e94f1` (Kilo) — `src/lib/env.ts` marked `server-only`.
- PR #20 (merged) — route-quality inventory across App Router, admin, API and metadata surfaces.

### Fixed
- **Editor data safety (PR #50):** `Cmd/Ctrl+S` no longer demotes a published post to draft; block deletion offers an undo; a missing headline is explained inline with focus moved to the field; deleting a post uses the shared confirm dialog instead of `window.confirm`.
- Ad-hoc Studio loading text replaced with one accessible component; tables and confirmations made consistent across Posts, Authors, Comments, Inbox, Topics, Series, Gallery, Media and Settings.
- Header drawer focus containment and overlay labelling (#44).
- Article reading progress accuracy and image failure fallbacks (#42).
- Search filter preservation and parameter validation (#40).
- Gallery album fallbacks and photo labels (#43).
- Utility, error and not-found page polish (#39).
- Semantic tokens, high-contrast focus ring and reduced-motion guardrails (#45).

## 2026-10-29 — approved visual baseline (`dd25e36`)

- Reliable desktop text-to-speech, polished drawer, cleaner phone subscribe card.
- Header: clean mobile bar, drawer connected to it; mobile search links to `/search`.
- Content: series renamed to *Hacker's Handbook*.
- Admin: import media from a URL in every picker.
- Article: one media box for photos, video, embeds and carousels; diagrams keep their full frame; photos no longer open a lightbox; stronger callout tones; comments form stacks on phones.

## 2026-10-28

- Resources library, block style variants, featured badge.
- Pin any post to the featured band from Settings; legacy TOC blocks no longer fail saves.
- Related stories ranked by series, tags, topics and cross-links.
- Media blocks share a 16/9 box; CTAs rendered as related-tout cards.
- First gallery photo loads eagerly (LCP).
