import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMovieGenres } from "../../hooks/useMovieGenres";
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/minimal.css";
import { POSTER_BASE_URL } from "../../lib/api";
import type { MovieGenre, TmdbMovie } from "../../types/genreTypes";
import styles from "./Genre.module.scss";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.png";
import { Select } from "@radix-ui/themes";
import * as Toast from "@radix-ui/react-toast";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import ResultsGrid, { type ResultsGridItem } from "../../components/ResultsGrid";
import gridStyles from "../../components/ResultsGrid/ResultsGrid.module.scss";
import { useTmdbList } from "../../hooks/useTmdbList";

function Genre() {
  const { id } = useParams();
  const navigate = useNavigate();
  const genreId = Number(id);
  const safeGenreId = Number.isFinite(genreId) ? genreId : 0;

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";
  const endpoint = type === "tv" ? "/discover/tv" : "/discover/movie";
  const detailBasePath = type === "tv" ? "/tv" : "/movies";

  const { data, isLoading, isError } = useTmdbList(
    endpoint,
    {
      with_genres: String(safeGenreId),
      page: String(page),
    },
    { enabled: Boolean(safeGenreId) },
  );

  const { data: genresData, isError: isGenresError } = useMovieGenres();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastContent, setToastContent] = useState<{ title: string; description?: string } | null>(null);

  const genres = useMemo<MovieGenre[]>(() => genresData?.genres ?? [], [genresData]);
  const currentGenre = useMemo(() => genres.find((genre) => genre.id === safeGenreId), [genres, safeGenreId]);

  const results = useMemo<TmdbMovie[]>(() => data?.results ?? [], [data]);
  const totalPages = data?.total_pages ?? 0;

  const resultItems = useMemo<ResultsGridItem[]>(() => {
    return results.map((item) => {
      const titleText = item.title ?? item.name ?? "Untitled";
      const imageUrl = item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : imageFallbackPortrait;
      return {
        id: item.id,
        href: `${detailBasePath}/${item.id}`,
        title: titleText,
        imageSrc: imageUrl,
        alt: titleText,
        loading: "lazy",
      };
    });
  }, [results]);

  const handlePageChange = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  const handleGenreChange = (nextGenreId: string) => {
    navigate(`/genres/${nextGenreId}?page=1&type=${type}`);
  };

  useEffect(() => {
    if (!isGenresError) return;
    queueMicrotask(() => {
      setToastContent({
        title: "Unable to Get Genres",
        description: "Please reload the page",
      });
      setToastOpen(true);
    });
  }, [isGenresError]);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="container">
      <section className={styles.genre}>
        {!isGenresError && (
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
        )}

        {!safeGenreId && <div className={styles.state}>Invalid genre</div>}
        {isError && <div className={styles.state}>Unable to load results.</div>}
        {!isLoading && !isError && safeGenreId > 0 && results.length === 0 && <div className={styles.state}>No results found</div>}

        {!isLoading && !isError && resultItems.length > 0 && safeGenreId && <ResultsGrid items={resultItems} />}

        {safeGenreId > 0 && totalPages > 1 && (
          <div className={gridStyles.paginationWrap}>
            <ResponsivePagination current={page} total={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </section>
      {toastContent && (
        <Toast.Root className="toastRoot" open={toastOpen} onOpenChange={setToastOpen}>
          <Toast.Title className={`${styles.toastTitleError} toastTitle`}>{toastContent.title}</Toast.Title>
          {toastContent.description && <Toast.Description className="toastDescription">{toastContent.description}</Toast.Description>}
        </Toast.Root>
      )}
    </div>
  );
}

export default Genre;
