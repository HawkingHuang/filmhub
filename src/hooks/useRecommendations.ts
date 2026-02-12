import { useQuery } from "@tanstack/react-query";
import { fetchRecommendations } from "../utils/apiUtils";

export const useRecommendations = (id?: string, mediaType: "movie" | "tv" = "movie") =>
  useQuery({
    queryKey: [mediaType, id, "recommendations"],
    queryFn: () => fetchRecommendations(id ?? "", mediaType),
    enabled: Boolean(id),
  });
