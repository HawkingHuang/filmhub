import { useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/minimal.css";
import { POSTER_BASE_URL } from "../../lib/api";
import { fetchMovieGenres, fetchMovies } from "../../utils/apiUtils";
import type { MovieGenre, TmdbMovie } from "../../types/genreTypes";
import styles from "./Genre.module.scss";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.png";
import { Select } from "@radix-ui/themes";

function Genre() {
  const { id } = useParams();
  const navigate = useNavigate();
  const genreId = Number(id);
  const safeGenreId = Number.isFinite(genreId) ? genreId : 0;

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tmdb", "discover", "genre", safeGenreId, page],
    queryFn: () =>
      fetchMovies("/discover/movie", {
        with_genres: String(safeGenreId),
        page: String(page),
      }),
    enabled: Boolean(safeGenreId),
  });

  const { data: genresData } = useQuery({
    queryKey: ["tmdb", "genres", "movie"],
    queryFn: fetchMovieGenres,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const genres = useMemo<MovieGenre[]>(() => genresData?.genres ?? [], [genresData]);
  const currentGenre = useMemo(() => genres.find((genre) => genre.id === safeGenreId), [genres, safeGenreId]);

  const results = useMemo<TmdbMovie[]>(() => data?.results ?? [], [data]);
  const totalPages = data?.total_pages ?? 0;

  const handlePageChange = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  const handleGenreChange = (nextGenreId: string) => {
    navigate(`/genres/${nextGenreId}?page=1`);
  };

  return (
    <div className="container">
      <section className={styles.genre}>
        <div className={styles.header}>
          {currentGenre?.name && <p className={styles.title}>{currentGenre?.name}</p>}
          <Select.Root value={String(safeGenreId)} onValueChange={handleGenreChange}>
            <Select.Trigger className={styles.genreSelectTrigger} aria-label="Select genre" />
            <Select.Content className={styles.genreSelectContent}>
              {genres.map((genre) => (
                <Select.Item key={genre.id} value={String(genre.id)}>
                  {genre.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        {!safeGenreId && <div className={styles.state}>Invalid genre</div>}
        {isLoading && <div className={styles.state}>Loading results...</div>}
        {isError && <div className={styles.state}>Unable to load results</div>}
        {!isLoading && !isError && safeGenreId > 0 && results.length === 0 && <div className={styles.state}>No results found</div>}

        {!isLoading && !isError && results.length > 0 && safeGenreId && (
          <div className={styles.resultsGrid}>
            {results.map((item) => {
              const titleText = item.title ?? item.name ?? "Untitled";
              const imageUrl = item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : imageFallbackPortrait;
              return (
                <Link key={item.id} className={styles.cardLink} to={`/movies/${item.id}`}>
                  <div className={styles.card}>
                    {imageUrl ? <img className={styles.poster} src={imageUrl} alt={titleText} loading="lazy" /> : <div className={styles.posterFallback} />}
                    <div className={styles.cardTitle}>{titleText}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {safeGenreId > 0 && totalPages > 1 && (
          <div className={styles.paginationWrap}>
            <ResponsivePagination current={page} total={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </section>
    </div>
  );
}

export default Genre;
