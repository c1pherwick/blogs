import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";
import styles from "./PostCard.module.scss";

const ArrowRight = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* One blog.google-style card: an inset rounded cover, the headline, the date
   line, and a "Read article" pill. The headline is the only link in the tab
   order; its ::after stretches over the card so the whole card is clickable,
   while the pill stays decorative. Posts without a cover fall back to their
   topic's aurora plate rather than a grey box. */
export function PostCard({ post, pastel = "gray" }: { post: Post; pastel?: string }) {
  return (
    <article className={styles.card}>
      <Link href={routes.post(post.slug)} className={styles.media} tabIndex={-1} aria-hidden="true">
        {post.cover ? (
          <Image
            src={post.cover.src}
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 400px"
            className={styles.img}
          />
        ) : (
          <span className={`${styles.plate} pastel-${pastel}`} />
        )}
      </Link>

      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={routes.post(post.slug)}>{post.title}</Link>
        </h3>
        <p className={styles.meta}>
          {formatDate(post.date)} <span aria-hidden="true">·</span> {post.readingMinutes} min read
        </p>
        <span className={styles.cta} aria-hidden="true">
          Read article
          <ArrowRight />
        </span>
      </div>
    </article>
  );
}
