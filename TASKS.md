# Tasks

Status legend: **Done** = implemented and verified · **PR open** = implemented, awaiting review/merge · **In progress** · **Todo**.

## Audit backlog

| # | Title | Status | Where |
| --- | --- | --- | --- |
| 1 | Prevent duplicate personal-journal stories on the homepage | PR open (#27; duplicate #23) | `src/lib/home-selection.ts`, `src/app/(site)/page.tsx` |
| 2 | Consistent public design tokens and component styling | PR open (#45) | `src/app/tokens.css`, `src/app/base.css` |
| 3 | Responsive layouts across all public routes | PR open (#45, partial) | tokens/base + per-page modules |
| 4 | Navigation consistency and keyboard accessibility | PR open (#44) | `src/components/site/SiteHeader.tsx` |
| 5 | Article reading experience and block rendering | PR open (#42) | `ArticleProgress`, `PostContent` |
| 6 | Search results, filters and empty states | PR open (#40) | `src/app/(site)/search/*`, `SearchFiltersBar` |
| 7 | Unify topics, tags, series and discovery | PR open (#41) | `src/app/(site)/series/page.tsx` (new), topics/tags |
| 8 | Gallery and album browsing | PR open (#43) | `AlbumGrid`, `gallery/[slug]` |
| 9 | Studio navigation and shell | PR open (#47) | `AdminShell` |
| 10 | Standardize dashboard, tables, filters, feedback | **PR open (#48)** | admin `kit`, 10 pages, `Feedback` |
| 11 | Block editor usability and publishing workflow | Todo (Phase 1) | `src/components/admin/PostEditor.tsx` |
| 12 | Media library and upload workflows | Todo (Phase 1) | `src/app/admin/media`, `gallery/[id]`, upload route |
| 13 | Accessibility audit for public site and Studio | PR open (#45, partial) | tokens, focus ring, motion guardrails |
| 14 | CI for typecheck, lint, tests, build | PR open (#26 — base must move to `main`) | `.github/workflows/ci.yml` |
| 15 | Security audit of auth, APIs, secrets | PR open (#21) | `src/lib/security.ts`, `safe-fetch.ts`, docs |
| 16 | Metadata, images, Core Web Vitals | PR open (#46, robots only) | `src/app/robots.ts` |
| 17 | Newsletter, contact and public forms | PR open (#29) | `src/components/site/*Form*` |
| 18 | About, Personal, Resources, not-found polish | PR open (#39) | `(site)` pages |
| 19 | Route inventory | **Done** (#20 merged) | `route-inventory.md` |
| 28 | Preserve Oct-29 UI as visual baseline | Todo (Phase 1) | docs-only unless a browser is available |

## Platform enhancements

| # | Title | Status |
| --- | --- | --- |
| 30 | Content export + backup/restore | Todo |
| 31 | Post revision history and rollback | Todo (API + editor UI already exist) |
| 32 | Comment moderation and spam workflow | Todo |
| 33 | Subscriber preferences and unsubscribe lifecycle | Todo |
| 34 | Auditable Studio activity log | Todo |
| 35 | Production error monitoring | Todo |
| 36 | Dependency and supply-chain checks | Todo |
| 37 | Owner/contributor operations handbook | Todo |

## Maintenance chores (no issue)

- [ ] Restate or split PR #38 after Kilo's `32e94f1` (`env.ts` `server-only`).
- [ ] Close duplicate PR #23 (keep #27).
- [ ] Close Copilot drafts #22, #24, #25.
- [ ] Rebase #27 onto the restored baseline (owner's note on #38).
- [ ] Rebase #26 onto `main` after #21 merges.
- [ ] Remove the local docs worktree/branch once this documentation lands.
