import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { addToFavorites, deleteFromFavorites } from "../utils/favoritesUtils";
import type { UseToggleFavoriteOptions } from "../types/toastTypes";
import type { MovieDetail } from "../types/movieTypes";

export function useToggleFavorite(movieId: number | null, movie: MovieDetail | undefined, isFavorited: boolean, options: UseToggleFavoriteOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!movieId || !movie) {
        return null;
      }

      if (isFavorited) {
        return deleteFromFavorites(movieId);
      }

      return addToFavorites({
        movie_id: movieId,
        title: movie.title,
        poster_path: movie.poster_path ?? null,
        backdrop_path: movie.backdrop_path ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", "isFavorited", movieId] });
      options?.onToast?.({ title: isFavorited ? "Successfully Removed" : "Successfully Added", description: movie?.title });
    },
    onError: (error) => {
      const err = error as { code?: string };
      options?.onToast?.({ title: err?.code === "23505" ? "Already in favorites" : "Something went wrong" });
      queryClient.invalidateQueries({ queryKey: ["favorites", "isFavorited", movieId] });
    },
  });
}
