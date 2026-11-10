# Development Plan

Owner: **Freebuff** (planning, review, acceptance). Implementation: **Kilo Code** (see `AGENT_HANDOFF.md`).

## Guiding constraints

1. The October 29 UI (`dd25e36`) is the approved visual baseline. UI changes need before/after evidence.
2. One writer per worktree. Agents coordinate through `AGENT_HANDOFF.md`, not through assumptions.
3. No merges, force-pushes or branch deletions without owner authorization.
4. Free tooling only — no paid model, credit, or billing fallback.

## Phase 0 — Reduce the backlog to a mergeable state (current)

Goal: stop adding stacked branches until the existing 19 PRs have landed.

1. Authorize and merge **#21** (security: SSRF, cron fail-closed, CSRF origin, `server-only`). Highest severity in the repo.
2. Rebase **#26** (CI quality gates) onto `main` and merge it; CI must run before the UI stack lands.
3. Merge the fix stack **#39 → #47 in order**, bottom-up. Each later PR then shrinks to one commit.
4. Decide **#38**: either keep `route-inventory.md` (restore it) or accept its deletion. Reconcile Kilo's `32e94f1` (`env.ts` `server-only`) — it duplicates PR #21 and breaks #38's stated invariant.
5. Merge **#48** (admin consistency) — becomes a single commit once the stack is in.
6. Resolve duplicates: keep one of **#23/#27**; close the Copilot drafts **#22/#24/#25**.

Exit criteria: `main` carries the security fixes, CI runs on every PR, and at most one UI PR remains open.

## Phase 1 — Close the audit backlog (#11, #12, #28)

| Item | Approach | Notes |
| --- | --- | --- |
| #11 Block editor | Read `PostEditor.tsx` end-to-end; fix confirmed defects only (block add/remove/reorder, save-state feedback, unsaved-change guard, keyboard access). | Large file (~1.4k lines). Branch from the stack tip after Phase 0. |
| #12 Media library | Client-side type/size messaging mirroring the server's magic-byte rules; upload progress/retry; deletion impact warning. | Server side already hardened in PR #21. |
| #28 Visual baseline | Documentation-first: record routes/viewports, add screenshots only if a headless browser is available. | No Chrome in the current environment; no snapshot tooling in the repo. |

## Phase 2 — Platform enhancements (#30–#37)

Suggested order, highest product value first:

1. #34 auditable activity log for sensitive Studio actions.
2. #30 content export + restore (backup safety).
3. #33 subscriber preferences + unsubscribe lifecycle completion.
4. #32 comment moderation / spam workflow.
5. #35 error monitoring + operational diagnostics.
6. #36 dependency and supply-chain checks.
7. #31 post revision history hardening (UI already exists).
8. #37 owner/contributor handbook.

## Phase 3 — Quality ratchet

- Keep CI mandatory (typecheck, lint, tests, build).
- Add focused tests only where behaviour is subtle: content selection, sanitization, auth checks, rate-limit boundaries.
- Preserve the approved design language; no speculative redesigns.
