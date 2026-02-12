import { useQuery } from "@tanstack/react-query";
import { fetchCredits } from "../utils/apiUtils";

export const useCredits = (id?: string, mediaType: "movie" | "tv" = "movie") =>
  useQuery({
    queryKey: [mediaType, id, "credits"],
    queryFn: () => fetchCredits(id ?? "", mediaType),
    enabled: Boolean(id),
  });
