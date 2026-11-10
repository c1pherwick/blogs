import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Studio, APIs, search results and tokenised unsubscribe links should
        // never be indexed. Admin pages also carry a noindex meta tag.
        disallow: ["/admin", "/api/", "/search", "/unsubscribe"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
