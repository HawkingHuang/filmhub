import { useEffect, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { NavigationOptions } from "swiper/types";
import "swiper/css";
import "swiper/css/navigation";
import { ThickArrowLeftIcon, ThickArrowRightIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { GENRES_BY_TYPE } from "../../lib/constants";
import { Skeleton } from "@radix-ui/themes";
import type { GenreRowProps } from "../../types/genreTypes";
import { POSTER_IMAGE_SIZES, POSTER_IMAGE_SIZES_ATTR, buildTmdbImageSrcSet, buildTmdbImageUrl } from "../../lib/api";
import styles from "./Genre.module.scss";
import imageFallbackLandscape from "../../assets/images/image_fallback_landscape.webp";
import { useTmdbList } from "../../hooks/useTmdbList";
import LazyMount from "../LazyMount/LazyMount";

function GenreRow({ title, endpoint, withGenres, mediaType }: GenreRowProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const isTrending = title.toLowerCase() === "trending";
  const rowLink = withGenres ? `/genres/${withGenres}?page=1&type=${mediaType}` : "";
  const detailBasePath = mediaType === "tv" ? "/tv" : "/movies";

  const { data, isLoading, isError } = useTmdbList(endpoint, withGenres ? { with_genres: String(withGenres) } : undefined, {});

  const movies = useMemo(() => {
    return data?.results ?? [];
  }, [data]);
  const showSkeleton = isLoading;
  const slideCount = Math.max(4, movies.length);

  useEffect(() => {
    if (!isLoading) {
      swiperRef.current?.update?.();
    }
  }, [isLoading, movies.length]);

  if (isError) {
    return (
      <div className="container">
        <div className={styles.state}>Unable to load movies.</div>
      </div>
    );
  }

  return (
    <section className={styles.row}>
      <div className={styles.rowHeader}>
        {isTrending ? (
          <span className={styles.title}>{title}</span>
        ) : (
          <Link className={styles.title} to={rowLink}>
            {title}
            <OpenInNewWindowIcon />
          </Link>
        )}
        <div className={styles.nav}>
          <button className={styles.navButton} ref={prevRef} type="button" aria-label="Previous">
            <ThickArrowLeftIcon aria-hidden />
          </button>
          <button className={styles.navButton} ref={nextRef} type="button" aria-label="Next">
            <ThickArrowRightIcon aria-hidden />
          </button>
        </div>
      </div>

      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        modules={[Navigation]}
        slidesPerView={4}
        slidesPerGroup={4}
        spaceBetween={16}
        breakpoints={{
          0: { slidesPerView: 2, slidesPerGroup: 2 },
          481: { slidesPerView: 2, slidesPerGroup: 2 },
          641: { slidesPerView: 3, slidesPerGroup: 3 },
          1025: { slidesPerView: 4, slidesPerGroup: 4 },
          1360: { slidesPerView: 4, slidesPerGroup: 4 },
        }}
        onBeforeInit={(swiper) => {
          // Attach navigation elements before Swiper initializes
          const nav = swiper.params.navigation as NavigationOptions;
          nav.prevEl = prevRef.current;
          nav.nextEl = nextRef.current;
        }}
        navigation={true}
        speed={500}
        grabCursor
        touchRatio={1}
        resistanceRatio={0.85}
      >
        {Array.from({ length: slideCount }).map((_, index) => {
          const movie = movies[index];
          const imagePath = movie ? (movie.backdrop_path ?? movie.poster_path) : null;
          const imageSrc = imagePath ? buildTmdbImageUrl(imagePath, POSTER_IMAGE_SIZES.lg) : imageFallbackLandscape;
          const imageSrcSet = imagePath ? buildTmdbImageSrcSet(imagePath, POSTER_IMAGE_SIZES) : null;
          const imageSrcSetMobile = imagePath ? buildTmdbImageSrcSet(imagePath, { sm: POSTER_IMAGE_SIZES.sm }) : null;
          const titleText = movie?.title ?? movie?.name ?? "";
          const cardContent = (
            <div className={styles.card}>
              {movie ? (
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
                  opacity: showSkeleton || !movie ? 1 : 0,
                }}
                aria-hidden
              >
                <Skeleton className={styles.skeleton} />
              </div>
              <div className={styles.cardTitle}>
                <span
                  className={styles.cardTitleText}
                  style={{
                    opacity: showSkeleton || !movie ? 0 : 1,
                  }}
                >
                  {titleText || "\u00A0"}
                </span>
                <Skeleton
                  className={styles.skeletonText}
                  style={{
                    opacity: showSkeleton || !movie ? 1 : 0,
                  }}
                />
              </div>
            </div>
          );

          return (
            <SwiperSlide key={movie?.id ?? `placeholder-${index}`} className={styles.slide}>
              {movie ? (
                <Link to={`${detailBasePath}/${movie.id}`} className={styles.cardLink}>
                  {cardContent}
                </Link>
              ) : (
                <div className={styles.cardLink}>{cardContent}</div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}

type GenreProps = {
  searchParams: URLSearchParams;
};

function Genre({ searchParams }: GenreProps) {
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";
  const defaultEndpoint = type === "tv" ? "/discover/tv" : "/discover/movie";

  return (
    <div className="container">
      <div className={styles.genre}>
        {GENRES_BY_TYPE[type].map((genre, index) => {
          if (index < 3) {
            return <GenreRow key={genre.key} title={genre.title} endpoint={genre.endpoint ?? defaultEndpoint} withGenres={genre.withGenres} mediaType={type} />;
          }

          return (
            <LazyMount key={genre.key}>
              <GenreRow title={genre.title} endpoint={genre.endpoint ?? defaultEndpoint} withGenres={genre.withGenres} mediaType={type} />
            </LazyMount>
          );
        })}
      </div>
    </div>
  );
}

export default Genre;
