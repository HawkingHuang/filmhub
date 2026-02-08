import { useQuery } from "@tanstack/react-query";
import { fetchFavorites } from "../utils/favoritesUtils";

type UseFavoritesOptions = {
  enabled?: boolean;
};

export const useFavorites = (userId: string | null, options?: UseFavoritesOptions) =>
  useQuery({
    queryKey: ["favorites", "list", userId],
    queryFn: () => fetchFavorites(userId as string),
    enabled: options?.enabled ?? true,
  });
