import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTmdbList } from "../utils/apiUtils";

type UseTmdbListOptions = {
  enabled?: boolean;
};

export const useTmdbList = (endpoint: string, params?: Record<string, string> | undefined, options?: UseTmdbListOptions) => {
  const cleanParams = useMemo(() => {
    if (!params) return undefined;
    return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string>;
  }, [params]);

  return useQuery({
    queryKey: ["tmdb", endpoint, cleanParams],
    queryFn: () => fetchTmdbList(endpoint, cleanParams),
    enabled: options?.enabled ?? true,
  });
};
