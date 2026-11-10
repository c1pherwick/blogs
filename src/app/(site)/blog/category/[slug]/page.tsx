import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allTopics, getPostsByCategory } from "@/lib/data";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PostCard } from "@/components/blog/PostCard";
import { countLabel } from "@/lib/dates";
import { routes } from "@/lib/routes";
import styles from "./category.module.scss";

export async function generateStaticParams() {
  const categories = await allTopics();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await allTopics();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};
  const path = routes.category(category.slug);
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: path },
    openGraph: { url: path, title: category.name, description: category.description, type: "website" },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await allTopics();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const posts = [...(await getPostsByCategory(category.slug))].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const otherTopics = categories.filter((c) => c.slug !== category.slug && c.count > 0);

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <Breadcrumb items={[{ label: "Home", href: routes.home }, { label: "Topics", href: routes.topics }, { label: category.name }]} />
        <h1 className={styles.title}>{category.name}</h1>
        <p className={styles.lede}>{category.description}</p>
        <p className={styles.count}>{countLabel(posts.length)}</p>
      </header>

      {posts.length > 0 ? (
        <section aria-labelledby="topic-posts">
          <div className={styles.sectionHead}>
            <h2 id="topic-posts" className={styles.sectionTitle}>
              More updates
            </h2>
          </div>

          <ul className={styles.grid}>
            {posts.map((post) => (
              <li key={post.slug} className={styles.cell}>
                <PostCard post={post} pastel={category.pastel} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className={styles.empty}>Nothing filed here yet. The first story will land right here.</p>
      )}

      {otherTopics.length > 0 ? (
        <section className={styles.topics} aria-labelledby="other-topics">
          <h2 id="other-topics" className={styles.sectionTitle}>
            Explore other topics
          </h2>
          <nav className={styles.topicRail} aria-label="Other topics">
            {otherTopics.map((t) => (
              <Link key={t.slug} href={routes.category(t.slug)} className={styles.topic}>
                {t.name}
                <span className={styles.topicCount}>{t.count}</span>
              </Link>
            ))}
          </nav>
        </section>
      ) : null}
    </div>
  );
}
