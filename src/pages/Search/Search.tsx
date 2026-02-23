import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/minimal.css";
import { useSearchMulti } from "../../hooks/useSearchMulti";
import type { SearchMultiResult } from "../../types/searchTypes";
import styles from "./Search.module.scss";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import ResultsGrid, { type ResultsGridItem } from "../../components/ResultsGrid";
import gridStyles from "../../components/ResultsGrid/ResultsGrid.module.scss";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("query") ?? "").trim();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const { data, isLoading, isError } = useSearchMulti(query, page, { enabled: Boolean(query) });

  const results = useMemo<SearchMultiResult[]>(() => data?.results ?? [], [data]);
  const totalPages = data?.total_pages ?? 0;
  const visibleResults = results;

  const resultItems = useMemo<ResultsGridItem[]>(() => {
    return visibleResults.map((item) => {
      const titleText = item.title ?? item.name ?? "Untitled";
      let imagePath: string | null = null;
      let imageType: ResultsGridItem["imageType"];

      if (item.media_type === "person" && item.profile_path) {
        imagePath = item.profile_path;
        imageType = "profile";
      } else if (item.poster_path) {
        imagePath = item.poster_path;
        imageType = "poster";
      } else if (item.backdrop_path) {
        imagePath = item.backdrop_path;
        imageType = "backdrop";
      }

      const linkTo = item.media_type === "person" ? `/actors/${item.id}` : item.media_type === "movie" ? `/movies/${item.id}` : `/tv/${item.id}`;
      return {
        id: `${item.media_type}-${item.id}`,
        href: linkTo,
        title: titleText,
        imageSrc: imageFallbackPortrait,
        imagePath,
        imageType,
        alt: titleText,
        loading: "lazy",
      };
    });
  }, [visibleResults]);

  const handlePageChange = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (query) {
      nextParams.set("query", query);
    }
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="container">
      <section className={styles.search}>
        <div className={styles.header}>{query && <p className={styles.subtitle}>Results for “{query}”</p>}</div>

        {!query && <div className={styles.state}>Enter a keyword to start searching.</div>}
        {isError && <div className={styles.state}>Unable to load results.</div>}
        {!isLoading && !isError && query && visibleResults.length === 0 && <div className={styles.state}>No results found.</div>}

        {!isLoading && !isError && resultItems.length > 0 && <ResultsGrid items={resultItems} />}

        {query && totalPages > 1 && (
          <div className={gridStyles.paginationWrap}>
            <ResponsivePagination current={page} total={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </section>
    </div>
  );
}

export default Search;
