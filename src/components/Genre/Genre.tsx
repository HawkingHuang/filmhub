import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { NavigationOptions } from "swiper/types";
import "swiper/css";
import "swiper/css/navigation";
import { ThickArrowLeftIcon, ThickArrowRightIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { GENRES } from "../../lib/constants";
import { Skeleton } from "@radix-ui/themes";
import type { GenreRowProps } from "../../types/genreTypes";
import { BACKDROP_BASE_URL } from "../../lib/api";
import { fetchMovies } from "../../utils/apiUtils";
import styles from "./Genre.module.scss";

function GenreRow({ title, endpoint, withGenres }: GenreRowProps) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tmdb", title, endpoint, withGenres],
    queryFn: () => fetchMovies(endpoint, withGenres ? { with_genres: String(withGenres) } : undefined),
  });

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

  return (
    <section className={styles.row}>
      <div className={styles.rowHeader}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.nav}>
          <button className={styles.navButton} ref={prevRef} type="button" aria-label="Previous">
            <ThickArrowLeftIcon aria-hidden />
          </button>
          <button className={styles.navButton} ref={nextRef} type="button" aria-label="Next">
            <ThickArrowRightIcon aria-hidden />
          </button>
        </div>
      </div>

      {!isLoading && !isError && (
        <>
          <Swiper
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
            {movies.map((movie) => {
              const imagePath = movie.backdrop_path ?? movie.poster_path;
              const imageUrl = imagePath ? `${BACKDROP_BASE_URL}${imagePath}` : undefined;
              const titleText = movie.title ?? movie.name ?? "Untitled";
              return (
                <SwiperSlide key={movie.id} className={styles.slide}>
                  <Link to={`/movies/${movie.id}`} className={styles.cardLink}>
                    <div className={styles.card}>
                      {imageUrl ? (
                        <>
                          {!preloaded && <Skeleton className={styles.skeleton} aria-hidden />}
                          {preloaded && (
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
                              }}
                            />
                          )}
                        </>
                      ) : (
                        <div className={styles.posterFallback} />
                      )}
                      <div className={styles.cardTitle}>{titleText}</div>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </>
      )}
    </section>
  );
}

function Genre() {
  return (
    <div className="container">
      <div className={styles.genre}>
        {GENRES.map((genre) => (
          <GenreRow key={genre.key} title={genre.title} endpoint={genre.endpoint ?? "/discover/movie"} withGenres={genre.withGenres} />
        ))}
      </div>
    </div>
  );
}

export default Genre;
