import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { NavigationOptions } from "swiper/types";
import "swiper/css";
import "swiper/css/navigation";
import { ThickArrowLeftIcon, ThickArrowRightIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@radix-ui/themes";
import type { TmdbResponse, GenreRowProps } from "../../types/genreTypes";
import { API_BASE_URL, IMAGE_BASE_URL } from "../../lib/api";
import styles from "./Genre.module.scss";

const GENRES = [
  { key: "trending", title: "Trending", endpoint: "/trending/all/day" },
  { key: "action", title: "Action", withGenres: 28 },
  { key: "drama", title: "Drama", withGenres: 18 },
  { key: "comedy", title: "Comedy", withGenres: 35 },
  { key: "thriller", title: "Thriller", withGenres: 53 },
  { key: "science-fiction", title: "Science Fiction", withGenres: 878 },
  { key: "horror", title: "Horror", withGenres: 27 },
];

const REQUIRED_PARAMS = {
  language: "en-US",
  sort_by: "popularity.desc",
  page: "1",
};

const getRandomPage = (max = 10) => String(Math.floor(Math.random() * max) + 1);

const getApiKey = () => {
  const key = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
  if (!key) {
    throw new Error("Missing VITE_TMDB_API_KEY");
  }
  return key;
};

const buildUrl = (endpoint: string, params?: Record<string, string>) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  const apiKey = getApiKey();
  url.searchParams.set("api_key", apiKey);
  Object.entries(REQUIRED_PARAMS).forEach(([key, value]) => {
    if (key === "page") {
      url.searchParams.set(key, getRandomPage(10));
    } else {
      url.searchParams.set(key, value);
    }
  });
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
};

const fetchMovies = async (endpoint: string, params?: Record<string, string>) => {
  const response = await fetch(buildUrl(endpoint, params));
  if (!response.ok) {
    throw new Error("Failed to fetch movies");
  }
  return (await response.json()) as TmdbResponse;
};

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
      .map((p) => `${IMAGE_BASE_URL}${p}`);
  }, [movies]);

  useEffect(() => {
    setPreloaded(false);
    if (imageUrls.length === 0) {
      setPreloaded(true);
      return;
    }

    let mounted = true;
    let counter = 0;
    const imgs: HTMLImageElement[] = [];

    const preloadUrls = imageUrls.slice(0, 4);
    preloadUrls.forEach((src) => {
      const img = new Image();
      const onFinish = () => {
        if (!mounted) return;
        counter += 1;
        if (counter >= preloadUrls.length) setPreloaded(true);
      };
      img.onload = onFinish;
      img.onerror = onFinish;
      img.src = src;
      imgs.push(img);
    });

    return () => {
      mounted = false;
      imgs.forEach((i) => {
        i.onload = null;
        i.onerror = null;
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
              const imageUrl = imagePath ? `${IMAGE_BASE_URL}${imagePath}` : undefined;
              const titleText = movie.title ?? movie.name ?? "Untitled";
              return (
                <SwiperSlide key={movie.id} className={styles.slide}>
                  <div className={styles.card}>
                    {imageUrl ? (
                      <>
                        {!preloaded && <Skeleton className={styles.skeleton} aria-hidden />}
                        {preloaded && <img className={styles.poster} src={imageUrl} alt={titleText} />}
                      </>
                    ) : (
                      <div className={styles.posterFallback} />
                    )}
                    <div className={styles.cardTitle}>{titleText}</div>
                  </div>
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
