import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { allTopics, getAllPosts } from "@/lib/data";
import { countLabel, formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";
import styles from "./blog.module.scss";

const description = "Every post from newest to oldest.";

export const metadata: Metadata = {
  title: "Feed",
  description,
  alternates: { canonical: routes.blog },
  openGraph: { url: routes.blog, title: "Feed", description },
};

const ArrowRight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default async function BlogPage() {
  const [all, topics] = await Promise.all([getAllPosts(), allTopics()]);
  const posts = [...all].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const topicBySlug = new Map(topics.map((t) => [t.slug, t]));
  const activeTopics = topics.filter((t) => t.count > 0);
  const [lead, ...rest] = posts;
  const latest = lead?.date;

  const labelFor = (slug: string) => topicBySlug.get(slug)?.name ?? slug;
  const pastelFor = (slug: string) => topicBySlug.get(slug)?.pastel ?? "gray";

  return (
    <div className={styles.wrap}>
      <header className={styles.masthead}>
        <Breadcrumb items={[{ label: "Home", href: routes.home }, { label: "Feed" }]} />

        <div className={styles.mastheadRow}>
          <div className={styles.mastheadText}>
            <p className={styles.eyebrow}>The archive</p>
            <h1 className={styles.title}>All stories</h1>
            <p className={styles.lede}>
              Everything published so far, newest first. No featured slot, no topic privileges — just
              the work in the order it landed.
            </p>
          </div>

          {posts.length > 0 ? (
            <dl className={styles.stats}>
              <div className={styles.stat}>
                <dt className={styles.statLabel}>Stories</dt>
                <dd className={styles.statValue}>{posts.length}</dd>
              </div>
              <div className={styles.stat}>
                <dt className={styles.statLabel}>Topics</dt>
                <dd className={styles.statValue}>{activeTopics.length}</dd>
              </div>
              <div className={styles.stat}>
                <dt className={styles.statLabel}>Latest</dt>
                <dd className={styles.statValue}>{latest ? formatDate(latest) : "—"}</dd>
              </div>
            </dl>
          ) : null}
        </div>

        {activeTopics.length > 0 ? (
          <nav className={styles.topics} aria-label="Browse by topic">
            {activeTopics.map((topic) => (
              <Link key={topic.slug} href={routes.category(topic.slug)} className={styles.topic}>
                <span className={styles.topicName}>{topic.name}</span>
                <span className={styles.topicCount}>{topic.count}</span>
              </Link>
            ))}
          </nav>
        ) : null}
      </header>

      {lead ? (
        <article className={styles.lead}>
          <div className={styles.leadText}>
            <p className={styles.kicker}>
              <span className={styles.kickerTag}>Latest</span>
              {labelFor(lead.category)}
            </p>
            <h2 className={styles.leadTitle}>
              <Link href={routes.post(lead.slug)}>{lead.title}</Link>
            </h2>
            <p className={styles.leadDesc}>{lead.description}</p>
            <div className={styles.leadFoot}>
              <p className={styles.meta}>
                {formatDate(lead.date, { long: true })} <span aria-hidden="true">·</span>{" "}
                {lead.readingMinutes} min read
              </p>
              <Link href={routes.post(lead.slug)} className={styles.leadCta}>
                Read the story
                <ArrowRight />
              </Link>
            </div>
          </div>

          <Link href={routes.post(lead.slug)} className={styles.leadMedia} tabIndex={-1} aria-hidden="true">
            {lead.cover ? (
              <Image
                src={lead.cover.src}
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 100vw, 640px"
                className={styles.leadImg}
              />
            ) : (
              <span className={`${styles.leadPlate} pastel-${pastelFor(lead.category)}`}>
                <span className={styles.plateName}>{labelFor(lead.category)}</span>
              </span>
            )}
          </Link>
        </article>
      ) : (
        <p className={styles.empty}>Nothing published yet — the first story will land right here.</p>
      )}

      {rest.length > 0 ? (
        <section className={styles.index} aria-label="More stories">
          <div className={styles.indexHead}>
            <h2 className={styles.indexTitle}>The index</h2>
            <p className={styles.indexCount}>{countLabel(rest.length)}</p>
          </div>

          <ol className={styles.rows}>
            {rest.map((post, i) => (
              <li key={post.slug} className={styles.row}>
                <span className={styles.rowNo} aria-hidden="true">
                  {String(i + 2).padStart(2, "0")}
                </span>

                <div className={styles.rowBody}>
                  <p className={styles.rowKicker}>
                    {labelFor(post.category)}
                    {post.featured ? <span className={styles.rowFlag}>Featured</span> : null}
                  </p>
                  <h3 className={styles.rowTitle}>
                    <Link href={routes.post(post.slug)} className={styles.rowLink}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className={styles.rowDesc}>{post.description}</p>
                  <p className={styles.meta}>
                    {formatDate(post.date)} <span aria-hidden="true">·</span> {post.readingMinutes} min read
                  </p>
                </div>

                {post.cover ? (
                  <Link href={routes.post(post.slug)} className={styles.rowThumb} tabIndex={-1} aria-hidden="true">
                    <Image
                      src={post.cover.src}
                      alt=""
                      fill
                      sizes="(max-width: 560px) 0px, 168px"
                      className={styles.rowImg}
                    />
                  </Link>
                ) : (
                  <span className={`${styles.rowThumb} ${styles.rowThumbPlate} pastel-${pastelFor(post.category)}`} aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
