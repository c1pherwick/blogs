# Quality gates

CI runs on every pull request and on pushes to `main`
(`.github/workflows/ci.yml`). It installs with `npm ci` (lockfile-aware) and
runs, in order:

1. `npm run typecheck` — TypeScript strict, no emit
2. `npm run lint` — ESLint 9 flat config, Next.js core-web-vitals + TypeScript
3. `npm test` — Vitest unit tests (pure logic, security helpers, selection)
4. `npm run build` — production Next.js build without production secrets

No Supabase or email credentials are required: the data layer falls back to the
file-based demo content when the environment is empty.

## Local commands

```bash
npm ci
npm run typecheck
npm run lint          # add --fix with: npm run lint:fix
npm test              # watch mode: npm run test:watch
npm run build
```

Lint warnings are currently allowed (not errors) because the legacy codebase
predates the React Compiler rules in Next 16. Keep new code at zero errors and
avoid adding warnings. TypeScript and the production build remain hard gates.
