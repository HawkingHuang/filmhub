import { useEffect, useMemo, useRef, useState } from "react";
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
import { BACKDROP_BASE_URL } from "../../lib/api";
import styles from "./Genre.module.scss";
import imageFallbackLandscape from "../../assets/images/image_fallback_landscape.webp";
import { useTmdbList } from "../../hooks/useTmdbList";

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

  // Preload all images for this row and only show images after all finished
  const [preloaded, setPreloaded] = useState(false);
  const imageUrls = useMemo(() => {
    return movies
      .map((m) => m.backdrop_path ?? m.poster_path)
      .filter((p): p is string => Boolean(p))
      .map((p) => `${BACKDROP_BASE_URL}${p}`);
  }, [movies]);

  useEffect(() => {
    let cancelled = false;
    const preloadUrls = imageUrls.slice(0, 4);

    if (preloadUrls.length > 0) {
      queueMicrotask(() => {
        if (cancelled) return;
        setPreloaded((prev) => (prev ? false : prev));
      });
    }

    if (imageUrls.length === 0) {
      queueMicrotask(() => {
        if (cancelled) return;
        setPreloaded(true);
      });
      return () => {
        cancelled = true;
      };
    }

    let counter = 0;
    const imgs: HTMLImageElement[] = [];

    const onFinish = () => {
      if (cancelled) return;
      counter += 1;
      if (counter >= preloadUrls.length) {
        queueMicrotask(() => {
          if (cancelled) return;
          setPreloaded(true);
        });
      }
    };

    preloadUrls.forEach((src) => {
      const img = new Image();
      img.onload = onFinish;
      img.onerror = onFinish;
      img.src = src;
      imgs.push(img);
    });

    return () => {
      cancelled = true;
      imgs.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageUrls]);

  const showSkeleton = isLoading || !preloaded;
  const slideCount = Math.max(4, movies.length);

  useEffect(() => {
    if (!showSkeleton) {
      swiperRef.current?.update?.();
    }
  }, [showSkeleton, movies.length]);

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
          const imageUrl = imagePath ? `${BACKDROP_BASE_URL}${imagePath}` : imageFallbackLandscape;
          const titleText = movie?.title ?? movie?.name ?? "";

          const cardContent = (
            <div className={styles.card}>
              {movie ? (
                <img
                  className={styles.poster}
                  src={imageUrl}
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
                    el.src = imageFallbackLandscape;
                  }}
                />
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
        {GENRES_BY_TYPE[type].map((genre) => (
          <GenreRow key={genre.key} title={genre.title} endpoint={genre.endpoint ?? defaultEndpoint} withGenres={genre.withGenres} mediaType={type} />
        ))}
      </div>
    </div>
  );
}

export default Genre;
