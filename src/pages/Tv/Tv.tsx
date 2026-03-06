import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import * as Toast from "@radix-ui/react-toast";
import { deriveTvViewData } from "../../utils/commonUtils";
import type { RootState } from "../../store";
import type { ToastPayload } from "../../types/toastTypes";
import styles from "../../assets/styles/MediaDetail.module.scss";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import { useCredits } from "../../hooks/useCredits";
import { useTvDetail } from "../../hooks/useTvDetail";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useVideos } from "../../hooks/useVideos";
import { useCheckIsFavorited } from "../../hooks/useCheckIsFavorited";
import { useToggleFavorite } from "../../hooks/useToggleFavorite";
import useShowLandscapePoster from "../../hooks/useShowLandscapePoster";
import useWriteRecentView from "../../hooks/useWriteRecentView";
import MediaPosterCard from "../../components/MediaPosterCard/MediaPosterCard";
import TvInfoHeader from "../../components/TvInfoHeader/TvInfoHeader";
import MediaCredits from "../../components/MediaCredits/MediaCredits";
import Trailer from "../../components/Trailer/Trailer";
import Recommendations from "../../components/Recommendations/Recommendations";

function Tv() {
  // Routing + auth context
  const { id } = useParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Local UI state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastContent, setToastContent] = useState<ToastPayload | null>(null);
  const topBlockRef = useRef<HTMLElement | null>(null);

  // Derived identifiers
  const parsedTvId = Number(id);
  const tvId = Number.isFinite(parsedTvId) ? parsedTvId : null;

  // Data fetching
  const { data, isLoading, isError } = useTvDetail(id);
  const { data: creditsData, isError: isCreditsError } = useCredits(id, "tv");
  const { data: videosData } = useVideos(id, "tv");
  const { data: recommendationsData } = useRecommendations(id, "tv");
  const { data: isFavorited } = useCheckIsFavorited(tvId, isAuthenticated);
  const showLandscapePoster = useShowLandscapePoster(topBlockRef, isLoading);

  // Add/remove favorite mutation
  const toggleFavoriteMutation = useToggleFavorite(
    tvId,
    data
      ? {
          title: data.name,
          poster_path: data.poster_path ?? null,
          backdrop_path: data.backdrop_path ?? null,
        }
      : undefined,
    "tv",
    Boolean(isFavorited),
    {
      onToast: (payload) => {
        setToastContent(payload);
        setToastOpen(true);
      },
    },
  );

  const { recommendations, castMembers, creators, trailer, trailerUrl, years } = deriveTvViewData(data, creditsData, recommendationsData, videosData);

  useWriteRecentView({
    mediaId: tvId,
    title: data?.name,
    posterPath: data?.poster_path,
    backdropPath: data?.backdrop_path,
    mediaType: "tv",
  });

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isError || !data) {
    return (
      <div className="container">
        <div className={styles.state}>Unable to load tv details.</div>
      </div>
    );
  }

  return (
    <div className="container">
      <section className={styles.topBlock} ref={topBlockRef}>
        <MediaPosterCard
          title={data.name}
          posterPath={data.poster_path}
          backdropPath={data.backdrop_path}
          showLandscapePoster={showLandscapePoster}
          isAuthenticated={isAuthenticated}
          isFavorited={Boolean(isFavorited)}
          isPending={toggleFavoriteMutation.isPending}
          onToggleFavorite={() => {
            toggleFavoriteMutation.mutate();
          }}
        />
        <div className={styles.info}>
          <TvInfoHeader
            title={data.name}
            genres={data.genres}
            overview={data.overview}
            years={years}
            creators={creators}
            numberOfSeasons={data.number_of_seasons}
            numberOfEpisodes={data.number_of_episodes}
            imdbRating={data.imdb_rating}
          />

          {isCreditsError ? <div className={styles.state}>Unable to load credits.</div> : <MediaCredits castMembers={castMembers} />}
        </div>
      </section>

      <section className={styles.bottomSection}>
        {trailerUrl && <Trailer trailerUrl={trailerUrl} title={data.name} trailerName={trailer?.name} />}
        {recommendations.length > 0 && <Recommendations recommendations={recommendations} title="Recommendations" basePath="/tv" />}
      </section>

      {toastContent && (
        <Toast.Root className="toastRoot" open={toastOpen} onOpenChange={setToastOpen}>
          <Toast.Title className="toastTitle">{toastContent.title}</Toast.Title>
          {toastContent.description && <Toast.Description className="toastDescription">{toastContent.description}</Toast.Description>}
        </Toast.Root>
      )}
    </div>
  );
}

export default Tv;
