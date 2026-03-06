import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import * as Toast from "@radix-ui/react-toast";
import { deriveMovieViewData } from "../../utils/commonUtils";
import type { RootState } from "../../store";
import type { ToastPayload } from "../../types/toastTypes";
import styles from "../../assets/styles/MediaDetail.module.scss";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import MediaCredits from "../../components/MediaCredits/MediaCredits";
import { useCredits } from "../../hooks/useCredits";
import { useMovieDetail } from "../../hooks/useMovieDetail";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useVideos } from "../../hooks/useVideos";
import { useCheckIsFavorited } from "../../hooks/useCheckIsFavorited";
import { useToggleFavorite } from "../../hooks/useToggleFavorite";
import useShowLandscapePoster from "../../hooks/useShowLandscapePoster";
import useWriteRecentView from "../../hooks/useWriteRecentView";
import MediaPosterCard from "../../components/MediaPosterCard/MediaPosterCard";
import MovieInfoHeader from "../../components/MovieInfoHeader/MovieInfoHeader";
import Trailer from "../../components/Trailer/Trailer";
import Recommendations from "../../components/Recommendations/Recommendations";

function Movie() {
  // Routing + auth context
  const { id } = useParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Local UI state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastContent, setToastContent] = useState<ToastPayload | null>(null);
  const topBlockRef = useRef<HTMLElement | null>(null);

  // Derived identifiers
  const parsedMovieId = Number(id);
  const movieId = Number.isFinite(parsedMovieId) ? parsedMovieId : null;

  // Data fetching
  const { data, isLoading, isError } = useMovieDetail(id);
  const { data: creditsData, isError: isCreditsError } = useCredits(id);
  const { data: videosData } = useVideos(id);
  const { data: recommendationsData } = useRecommendations(id);
  const { data: isFavorited } = useCheckIsFavorited(movieId, isAuthenticated);
  const showLandscapePoster = useShowLandscapePoster(topBlockRef, isLoading);

  // Add/remove favorite mutation
  const toggleFavoriteMutation = useToggleFavorite(movieId, data, "movie", Boolean(isFavorited), {
    onToast: (payload) => {
      setToastContent(payload);
      setToastOpen(true);
    },
  });

  const { recommendations, castMembers, directorName, trailer, trailerUrl } = deriveMovieViewData(creditsData, recommendationsData, videosData);

  useWriteRecentView({
    mediaId: movieId,
    title: data?.title,
    posterPath: data?.poster_path,
    backdropPath: data?.backdrop_path,
    mediaType: "movie",
  });

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isError || !data) {
    return (
      <div className="container">
        <div className={styles.state}>Unable to load movie details.</div>
      </div>
    );
  }

  return (
    <div className="container">
      <section className={styles.topBlock} ref={topBlockRef}>
        <MediaPosterCard
          title={data.title}
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
          <MovieInfoHeader
            title={data.title}
            genres={data.genres}
            overview={data.overview}
            releaseDate={data.release_date}
            runtime={data.runtime}
            directorName={directorName}
            imdbRating={data.imdb_rating}
          />

          {isCreditsError ? <div className={styles.state}>Unable to load credits.</div> : <MediaCredits castMembers={castMembers} />}
        </div>
      </section>

      {trailerUrl && <Trailer trailerUrl={trailerUrl} title={data.title} trailerName={trailer?.name} />}

      {recommendations.length > 0 && <Recommendations recommendations={recommendations} />}
      {toastContent && (
        <Toast.Root className="toastRoot" open={toastOpen} onOpenChange={setToastOpen}>
          <Toast.Title className="toastTitle">{toastContent.title}</Toast.Title>
          {toastContent.description && <Toast.Description className="toastDescription">{toastContent.description}</Toast.Description>}
        </Toast.Root>
      )}
    </div>
  );
}

export default Movie;
