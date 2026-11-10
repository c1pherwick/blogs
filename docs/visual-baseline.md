# Visual Regression Baseline — October 29 UI (dd25e36)

This document describes the visual regression baseline for the approved
October 29, 2026 UI of `c1pherwick/blogs`.

## Purpose

Protect the approved October 29 design from unintended visual changes.
Future UI changes must include before/after screenshots in their PRs when
the visual behavior changes materially. The baseline snapshots are tied to
commit `dd25e36` and are updated only when the repository owner explicitly
approves a visual change.

## Tooling

- **Playwright** — browser automation and screenshot capture
- **Test project**: `visual-baseline` (desktop) and `visual-baseline-mobile` (mobile)
- **Baseline screenshots**: `tests/visual/baseline.spec.ts-snapshots/`
- **Test file**: `tests/visual/baseline.spec.ts`
- **Playwright config**: `playwright.config.ts`

## Viewports

| Project | Viewport | Device |
|---------|----------|--------|
| `visual-baseline` | 1280×720 | Desktop Chrome |
| `visual-baseline-mobile` | 375×667 | Pixel 5 |

## Routes Captured

### Automatically captured (desktop + mobile)

| Route | Name | Description |
|-------|------|-------------|
| `/` | home | Homepage |
| `/blog` | blog-feed | Public feed of posts |
| `/gallery` | gallery-index | Gallery index page |
| `/newsletter` | newsletter | Newsletter signup page |
| `/personal` | personal | Personal stories page |
| `/privacy` | privacy | Privacy page |
| `/resources` | resources | Resources page |
| `/search` | search | Search page |
| `/topics` | topics | Topics index page |
| `/tags` | tags | Tags index page |
| `/about` | about | About page |

### Not captured automatically — requires manual capture

#### Dynamic data required

| Route | Reason | Required data |
|-------|--------|---------------|
| `/blog/[slug]` | Dynamic post content | A specific published post slug |
| `/blog/category/[slug]` | Category-specific posts | Posts in that category |
| `/gallery/[slug]` | Album-specific photos | An album with photos |
| `/series/[slug]` | Series-specific posts | A live series with posts |
| `/unsubscribe` | Query parameters | `?e=email&t=token` |

#### Admin Studio (authentication required)

| Route | Reason |
|-------|--------|
| `/admin/login` | Admin login page |
| `/admin/dashboard` | Requires admin session |
| `/admin/posts` | Requires admin session |
| `/admin/posts/new` | Requires admin session |
| `/admin/posts/[id]/edit` | Requires admin session + post |
| `/admin/albums` | Requires admin session |
| `/admin/series` | Requires admin session |
| `/admin/topics` | Requires admin session |
| `/admin/subscribers` | Requires admin session |
| `/admin/media` | Requires admin session |
| `/admin/comments` | Requires admin session |
| `/admin/messages` | Requires admin session |
| `/admin/settings` | Requires admin session |

## Commands

### Install dependencies (first time only)

```bash
npm install
npx playwright install chromium
```

### Generate/update baseline screenshots

```bash
# Update all baseline snapshots
npm run test:update-snapshots

# Or update only desktop or mobile
npx playwright test --project=visual-baseline --update-snapshots
npx playwright test --project=visual-baseline-mobile --update-snapshots
```

### Run visual regression checks (compare against baselines)

```bash
# Run all visual baseline tests
npm run test:visual

# Run only desktop
npx playwright test --project=visual-baseline

# Run only mobile
npx playwright test --project=visual-baseline-mobile
```

### Run in CI

```bash
CI=true npm run test:visual
```

## How to compare screenshots

When a UI change is made:

1. Run the visual regression tests: `npm run test:visual`
2. Any failing tests will show a diff report in `playwright-report/`
3. Review the diffs — if they are intentional, update the baselines:
   ```bash
   npm run test:update-snapshots
   ```
4. Commit the updated baseline screenshots alongside the UI changes
5. Include before/after screenshots in the PR description

## Dynamic regions

The following elements may vary between runs and are noted here:

- **Homepage**: Spotlight rail order depends on post dates and featured flags
- **Gallery index**: Album count and cover images depend on gallery data
- **Personal page**: Story list depends on published personal posts
- **Footer**: Current year in copyright may change over time

These are inherent to the approved design and are not considered regressions
unless the layout or styling changes.

## Updating the baseline

Baseline screenshots may only be updated when the repository owner
explicitly approves a visual change. Do not update baselines to match
unintended UI drift — fix the underlying issue instead.

## File structure

```
tests/
  visual/
    baseline.spec.ts          # Visual regression test
    baseline.spec.ts-snapshots/  # Baseline screenshot directory
      home-desktop-visual-baseline-linux.png
      home-mobile-visual-baseline-linux.png
      ... (etc.)
playwright.config.ts          # Playwright configuration
docs/
  visual-baseline.md          # This document
```

## Known limitations

1. No CI/CD is configured yet — visual checks must be run locally or in CI
   once it is added (see Issue #14).
2. Admin Studio pages cannot be captured automatically because they require
   authentication. Capture them manually with admin credentials.
3. Dynamic routes (`/blog/[slug]`, `/gallery/[slug]`, etc.) require specific
   test data. Capture them manually when that data is available.
4. Screenshots are full-page captures; sticky headers, modals, and cookie
   banners may affect layout if present.
5. The `webServer` in `playwright.config.ts` builds and starts the app
   before running tests. This requires a successful `next build`.
