import { useEffect, useMemo, useState } from "react";
import { HeartFilledIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Tabs } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { PAGE_SIZE } from "../../lib/constants";
import ResponsivePagination from "react-responsive-pagination";
import { POSTER_BASE_URL } from "../../lib/api";
import type { RootState } from "../../store";
import { fetchFavorites } from "../../utils/favoritesUtils";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.png";
import styles from "./User.module.scss";
import "react-responsive-pagination/themes/minimal.css";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import { readRecentViewFromLocalStorage } from "../../utils/commonUtils";

function User() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id ?? null;
  const location = useLocation();
  const locationTab = (location.state as { tab?: string } | null)?.tab;
  const initialTab = locationTab === "recent" ? "recent" : "favorites";
  const [tab, setTab] = useState(initialTab);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["favorites", "list", userId],
    queryFn: () => fetchFavorites(userId as string),
    enabled: Boolean(userId),
  });

  const favorites = useMemo(() => data ?? [], [data]);
  const totalPages = Math.ceil(favorites.length / PAGE_SIZE);
  const pageSafe = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const pagedFavorites = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return favorites.slice(start, start + PAGE_SIZE);
  }, [favorites, pageSafe]);

  const recentMovies = useMemo(() => {
    if (tab !== "recent") return [];
    readRecentViewFromLocalStorage();
  }, [tab]);

  useEffect(() => {
    if (locationTab === "recent") {
      queueMicrotask(() => {
        setTab("recent");
      });
    } else if (locationTab === "favorites") {
      queueMicrotask(() => {
        setTab("favorites");
        setPage(1);
      });
    }
  }, [locationTab]);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="container">
      <section className={styles.userPage}>
        <Tabs.Root value={tab} onValueChange={setTab} defaultValue="favorites">
          <Tabs.List className={styles.tabsList}>
            <Tabs.Trigger className={styles.tabTrigger} value="favorites">
              <HeartFilledIcon />
              Favorites
            </Tabs.Trigger>
            <Tabs.Trigger className={styles.tabTrigger} value="recent">
              <EyeOpenIcon />
              Recently Viewed
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content className={styles.tabContent} value="favorites">
            {isError && <div className={styles.state}>Unable to load favorites</div>}
            {!isLoading && !isError && favorites.length === 0 && <div className={styles.state}>No favorites yet</div>}

            {!isLoading && !isError && favorites.length > 0 && (
              <div className={styles.resultsGrid}>
                {pagedFavorites.map((item) => {
                  const imageUrl = item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : imageFallbackPortrait;
                  return (
                    <Link key={item.movie_id} className={styles.cardLink} to={`/movies/${item.movie_id}`}>
                      <div className={styles.card}>
                        {imageUrl ? (
                          <img
                            className={styles.poster}
                            src={imageUrl}
                            alt={item.title}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = imageFallbackPortrait;
                            }}
                          />
                        ) : (
                          <div className={styles.posterFallback} />
                        )}
                        <div className={styles.cardTitle}>{item.title}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className={styles.paginationWrap}>
                <ResponsivePagination current={pageSafe} total={totalPages} onPageChange={setPage} />
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content className={styles.tabContent} value="recent">
            {recentMovies.length === 0 && <div className={styles.state}>No recently viewed movies</div>}
            {recentMovies.length > 0 && (
              <div className={styles.resultsGrid}>
                {recentMovies.map((item) => {
                  const imageUrl = item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : imageFallbackPortrait;
                  return (
                    <Link key={item.movie_id} className={styles.cardLink} to={`/movies/${item.movie_id}`}>
                      <div className={styles.card}>
                        {imageUrl ? (
                          <img
                            className={styles.poster}
                            src={imageUrl}
                            alt={item.title}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = imageFallbackPortrait;
                            }}
                          />
                        ) : (
                          <div className={styles.posterFallback} />
                        )}
                        <div className={styles.cardTitle}>{item.title}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </div>
  );
}

export default User;
