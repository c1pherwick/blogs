import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LatestSection } from "@/components/site/LatestSection";
import { allTags, allTopics, getPostsByTag, getTagName } from "@/lib/data";
import styles from "./tag.module.scss";
import { routes } from "@/lib/routes";

export async function generateStaticParams() {
  return (await allTags()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = await getTagName(slug);
  if (!name) return {};
  const title = `${name} — tagged posts`;
  const description = `All posts tagged ${name}.`;
  return {
    title,
    description,
    alternates: { canonical: routes.tag(slug) },
    openGraph: { url: routes.tag(slug), title, description, type: "website" },
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = await getTagName(slug);
  if (!name) notFound();

  const posts = await getPostsByTag(slug);
  const cats = await allTopics();
  const topics = cats.map((c) => ({ slug: c.slug, name: c.name }));
  const tags = await allTags();
  // Keep the current tag visible even when it falls outside the top list.
  const tagRail = tags.slice(0, 14);
  if (!tagRail.some((t) => t.slug === slug)) {
    const current = tags.find((t) => t.slug === slug);
    if (current) tagRail[tagRail.length - 1] = current;
  }

  return (
    <>
      <div className={styles.hero}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href={routes.home}>Home</Link>
          <span aria-hidden="true">›</span>
          <Link href={routes.blog}>Feed</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{name}</span>
        </nav>
        <p className={styles.kicker}>Tag</p>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.lede}>
          {posts.length} {posts.length === 1 ? "story" : "stories"} tagged {name}.
        </p>
        <div className={styles.tags}>
          {tagRail.map((t) => (
            <Link key={t.slug} href={routes.tag(t.slug)} className={`pill ${t.slug === slug ? "pill-active" : ""}`}>
              {t.name}
            </Link>
          ))}
        </div>
      </div>

      <LatestSection posts={posts} topics={topics} title={`Stories tagged ${name}`} variant="grid" />
    </>
  );
}
