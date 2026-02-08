import { useQuery } from "@tanstack/react-query";
import { fetchMovieGenres } from "../utils/apiUtils";

export const useMovieGenres = () =>
  useQuery({
    queryKey: ["tmdb", "genres", "movie"],
    queryFn: fetchMovieGenres,
    staleTime: 1000 * 60 * 60 * 24,
  });
