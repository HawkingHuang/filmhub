import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMovies } from "../utils/apiUtils";

type UseMovieOptions = {
  enabled?: boolean;
};

export const useMovie = (endpoint: string, params?: Record<string, string> | undefined, options?: UseMovieOptions) => {
  const cleanParams = useMemo(() => {
    if (!params) return undefined;
    return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string>;
  }, [params]);

  return useQuery({
    queryKey: ["tmdb", endpoint, cleanParams],
    queryFn: () => fetchMovies(endpoint, cleanParams),
    enabled: options?.enabled ?? true,
  });
};
