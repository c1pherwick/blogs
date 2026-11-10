import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts, getAllSeries } from "@/lib/data";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { routes } from "@/lib/routes";
import styles from "./series-index.module.scss";

const description = "Reading orders worth following from start to finish — every multi-part series in the archive.";

export const metadata: Metadata = {
  title: "Series",
  description,
  alternates: { canonical: routes.seriesIndex },
  openGraph: { url: routes.seriesIndex, title: "Series", description, type: "website" },
};

export default async function SeriesIndexPage() {
  const [series, posts] = await Promise.all([getAllSeries(), getAllPosts()]);
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const ordered = [...series].sort((a, b) => b.posts.length - a.posts.length);

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Home", href: routes.home },
          { label: "Topics", href: routes.topics },
          { label: "Series" },
        ]}
      />

      <header className={styles.head}>
        <h1 className={styles.title}>Series</h1>
        <p className={styles.lede}>{description}</p>
      </header>

      {ordered.length === 0 ? (
        <p className={styles.empty}>
          No series published yet. <Link href={routes.blog}>Browse the full feed</Link> in the meantime.
        </p>
      ) : (
        <ul className={styles.grid}>
          {ordered.map((entry) => {
            const minutes = entry.posts.reduce(
              (sum, part) => sum + (bySlug.get(part.slug)?.readingMinutes ?? 0),
              0,
            );
            return (
              <li key={entry.slug}>
                <article className={styles.card}>
                  <Link href={routes.series(entry.slug)} className={styles.media} tabIndex={-1} aria-hidden="true">
                    {entry.cover ? (
                      <Image
                        src={entry.cover}
                        alt=""
                        fill
                        sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 400px"
                        className={styles.cover}
                      />
                    ) : (
                      <span className={styles.fallback} />
                    )}
                  </Link>
                  <div className={styles.body}>
                    <h2 className={styles.cardTitle}>
                      <Link href={routes.series(entry.slug)}>{entry.title}</Link>
                    </h2>
                    {entry.description ? <p className={styles.cardDesc}>{entry.description}</p> : null}
                    <p className={styles.meta}>
                      {entry.posts.length} {entry.posts.length === 1 ? "part" : "parts"}
                      {minutes > 0 ? (
                        <>
                          <span aria-hidden="true">·</span> {minutes} min total
                        </>
                      ) : null}
                    </p>
                    <Link href={routes.series(entry.slug)} className={styles.cta}>
                      View series
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
