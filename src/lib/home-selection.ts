import type { Post } from "@/lib/types";

export interface HomeSelectionOptions {
  /** Slug pinned in Settings → featured band. Missing/deleted slugs fall back. */
  featurePostSlug?: string;
  /** Maximum stories in the spotlight rail. */
  spotlightLimit?: number;
  /** Maximum stories in the personal-journal band (feature + rail). */
  journalLimit?: number;
}

export interface HomeSelection {
  spotlight: Post[];
  journalFeature: Post | null;
  journalRail: Post[];
  featuredSlugs: Set<string>;
}

function byNewest(a: Post, b: Post): number {
  const at = new Date(a.date).getTime();
  const bt = new Date(b.date).getTime();
  const safeA = Number.isFinite(at) ? at : 0;
  const safeB = Number.isFinite(bt) ? bt : 0;
  if (safeB !== safeA) return safeB - safeA;
  return a.slug.localeCompare(b.slug);
}

/**
 * Split the homepage into non-overlapping story sets.
 *
 * Rule: a post rendered in the personal-journal band (featured story or rail)
 * is removed from the spotlight rail. The spotlight keeps featured-first
 * ordering, and the pinned Settings slug wins over the newest personal post.
 * This guarantees a post appears at most once on the homepage even when it is
 * both featured and personal.
 */
export function selectHomePosts(
  posts: Post[],
  options: HomeSelectionOptions = {},
): HomeSelection {
  const { featurePostSlug = "", spotlightLimit = 8, journalLimit = 6 } = options;

  // De-duplicate by slug, newest first.
  const seen = new Set<string>();
  const byDate = [...posts].sort(byNewest).filter((post) => {
    if (seen.has(post.slug)) return false;
    seen.add(post.slug);
    return true;
  });

  const featured: Post[] = [];
  const rest: Post[] = [];
  for (const post of byDate) {
    (post.featured ? featured : rest).push(post);
  }
  const combined = [...featured, ...rest];

  const personal = byDate.filter((post) => post.category === "personal");
  const pinned = featurePostSlug
    ? posts.find((post) => post.slug === featurePostSlug) ?? null
    : null;
  const journalFeature = pinned ?? personal[0] ?? null;

  const personalBudget =
    journalLimit - (journalFeature && journalFeature.category === "personal" ? 1 : 0);
  const journalRail = personal
    .filter((post) => post.slug !== journalFeature?.slug)
    .slice(0, Math.max(0, personalBudget));

  const inJournal = new Set<string>();
  if (journalFeature) inJournal.add(journalFeature.slug);
  for (const post of journalRail) inJournal.add(post.slug);

  const spotlight = combined.filter((post) => !inJournal.has(post.slug)).slice(0, spotlightLimit);

  return {
    spotlight,
    journalFeature,
    journalRail,
    featuredSlugs: new Set(featured.map((post) => post.slug)),
  };
}
