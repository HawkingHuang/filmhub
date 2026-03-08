import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMovieGenres } from "../../hooks/useMovieGenres";
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/minimal.css";
import styles from "./Genre.module.scss";
import { Select } from "@radix-ui/themes";
import * as Toast from "@radix-ui/react-toast";
import ErrorState from "../../components/ErrorState/ErrorState";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import ResultsGrid from "../../components/ResultsGrid";
import gridStyles from "../../components/ResultsGrid/ResultsGrid.module.scss";
import { useTmdbList } from "../../hooks/useTmdbList";
import { deriveGenreView } from "../../utils/genreViewUtils";

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

  const { data: resultsData, isLoading, isError } = useTmdbList(
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
  const { genres, currentGenre, totalPages, resultItems } = deriveGenreView({
    genresData,
    resultsData,
    safeGenreId,
    detailBasePath,
  });

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

        {!safeGenreId && <ErrorState message="Invalid genre" />}
        {isError && <ErrorState message="Unable to load results." />}
        {!isLoading && !isError && safeGenreId > 0 && resultItems.length === 0 && <ErrorState message="No results found" />}

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
