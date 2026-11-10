import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumGrid } from "@/components/gallery/AlbumGrid";
import { AlbumNav } from "@/components/gallery/NextAlbum";
import { getAlbum, getAlbums } from "@/lib/data";
import { sanitizeRichText } from "@/lib/sanitize-rich";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { routes } from "@/lib/routes";
import styles from "./album.module.scss";

export async function generateStaticParams() {
  return (await getAlbums()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return {};
  return {
    title: album.title,
    description: album.description,
    alternates: { canonical: `/gallery/${album.slug}` },
    openGraph: {
      url: `/gallery/${album.slug}`,
      title: album.title,
      description: album.description,
      type: "website",
      images: album.cover ? [{ url: album.cover, alt: album.title }] : undefined,
    },
  };
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [albums, album] = await Promise.all([getAlbums(), getAlbum(slug)]);
  if (!album) notFound();
  const idx = albums.findIndex((a) => a.slug === album.slug);
  const prev = idx > 0 ? albums[idx - 1] : null;
  const next = idx >= 0 && idx < albums.length - 1 ? albums[idx + 1] : null;
  const backdrop = album.photos.find((p) => p.kind !== "video")?.src || album.cover || null;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <Breadcrumb
            items={[
              { label: "Home", href: routes.home },
              { label: "Gallery", href: routes.gallery },
              { label: album.title },
            ]}
          />
          <h1 className={styles.title}>{album.title}</h1>
          {album.subtitle ? <p className={styles.subtitle}>{album.subtitle}</p> : null}
          {album.description ? <p className={styles.description} dangerouslySetInnerHTML={{ __html: sanitizeRichText(album.description) }} /> : null}
          <p className={styles.count}>
            {album.photos.length} {album.photos.length === 1 ? "photo" : "photos"} · {album.year}
          </p>
        </div>
      </div>

      <div className={styles.body}>
        {album.photos.length > 0 ? (
          <AlbumGrid photos={album.photos} count={album.photos.length} />
        ) : (
          <div className={styles.empty}>
            <h2>No photos in this album yet</h2>
            <p>The frames will appear here as they are added.</p>
            <Link href={routes.gallery} className="btn btn-outline">Back to the gallery</Link>
          </div>
        )}
      </div>

      {prev || next ? (
        <div className={styles.navWrap}>
          <AlbumNav prev={prev} next={next} />
        </div>
      ) : null}
    </div>
  );
}

