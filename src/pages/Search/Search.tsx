import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/minimal.css";
import { useSearchMulti } from "../../hooks/useSearchMulti";
import { BACKDROP_BASE_URL, POSTER_BASE_URL, PROFILE_BASE_URL } from "../../lib/api";
import type { SearchMultiResult } from "../../types/searchTypes";
import styles from "./Search.module.scss";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.png";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("query") ?? "").trim();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const { data, isLoading, isError } = useSearchMulti(query, page, { enabled: Boolean(query) });

  const results = useMemo<SearchMultiResult[]>(() => data?.results ?? [], [data]);
  const totalPages = data?.total_pages ?? 0;
  const visibleResults = results;

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

        {!isLoading && !isError && visibleResults.length > 0 && (
          <div className={styles.resultsGrid}>
            {visibleResults.map((item) => {
              const titleText = item.title ?? item.name ?? "Untitled";
              let imageUrl: string | undefined;
              if (item.media_type === "person" && item.profile_path) {
                imageUrl = `${PROFILE_BASE_URL}${item.profile_path}`;
              } else if (item.poster_path) {
                imageUrl = `${POSTER_BASE_URL}${item.poster_path}`;
              } else if (item.backdrop_path) {
                imageUrl = `${BACKDROP_BASE_URL}${item.backdrop_path}`;
              } else {
                imageUrl = imageFallbackPortrait;
              }
              const linkTo = item.media_type === "person" ? `/actors/${item.id}` : `/movies/${item.id}`;

              return (
                <Link key={`${item.media_type}-${item.id}`} className={styles.cardLink} to={linkTo}>
                  <div className={styles.card}>
                    <img
                      className={styles.poster}
                      src={imageUrl}
                      alt={titleText}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = imageFallbackPortrait;
                      }}
                    />
                    <div className={styles.cardTitle}>{titleText}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {query && totalPages > 1 && (
          <div className={styles.paginationWrap}>
            <ResponsivePagination current={page} total={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </section>
    </div>
  );
}

export default Search;
