import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PostCard } from "@/components/blog/PostCard";
import { allTopics, getAllPosts } from "@/lib/data";
import { countLabel } from "@/lib/dates";
import { routes } from "@/lib/routes";
import styles from "./blog.module.scss";

const description = "Every post from newest to oldest.";

export const metadata: Metadata = {
  title: "Feed",
  description,
  alternates: { canonical: routes.blog },
  openGraph: { url: routes.blog, title: "Feed", description },
};

export default async function BlogPage() {
  const [all, topics] = await Promise.all([getAllPosts(), allTopics()]);
  const posts = [...all].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const topicBySlug = new Map(topics.map((t) => [t.slug, t]));
  const activeTopics = topics.filter((t) => t.count > 0);

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <Breadcrumb items={[{ label: "Home", href: routes.home }, { label: "Feed" }]} />
        <h1 className={styles.title}>All stories</h1>
        <p className={styles.lede}>
          Everything published so far, newest first — nothing pinned, nothing hidden.
        </p>

        {activeTopics.length > 0 ? (
          <nav className={styles.topics} aria-label="Browse by topic">
            {activeTopics.map((topic) => (
              <Link key={topic.slug} href={routes.category(topic.slug)} className={styles.topic}>
                {topic.name}
                <span className={styles.topicCount}>{topic.count}</span>
              </Link>
            ))}
          </nav>
        ) : null}
      </header>

      {posts.length > 0 ? (
        <section aria-labelledby="updates-heading">
          <div className={styles.sectionHead}>
            <h2 id="updates-heading" className={styles.sectionTitle}>
              More updates
            </h2>
            <p className={styles.sectionCount}>{countLabel(posts.length)}</p>
          </div>

          <ul className={styles.grid}>
            {posts.map((post) => (
              <li key={post.slug} className={styles.cell}>
                <PostCard post={post} pastel={topicBySlug.get(post.category)?.pastel} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className={styles.empty}>Nothing published yet — the first story will land right here.</p>
      )}
    </div>
  );
}
