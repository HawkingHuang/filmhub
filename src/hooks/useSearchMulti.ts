import { useQuery } from "@tanstack/react-query";
import { fetchSearchMulti } from "../utils/apiUtils";

type UseSearchMultiOptions = {
  enabled?: boolean;
};

export const useSearchMulti = (query: string, page: number, options?: UseSearchMultiOptions) =>
  useQuery({
    queryKey: ["tmdb", "search", query, page],
    queryFn: () => fetchSearchMulti(query, page),
    enabled: options?.enabled ?? true,
  });
