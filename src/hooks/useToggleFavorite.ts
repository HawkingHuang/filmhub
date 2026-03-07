import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { addToFavorites, deleteFromFavorites } from "../utils/favoritesUtils";
import type { UseToggleFavoriteOptions } from "../types/toastTypes";

type FavoriteMediaTarget = {
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
};

export function useToggleFavorite(mediaId: number | null, media: FavoriteMediaTarget | undefined, mediaType: "movie" | "tv", isFavorited: boolean, options: UseToggleFavoriteOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!mediaId || !media) {
        return null;
      }

      if (isFavorited) {
        return deleteFromFavorites(mediaId);
      }

      return addToFavorites({
        movie_id: mediaId,
        title: media.title,
        poster_path: media.poster_path ?? null,
        backdrop_path: media.backdrop_path ?? null,
        media_type: mediaType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", "list"] });
      queryClient.invalidateQueries({ queryKey: ["favorites", "isFavorited", mediaId] });
      options?.onToast?.({ title: isFavorited ? "Successfully Removed" : "Successfully Added", description: media?.title });
    },
    onError: (error) => {
      const err = error as { code?: string };
      options?.onToast?.({ title: err?.code === "23505" ? "Already in favorites" : "Something went wrong" });
      queryClient.invalidateQueries({ queryKey: ["favorites", "list"] });
      queryClient.invalidateQueries({ queryKey: ["favorites", "isFavorited", mediaId] });
    },
  });
}
