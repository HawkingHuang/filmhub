import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  POSTER_IMAGE_SIZES,
  PROFILE_IMAGE_SIZES,
  BACKDROP_IMAGE_SIZES,
  POSTER_IMAGE_SIZES_ATTR,
  PROFILE_IMAGE_SIZES_ATTR,
  BACKDROP_IMAGE_SIZES_ATTR,
  buildTmdbImageSrcSet,
  buildTmdbImageUrl,
} from "../../lib/api";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";
import styles from "./ResultsGrid.module.scss";

export type ResultsGridItem = {
  id: string | number;
  href: string;
  title: string;
  imageSrc: string;
  imagePath?: string | null;
  imageType?: "poster" | "backdrop" | "profile";
  alt?: string;
  loading?: "lazy" | "eager";
  meta?: ReactNode;
};

type ResultsGridProps = {
  items: ResultsGridItem[];
};

function ResultsGrid({ items }: ResultsGridProps) {
  const getTmdbImageConfig = (item: ResultsGridItem) => {
    if (!item.imagePath || !item.imageType) return null;

    const sizeMap = item.imageType === "profile" ? PROFILE_IMAGE_SIZES : item.imageType === "backdrop" ? BACKDROP_IMAGE_SIZES : POSTER_IMAGE_SIZES;

    const sizeValues = Object.values(sizeMap);
    const mobileSize = sizeValues[0];
    const defaultSize = sizeValues[sizeValues.length - 1];

    return {
      mobileSrcSet: buildTmdbImageSrcSet(item.imagePath, { sm: mobileSize }),
      mobileSizes: `${Number.parseInt(mobileSize.slice(1), 10)}px`,
      src: buildTmdbImageUrl(item.imagePath, defaultSize),
      srcSet: buildTmdbImageSrcSet(item.imagePath, sizeMap),
      sizes: item.imageType === "profile" ? PROFILE_IMAGE_SIZES_ATTR : item.imageType === "backdrop" ? BACKDROP_IMAGE_SIZES_ATTR : POSTER_IMAGE_SIZES_ATTR,
    };
  };

  return (
    <div className={styles.resultsGrid}>
      {items.map((item) => {
        const tmdbImage = getTmdbImageConfig(item);

        return (
          <Link key={item.id} className={styles.cardLink} to={item.href}>
            <div className={styles.card}>
              {tmdbImage ? (
                <picture>
                  <source media="(max-width: 640px)" srcSet={tmdbImage.mobileSrcSet} sizes={tmdbImage.mobileSizes} />
                  <source srcSet={tmdbImage.srcSet} sizes={tmdbImage.sizes} />
                  <img
                    className={styles.poster}
                    src={tmdbImage.src}
                    srcSet={tmdbImage.srcSet}
                    sizes={tmdbImage.sizes}
                    alt={item.alt ?? item.title}
                    loading={item.loading}
                    onError={(e) => {
                      e.currentTarget.src = imageFallbackPortrait;
                    }}
                  />
                </picture>
              ) : (
                <img
                  className={styles.poster}
                  src={item.imageSrc}
                  alt={item.alt ?? item.title}
                  loading={item.loading}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (!el.src.endsWith(imageFallbackPortrait)) {
                      el.src = imageFallbackPortrait;
                    }
                  }}
                />
              )}
              <div className={styles.cardTitle}>{item.title}</div>
              {item.meta ?? null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default ResultsGrid;
