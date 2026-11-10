import Link from "next/link";
import styles from "./not-found.module.scss";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>This page took a wrong turn.</h1>
      <p className={styles.body}>
        The link may be old, or the post may have moved. Search the archive, or start from one of the
        sections below.
      </p>

      <form action={routes.search} method="get" className={styles.search} role="search">
        <label htmlFor="not-found-search" className="sr-only">Search the site</label>
        <input
          id="not-found-search"
          type="search"
          name="q"
          placeholder="Search stories, topics, and ideas…"
          autoComplete="off"
          className={styles.searchInput}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <nav className={styles.links} aria-label="Helpful destinations">
        <Link href={routes.home} className="btn btn-outline">Home</Link>
        <Link href={routes.blog} className="btn btn-outline">All posts</Link>
        <Link href={routes.topics} className="btn btn-outline">Topics</Link>
        <Link href={routes.gallery} className="btn btn-outline">Gallery</Link>
      </nav>
    </div>
  );
}
