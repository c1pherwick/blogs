"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./search.module.scss";
import { routes } from "@/lib/routes";

export function SearchClear() {
  const router = useRouter();
  const params = useSearchParams();

  function clear() {
    const next = new URLSearchParams();
    // Clearing the query should not silently drop the reader's filters.
    const topic = params.get("topic");
    const sort = params.get("sort");
    if (topic) next.set("topic", topic);
    if (sort) next.set("sort", sort);
    const query = next.toString();
    router.push(query ? `${routes.search}?${query}` : routes.search);
  }

  return (
    <button
      type="button"
      className={styles.clear}
      aria-label="Clear search"
      onClick={clear}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  );
}
