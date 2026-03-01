import { useEffect } from "react";
import { writeInRecentViewToLocalStorage } from "../utils/commonUtils";
import type { RecentMedia } from "../types/movieTypes";

type UseWriteRecentViewParams = {
  mediaId: number | null;
  title: string | null | undefined;
  posterPath: string | null | undefined;
  backdropPath: string | null | undefined;
  mediaType: RecentMedia["media_type"];
};

function useWriteRecentView({ mediaId, title, posterPath, backdropPath, mediaType }: UseWriteRecentViewParams) {
  useEffect(() => {
    if (!mediaId || !title) return;

    const payload: RecentMedia = {
      movie_id: mediaId,
      title,
      poster_path: posterPath ?? null,
      backdrop_path: backdropPath ?? null,
      media_type: mediaType,
    };

    writeInRecentViewToLocalStorage(payload);
  }, [mediaId, title, posterPath, backdropPath, mediaType]);
}

export default useWriteRecentView;
