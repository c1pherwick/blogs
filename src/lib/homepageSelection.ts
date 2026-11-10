import type { Post } from "@/lib/types";

interface HomePageSelectionInput {
  posts: Post[];
  featurePostSlug: string;
}

export interface HomePageSelection {
  spotlightPosts: Post[];
  spotlightFeaturedSlugs: Set<string>;
  personalPosts: Post[];
  journalFeaturePost?: Post;
  journalRailPosts: Post[];
}

/**
 * Homepage rail selection rules:
 * - Personal posts render in the journal feature/rail, not in spotlight.
 * - Journal feature uses the pinned slug when it resolves, otherwise newest personal.
 * - The same post is excluded from both spotlight and journal rail to avoid duplicates.
 */
export function selectHomePagePosts({
  posts,
  featurePostSlug,
}: HomePageSelectionInput): HomePageSelection {
  const byDate = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const personalPosts = byDate.filter((post) => post.category === "personal").slice(0, 6);
  const pinnedFeaturePost = featurePostSlug
    ? posts.find((post) => post.slug === featurePostSlug)
    : undefined;
  const journalFeaturePost = pinnedFeaturePost ?? personalPosts[0];
  const journalRailPosts = personalPosts.filter(
    (post) => post.slug !== journalFeaturePost?.slug,
  );

  const spotlightPool = byDate.filter(
    (post) => post.category !== "personal" && post.slug !== journalFeaturePost?.slug,
  );
  const featuredSpotlightPosts = spotlightPool.filter((post) => post.featured);
  const spotlightPosts = [
    ...featuredSpotlightPosts,
    ...spotlightPool.filter((post) => !post.featured),
  ];

  return {
    spotlightPosts,
    spotlightFeaturedSlugs: new Set(featuredSpotlightPosts.map((post) => post.slug)),
    personalPosts,
    journalFeaturePost,
    journalRailPosts,
  };
}
