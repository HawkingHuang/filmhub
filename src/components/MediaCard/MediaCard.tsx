import { Skeleton } from "@radix-ui/themes";
import { POSTER_IMAGE_SIZES, POSTER_IMAGE_SIZES_ATTR, buildTmdbImageSrcSet, buildTmdbImageUrl } from "../../lib/api";
import type { TmdbMovie } from "../../types/genreTypes";
import imageFallbackLandscape from "../../assets/images/image_fallback_landscape.webp";
import styles from "./MediaCard.module.scss";

type MediaCardProps = {
  media?: TmdbMovie;
  showSkeleton: boolean;
};

function MediaCard({ media, showSkeleton }: MediaCardProps) {
  const imagePath = media ? (media.backdrop_path ?? media.poster_path) : null;
  const imageSrc = imagePath ? buildTmdbImageUrl(imagePath, POSTER_IMAGE_SIZES.lg) : imageFallbackLandscape;
  const imageSrcSet = imagePath ? buildTmdbImageSrcSet(imagePath, POSTER_IMAGE_SIZES) : null;
  const imageSrcSetMobile = imagePath ? buildTmdbImageSrcSet(imagePath, { sm: POSTER_IMAGE_SIZES.sm }) : null;
  const titleText = media?.title ?? media?.name ?? "";

  return (
    <div className={styles.card}>
      {media ? (
        <picture>
          {imageSrcSetMobile ? <source media="(max-width: 640px)" srcSet={imageSrcSetMobile} /> : null}
          {imageSrcSet ? <source srcSet={imageSrcSet} sizes={POSTER_IMAGE_SIZES_ATTR} /> : null}
          <img
            className={styles.poster}
            src={imageSrc}
            srcSet={imageSrcSet ?? undefined}
            sizes={POSTER_IMAGE_SIZES_ATTR}
            alt={titleText}
            onLoad={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
              el.removeAttribute("srcset");
              el.removeAttribute("sizes");
              const picture = el.parentElement;
              if (picture?.tagName === "PICTURE") {
                picture.querySelectorAll("source").forEach((source) => {
                  source.removeAttribute("srcset");
                  source.removeAttribute("sizes");
                });
              }
              el.src = imageFallbackLandscape;
            }}
          />
        </picture>
      ) : (
        <div className={styles.posterPlaceholder} aria-hidden />
      )}
      <div
        className={styles.skeletonOverlay}
        style={{
          opacity: showSkeleton || !media ? 1 : 0,
        }}
        aria-hidden
      >
        <Skeleton className={styles.skeleton} />
      </div>
      <div className={styles.cardTitle}>
        <span
          className={styles.cardTitleText}
          style={{
            opacity: showSkeleton || !media ? 0 : 1,
          }}
        >
          {titleText || "\u00A0"}
        </span>
        <Skeleton
          className={styles.skeletonText}
          style={{
            opacity: showSkeleton || !media ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}

export default MediaCard;
