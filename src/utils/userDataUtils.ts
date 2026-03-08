import imageFallbackPortrait from "../assets/images/image_fallback_portrait.webp";
import type { FavoriteRow, RecentMedia } from "../types/movieTypes";
import { readRecentViewFromLocalStorage } from "./commonUtils";
import type { ResultsGridItem } from "../components/ResultsGrid";

type UserMediaItem = FavoriteRow | RecentMedia;

type DeriveFavoritesViewParams = {
  favoritesData?: FavoriteRow[];
  page: number;
  pageSize: number;
};

const buildUserMediaGridItems = (items: UserMediaItem[]): ResultsGridItem[] => {
  return items.map((item) => {
    return {
      id: item.movie_id,
      href: item.media_type === "movie" ? `/movies/${item.movie_id}` : `/tv/${item.movie_id}`,
      title: item.title,
      imageSrc: imageFallbackPortrait,
      imagePath: item.poster_path ?? null,
      imageType: item.poster_path ? "poster" : undefined,
      alt: item.title,
      loading: "lazy",
    };
  });
};

export const deriveFavoritesView = ({ favoritesData, page, pageSize }: DeriveFavoritesViewParams) => {
  const favorites = favoritesData ?? [];
  const totalPages = Math.ceil(favorites.length / pageSize);
  const pageSafe = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const start = (pageSafe - 1) * pageSize;
  const pagedFavorites = favorites.slice(start, start + pageSize);
  const favoriteItems = buildUserMediaGridItems(pagedFavorites);

  return {
    favorites,
    totalPages,
    pageSafe,
    favoriteItems,
  };
};

export const deriveRecentMediaView = (tab: string) => {
  const recentMedia = tab ? readRecentViewFromLocalStorage() : [];
  const recentItems = buildUserMediaGridItems(recentMedia);

  return {
    recentMedia,
    recentItems,
  };
};
