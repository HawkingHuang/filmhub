import { useQuery } from "@tanstack/react-query";
import { fetchVideos } from "../utils/apiUtils";

export const useVideos = (id?: string, mediaType: "movie" | "tv" = "movie") =>
  useQuery({
    queryKey: [mediaType, id, "videos"],
    queryFn: () => fetchVideos(id ?? "", mediaType),
    enabled: Boolean(id),
  });
