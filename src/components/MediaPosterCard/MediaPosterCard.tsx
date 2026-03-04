import { HeartIcon, Cross1Icon } from "@radix-ui/react-icons";
import { BACKDROP_IMAGE_SIZES, POSTER_IMAGE_SIZES, BACKDROP_IMAGE_SIZES_ATTR, POSTER_IMAGE_SIZES_ATTR, buildTmdbImageSrcSet, buildTmdbImageUrl } from "../../lib/api";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";
import imageFallbackLandscape from "../../assets/images/image_fallback_landscape.webp";
import styles from "./MediaPosterCard.module.scss";

type MediaPosterCardProps = {
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  showLandscapePoster: boolean;
  isAuthenticated: boolean;
  isFavorited: boolean;
  isPending: boolean;
  onToggleFavorite: () => void;
};

function MediaPosterCard({ title, posterPath, backdropPath, showLandscapePoster, isAuthenticated, isFavorited, isPending, onToggleFavorite }: MediaPosterCardProps) {
  const posterSrc = posterPath ? buildTmdbImageUrl(posterPath, POSTER_IMAGE_SIZES.lg) : imageFallbackPortrait;
  const posterSrcSet = posterPath ? buildTmdbImageSrcSet(posterPath, POSTER_IMAGE_SIZES) : null;
  const posterSrcSetMobile = posterPath ? buildTmdbImageSrcSet(posterPath, { sm: POSTER_IMAGE_SIZES.sm }) : null;

  const posterLandscapeSrc = backdropPath ? buildTmdbImageUrl(backdropPath, BACKDROP_IMAGE_SIZES.md) : imageFallbackLandscape;
  const posterLandscapeSrcSet = backdropPath ? buildTmdbImageSrcSet(backdropPath, BACKDROP_IMAGE_SIZES) : null;
  const posterLandscapeSrcSetMobile = backdropPath ? buildTmdbImageSrcSet(backdropPath, { sm: BACKDROP_IMAGE_SIZES.sm }) : null;

  return (
    <div className={styles.posterWrap}>
      {showLandscapePoster ? (
        <picture>
          {posterLandscapeSrcSetMobile ? <source media="(max-width: 640px)" srcSet={posterLandscapeSrcSetMobile} sizes="300px" /> : null}
          {posterLandscapeSrcSet ? <source srcSet={posterLandscapeSrcSet} sizes={BACKDROP_IMAGE_SIZES_ATTR} /> : null}
          <img
            className={styles.posterLandscape}
            src={posterLandscapeSrc}
            srcSet={posterLandscapeSrcSet ?? undefined}
            sizes={BACKDROP_IMAGE_SIZES_ATTR}
            alt={`${title} backdrop`}
            onError={(e) => {
              e.currentTarget.src = imageFallbackLandscape;
            }}
          />
        </picture>
      ) : (
        <picture>
          {posterSrcSetMobile ? <source media="(max-width: 640px)" srcSet={posterSrcSetMobile} /> : null}
          {posterSrcSet ? <source srcSet={posterSrcSet} sizes={POSTER_IMAGE_SIZES_ATTR} /> : null}
          <img
            className={styles.poster}
            src={posterSrc}
            srcSet={posterSrcSet ?? undefined}
            sizes={POSTER_IMAGE_SIZES_ATTR}
            alt={title}
            onError={(e) => {
              e.currentTarget.src = imageFallbackPortrait;
            }}
          />
        </picture>
      )}
      <button
        className={`${styles.addButton} ${isFavorited ? styles.favorited : ""}`}
        type="button"
        disabled={!isAuthenticated || isPending}
        onClick={() => {
          if (!isAuthenticated || isPending) return;
          onToggleFavorite();
        }}
      >
        {!isAuthenticated ? (
          "Login to Add"
        ) : isPending ? (
          "Saving..."
        ) : isFavorited ? (
          <>
            <Cross1Icon />
            <span>Remove from Favorites</span>
          </>
        ) : (
          <>
            <HeartIcon />
            <span>Add to Favorites</span>
          </>
        )}
      </button>
    </div>
  );
}

export default MediaPosterCard;
