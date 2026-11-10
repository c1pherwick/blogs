import { test, expect } from "@playwright/test";

/**
 * Visual regression baseline for the approved October 29 UI (commit dd25e36).
 *
 * Captures screenshots of public routes at desktop and mobile viewports.
 * These screenshots serve as the reference for future visual regression checks.
 *
 * Routes are selected to be deterministic: they render without requiring
 * production secrets, authentication, or dynamic route parameters. Routes
 * that need dynamic data (e.g. /blog/[slug], /gallery/[slug]) or admin
 * authentication are documented in docs/visual-baseline.md and must be
 * captured manually.
 *
 * Viewports:
 *   - Desktop: 1280x720 (Desktop Chrome)
 *   - Mobile: 375x667 (Pixel 5)
 */

const DESKTOP_ROUTES = [
  { path: "/", name: "home" },
  { path: "/blog", name: "blog-feed" },
  { path: "/gallery", name: "gallery-index" },
  { path: "/newsletter", name: "newsletter" },
  { path: "/personal", name: "personal" },
  { path: "/privacy", name: "privacy" },
  { path: "/resources", name: "resources" },
  { path: "/search", name: "search" },
  { path: "/topics", name: "topics" },
  { path: "/tags", name: "tags" },
  { path: "/about", name: "about" },
];

const MOBILE_ROUTES = [
  { path: "/", name: "home" },
  { path: "/blog", name: "blog-feed" },
  { path: "/gallery", name: "gallery-index" },
  { path: "/newsletter", name: "newsletter" },
  { path: "/personal", name: "personal" },
  { path: "/privacy", name: "privacy" },
  { path: "/resources", name: "resources" },
  { path: "/search", name: "search" },
  { path: "/topics", name: "topics" },
  { path: "/tags", name: "tags" },
  { path: "/about", name: "about" },
];

test.describe("visual baseline — desktop", () => {
  for (const route of DESKTOP_ROUTES) {
    test(`captures ${route.path} (${route.name})`, async ({ page }) => {
      await page.goto(route.path);
      // Wait for the page to hydrate and any dynamic content to settle.
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot(`${route.name}-desktop.png`, {
        maxDiffPixels: 10,
        maxDiffPixelRatio: 0.001,
      });
    });
  }
});

test.describe("visual baseline — mobile", () => {
  for (const route of MOBILE_ROUTES) {
    test(`captures ${route.path} (${route.name})`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot(`${route.name}-mobile.png`, {
        maxDiffPixels: 10,
        maxDiffPixelRatio: 0.001,
      });
    });
  }
});

/**
 * Routes NOT captured automatically (documented in docs/visual-baseline.md):
 *
 * Dynamic data required:
 *   /blog/[slug]           — needs a specific published post slug
 *   /blog/category/[slug]  — needs posts in that category
 *   /gallery/[slug]        — needs an album with photos
 *   /series/[slug]         — needs a live series with posts
 *   /unsubscribe           — needs ?e=email&t=token query params
 *
 * Authentication required (admin Studio):
 *   /admin/login
 *   /admin/dashboard
 *   /admin/posts
 *   /admin/posts/new
 *   /admin/posts/[id]/edit
 *   /admin/albums
 *   /admin/series
 *   /admin/topics
 *   /admin/subscribers
 *   /admin/media
 *   /admin/comments
 *   /admin/messages
 *   /admin/settings
 *
 * These should be captured manually with the --update-snapshots flag when
 * deterministic test data or admin credentials are available.
 */
