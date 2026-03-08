import { useEffect, useState } from "react";
import { HeartFilledIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Tabs } from "@radix-ui/themes";
import { useFavorites } from "../../hooks/useFavorites";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { PAGE_SIZE } from "../../lib/constants";
import ResponsivePagination from "react-responsive-pagination";
import type { RootState } from "../../store";
import styles from "./User.module.scss";
import "react-responsive-pagination/themes/minimal.css";
import ErrorState from "../../components/ErrorState/ErrorState";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import ResultsGrid from "../../components/ResultsGrid";
import gridStyles from "../../components/ResultsGrid/ResultsGrid.module.scss";
import { deriveFavoritesView, deriveRecentMediaView } from "../../utils/userDataUtils";

function User() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id ?? null;
  const location = useLocation();
  const locationTab = (location.state as { tab?: string } | null)?.tab;
  const initialTab = locationTab === "recent" ? "recent" : "favorites";
  const [tab, setTab] = useState(initialTab);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useFavorites(userId, { enabled: Boolean(userId) });
  const { favorites, totalPages, pageSafe, favoriteItems } = deriveFavoritesView({
    favoritesData: data,
    page,
    pageSize: PAGE_SIZE,
  });
  const { recentMedia, recentItems } = deriveRecentMediaView(tab);

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
            {isError && <ErrorState message="Unable to load favorites." />}
            {!isLoading && !isError && favorites.length === 0 && <ErrorState message="No favorites yet" />}
            {!isLoading && !isError && favorites.length > 0 && <ResultsGrid items={favoriteItems} />}

            {totalPages > 1 && (
              <div className={gridStyles.paginationWrap}>
                <ResponsivePagination current={pageSafe} total={totalPages} onPageChange={setPage} />
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content className={styles.tabContent} value="recent">
            {recentMedia.length === 0 && <ErrorState message="No recently viewed movies" />}
            {recentMedia.length > 0 && <ResultsGrid items={recentItems} />}
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </div>
  );
}

export default User;
