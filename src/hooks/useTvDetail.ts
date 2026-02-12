import { useQuery } from "@tanstack/react-query";
import { fetchTvDetail } from "../utils/apiUtils";

export const useTvDetail = (id?: string) =>
  useQuery({
    queryKey: ["tv", id],
    queryFn: () => fetchTvDetail(id ?? ""),
    enabled: Boolean(id),
  });
