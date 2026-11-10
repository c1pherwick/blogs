# Project Status

Maintained by **Freebuff** (project lead). Last updated: 2026-11-10.

## Identity

| Field | Value |
| --- | --- |
| Product | Field Notes — personal + professional blog |
| Repo | `bishnuneup4ne/blogs` (origin) ↔ `c1pherwick/blogs` (upstream, same history) |
| Stack | Next.js 16.2.6 (App Router), React 19.2.6, TypeScript strict, CSS Modules/SCSS |
| Data | Supabase Postgres + Storage (service-role, server-only) with file-based fallback |
| Deploy | Vercel (preview per PR, cron for scheduled publishing) |
| Approved UI baseline | `dd25e36` — October 29, 2026 |

## Verified health (2026-11-10)

| Check | Result |
| --- | --- |
| `npm run typecheck` on `kilo/restore-october-29` | exit 0 |
| `npm run build` on `kilo/restore-october-29` | exit 0 |
| Test suite on the baseline | none — tests exist only on PR branches |
| Open PRs with green Vercel checks | 19 of 19 |
| Secrets tracked in git | none (`.env*` ignored except `.env.example`) |

## Branch and PR landscape

19 open PRs, 1 merged (#20). Three efforts are in flight:

1. **Rollback** — PR #38 (`kilo/restore-october-29`) restores the tracked tree to `dd25e36`. It originally differed from `main` only by deleting `route-inventory.md`. **Kilo added commit `32e94f1` (`env.ts` → `server-only`) on this branch on 2026-11-10**, so the PR's "matches `dd25e36` exactly" claim is no longer true and must be restated or the commit moved.
2. **Fix stack** — PRs #39 → #47, nine cumulative commits covering issues 18, 6, 7, 5, 8, 4, 2/3/13, 16 and 9. All target `main`; they must be merged bottom-up.
3. **Independent fixes** — #21 (security, High severity), #26 (CI, based on #21), #27/#23 (duplicate homepage fixes), #29 (public forms), #48 (admin consistency, on top of the stack).

Copilot drafts #22, #24, #25 are no-ops awaiting closure by the owner.

## Current risk register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| SSRF in media import + cron fail-open remain on `main` | High / Medium | Fix written and green in PR #21 — needs merge authorization |
| Fix stack must merge in order | Silently dropped commits if merged out of order | Merge #39 → #47 sequentially |
| Duplicate PRs (#23/#27) | Conflicting edits to `index` home page | Keep #27, close #23 |
| PR #38 invariant broken by `32e94f1` | Reviewers cannot trust the rollback claim | Restate scope or move the commit |
| Two agents in one worktree | Branch switches can land mid-edit | Coordinate through `AGENT_HANDOFF.md`; one writer at a time |

## Where to look next

`AGENT_HANDOFF.md` for the current assignment, `TASKS.md` for the backlog, `BUGS.md` and `SECURITY_AUDIT.md` for defect detail.
