import { describe, expect, it } from "vitest";
import { selectHomePosts } from "../src/lib/home-selection";
import type { Post } from "../src/lib/types";

function post(slug: string, date: string, category = "engineering", featured = false): Post {
  return {
    slug,
    title: slug,
    description: `${slug} description`,
    date,
    readingMinutes: 3,
    category,
    tags: [],
    featured,
    author: { name: "Bishnu", role: "", avatar: "/avatar.jpg" },
    blocks: [],
  };
}

const allSlugs = (selection: ReturnType<typeof selectHomePosts>) => [
  ...selection.spotlight.map((p) => p.slug),
  ...(selection.journalFeature ? [selection.journalFeature.slug] : []),
  ...selection.journalRail.map((p) => p.slug),
];

describe("selectHomePosts", () => {
  it("returns clean empty state", () => {
    const selection = selectHomePosts([]);
    expect(selection.spotlight).toEqual([]);
    expect(selection.journalFeature).toBeNull();
    expect(selection.journalRail).toEqual([]);
  });

  it("does not repeat a personal featured post in the spotlight", () => {
    const posts = [
      post("personal-older", "2026-01-01", "personal", true),
      post("news", "2026-02-01", "engineering", true),
      post("guide", "2026-03-01", "engineering"),
    ];
    const selection = selectHomePosts(posts);
    expect(selection.journalFeature?.slug).toBe("personal-older");
    expect(selection.spotlight.map((p) => p.slug)).not.toContain("personal-older");
    expect(new Set(allSlugs(selection)).size).toBe(allSlugs(selection).length);
  });

  it("keeps featured-first ordering in the spotlight", () => {
    const posts = [
      post("plain-newest", "2026-03-01", "engineering", false),
      post("featured-older", "2026-01-01", "engineering", true),
      post("personal", "2026-02-01", "personal"),
    ];
    const selection = selectHomePosts(posts);
    expect(selection.spotlight.map((p) => p.slug)).toEqual(["featured-older", "plain-newest"]);
    expect(selection.featuredSlugs.has("featured-older")).toBe(true);
  });

  it("removes a pinned personal feature from the rail too", () => {
    const posts = [
      post("personal-a", "2026-03-01", "personal"),
      post("personal-b", "2026-02-01", "personal"),
      post("personal-c", "2026-01-01", "personal"),
    ];
    const selection = selectHomePosts(posts, { featurePostSlug: "personal-b" });
    expect(selection.journalFeature?.slug).toBe("personal-b");
    expect(selection.journalRail.map((p) => p.slug)).toEqual(["personal-a", "personal-c"]);
    expect(selection.spotlight).toEqual([]);
  });

  it("falls back to the newest personal post when the pinned slug is gone", () => {
    const posts = [
      post("personal-a", "2026-03-01", "personal"),
      post("personal-b", "2026-02-01", "personal"),
    ];
    const selection = selectHomePosts(posts, { featurePostSlug: "deleted-post" });
    expect(selection.journalFeature?.slug).toBe("personal-a");
    expect(selection.journalRail.map((p) => p.slug)).toEqual(["personal-b"]);
  });

  it("keeps the newest personal story in the rail when a non-personal post is pinned", () => {
    const posts = [
      post("pinned", "2026-04-01", "engineering"),
      post("personal-a", "2026-03-01", "personal"),
      post("personal-b", "2026-02-01", "personal"),
    ];
    const selection = selectHomePosts(posts, { featurePostSlug: "pinned" });
    expect(selection.journalFeature?.slug).toBe("pinned");
    expect(selection.journalRail.map((p) => p.slug)).toEqual(["personal-a", "personal-b"]);
    expect(selection.spotlight.map((p) => p.slug)).not.toContain("pinned");
  });

  it("shows only the pinned feature when there are no personal posts", () => {
    const posts = [post("pinned", "2026-04-01", "engineering")];
    const selection = selectHomePosts(posts, { featurePostSlug: "pinned" });
    expect(selection.journalFeature?.slug).toBe("pinned");
    expect(selection.journalRail).toEqual([]);
  });

  it("never repeats a slug and respects limits", () => {
    const posts = Array.from({ length: 20 }, (_, index) =>
      post(`post-${index}`, `2026-01-${String(index + 1).padStart(2, "0")}`, index % 3 === 0 ? "personal" : "engineering"),
    );
    const selection = selectHomePosts(posts, { spotlightLimit: 5, journalLimit: 4 });
    const slugs = allSlugs(selection);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(selection.spotlight.length).toBeLessThanOrEqual(5);
    expect(selection.journalRail.length).toBeLessThanOrEqual(4);
  });
});
