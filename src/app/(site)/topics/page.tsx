import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { allTopics, getAllSeries, getAlbums } from "@/lib/data";
import { ArrowRight } from "@/components/icons/Icons";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { countLabel } from "@/lib/dates";
import styles from "./topics.module.scss";
import { routes } from "@/lib/routes";

const description = "Browse the themes I write under, the series worth reading in order, and the photo collections.";

export const metadata: Metadata = {
  title: "Topics",
  description,
  alternates: { canonical: "/topics" },
  openGraph: { url: "/topics", title: "Topics", description },
};

export default async function CategoriesPage() {
  const [topics, albums, allSeries] = await Promise.all([allTopics(), getAlbums(), getAllSeries()]);
  /* Every topic is listed — an empty one just shows "No stories yet". */
  const writing = [...topics].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const series = [...allSeries].sort((a, b) => b.posts.length - a.posts.length);

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <Breadcrumb items={[{ label: "Home", href: routes.home }, { label: "Topics" }]} />
        <h1 className={styles.title}>Topics</h1>
        <p className={styles.lede}>
          The themes I write under, plus the photo collections. Looking for something narrower?{" "}
          <Link href={routes.tags}>Browse the tags</Link>.
        </p>
        <nav className={styles.jump} aria-label="Jump to section">
          <a href="#writing" className={styles.jumpChip}>Writing</a>
          {series.length > 0 ? <a href="#series" className={styles.jumpChip}>Series</a> : null}
          {albums.length > 0 ? <a href="#albums" className={styles.jumpChip}>Photo collections</a> : null}
        </nav>
      </header>

      <section id="writing" className={styles.section} aria-labelledby="writing-heading">
        <h2 id="writing-heading" className={styles.sectionTitle}>Writing topics</h2>

        <ul className={styles.grid}>
          {writing.map((topic) => (
            <li key={topic.slug} className={styles.cell}>
              <article className={styles.card}>
                <Link href={routes.category(topic.slug)} className={styles.media} tabIndex={-1} aria-hidden="true">
                  {topic.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={topic.image} alt="" loading="lazy" className={styles.img} />
                  ) : (
                    <span className={`${styles.plate} pastel-${topic.pastel}`}>
                      <span className={styles.plateMark}>{topic.name.charAt(0)}</span>
                    </span>
                  )}
                </Link>

                <div className={styles.body}>
                  <h3 className={styles.cardTitle}>
                    <Link href={routes.category(topic.slug)}>{topic.name}</Link>
                  </h3>
                  <p className={styles.desc}>
                    {topic.description || "Stories filed under this topic as they publish."}
                  </p>
                  <p className={styles.cardMeta}>
                    {topic.count > 0 ? countLabel(topic.count) : "No stories yet"}
                  </p>
                  <span className={styles.cta} aria-hidden="true">
                    Explore topic
                    <ArrowRight width={18} height={18} />
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {series.length > 0 ? (
        <section id="series" className={styles.section} aria-labelledby="series-heading">
          <h2 id="series-heading" className={styles.sectionTitle}>Series</h2>
          <p className={styles.sectionLede}>Reading orders worth following from start to finish.</p>

          <ul className={styles.grid}>
            {series.map((s) => (
              <li key={s.slug} className={styles.cell}>
                <article className={styles.card}>
                  <Link href={routes.series(s.slug)} className={styles.media} tabIndex={-1} aria-hidden="true">
                    {s.cover ? (
                      <Image src={s.cover} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 400px" className={styles.img} />
                    ) : (
                      <span className={`${styles.plate} pastel-gray`} />
                    )}
                  </Link>

                  <div className={styles.body}>
                    <h3 className={styles.cardTitle}>
                      <Link href={routes.series(s.slug)}>{s.title}</Link>
                    </h3>
                    <p className={styles.desc}>
                      {s.description && s.description.trim().toLowerCase() !== s.title.trim().toLowerCase()
                        ? s.description
                        : "A reading order worth following from the start."}
                    </p>
                    <p className={styles.cardMeta}>{countLabel(s.posts.length)}</p>
                    <span className={styles.cta} aria-hidden="true">
                      View series
                      <ArrowRight width={18} height={18} />
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {albums.length > 0 ? (
        <section id="albums" className={styles.section} aria-labelledby="albums-heading">
          <h2 id="albums-heading" className={styles.sectionTitle}>Photo collections</h2>

          <ul className={styles.grid}>
            {albums.map((album) => (
              <li key={album.slug} className={styles.cell}>
                <article className={styles.card}>
                  <Link href={routes.album(album.slug)} className={styles.media} tabIndex={-1} aria-hidden="true">
                    {/* A coverless album has cover === "" — an empty src makes
                        the browser re-request this page as an image. */}
                    {album.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={album.cover} alt="" loading="lazy" className={styles.img} />
                    ) : (
                      <span className={`${styles.plate} pastel-gray`} />
                    )}
                  </Link>

                  <div className={styles.body}>
                    <h3 className={styles.cardTitle}>
                      <Link href={routes.album(album.slug)}>{album.title}</Link>
                    </h3>
                    <p className={styles.cardMeta}>
                      {album.photos.length} photos · {album.year}
                    </p>
                    <span className={styles.cta} aria-hidden="true">
                      Browse album
                      <ArrowRight width={18} height={18} />
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
