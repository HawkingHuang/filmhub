import { useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import * as Toast from "@radix-ui/react-toast";
import { BACKDROP_IMAGE_SIZES, POSTER_IMAGE_SIZES, BACKDROP_IMAGE_SIZES_ATTR, POSTER_IMAGE_SIZES_ATTR, buildTmdbImageSrcSet, buildTmdbImageUrl } from "../../lib/api";
import { formatRuntime } from "../../utils/commonUtils";
import type { RootState } from "../../store";
import type { ToastPayload } from "../../types/toastTypes";
import styles from "../../assets/styles/MediaDetail.module.scss";
import { HeartIcon, Cross1Icon, CrossCircledIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import starIcon from "../../assets/images/star.svg";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";
import imageFallbackLandscape from "../../assets/images/image_fallback_landscape.webp";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import MediaCredits from "../../components/MediaCredits/MediaCredits";
import * as Dialog from "@radix-ui/react-dialog";
import { useIsClamped } from "../../hooks/useIsClamped";
import { useCredits } from "../../hooks/useCredits";
import { useMovieDetail } from "../../hooks/useMovieDetail";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useVideos } from "../../hooks/useVideos";
import { useCheckIsFavorited } from "../../hooks/useCheckIsFavorited";
import { useToggleFavorite } from "../../hooks/useToggleFavorite";
import useShowLandscapePoster from "../../hooks/useShowLandscapePoster";
import useWriteRecentView from "../../hooks/useWriteRecentView";
import Trailer from "../../components/Trailer/Trailer";
import Recommendations from "../../components/Recommendations/Recommendations";

function Movie() {
  // Routing + auth context
  const { id } = useParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Local UI state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastContent, setToastContent] = useState<ToastPayload | null>(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const topBlockRef = useRef<HTMLElement | null>(null);

  // Derived identifiers
  const movieId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  // Data fetching
  const { data, isLoading, isError } = useMovieDetail(id);
  const { data: creditsData, isError: isCreditsError } = useCredits(id);
  const { data: videosData } = useVideos(id);
  const { data: recommendationsData } = useRecommendations(id);
  const { data: isFavorited } = useCheckIsFavorited(movieId, isAuthenticated);
  const showLandscapePoster = useShowLandscapePoster(topBlockRef, isLoading);

  // Derived UI helpers
  const { ref: overviewRef, isClamped } = useIsClamped(data?.overview ?? "");
  const posterSrc = data?.poster_path ? buildTmdbImageUrl(data.poster_path, POSTER_IMAGE_SIZES.lg) : imageFallbackPortrait;

  const posterSrcSet = data?.poster_path ? buildTmdbImageSrcSet(data.poster_path, POSTER_IMAGE_SIZES) : null;

  const posterSrcSetMobile = data?.poster_path ? buildTmdbImageSrcSet(data.poster_path, { sm: POSTER_IMAGE_SIZES.sm }) : null;

  const posterLandscapeSrc = data?.backdrop_path ? buildTmdbImageUrl(data.backdrop_path, BACKDROP_IMAGE_SIZES.md) : imageFallbackLandscape;

  const posterLandscapeSrcSet = data?.backdrop_path ? buildTmdbImageSrcSet(data.backdrop_path, BACKDROP_IMAGE_SIZES) : null;

  const posterLandscapeSrcSetMobile = data?.backdrop_path ? buildTmdbImageSrcSet(data.backdrop_path, { sm: BACKDROP_IMAGE_SIZES.sm }) : null;

  // Add/remove favorite mutation
  const toggleFavoriteMutation = useToggleFavorite(movieId, data, "movie", Boolean(isFavorited), {
    onToast: (payload) => {
      setToastContent(payload);
      setToastOpen(true);
    },
  });

  const recommendations = useMemo(() => recommendationsData?.results ?? [], [recommendationsData]);
  const castMembers = useMemo(() => creditsData?.cast?.slice(0, 8) ?? [], [creditsData]);
  const directorName = useMemo(() => {
    const crew = creditsData?.crew ?? [];
    const director = crew.find((c) => (c.job ?? "").toLowerCase() === "director");
    return director?.name ?? "—";
  }, [creditsData]);
  const trailer = useMemo(() => {
    const videos = videosData?.results ?? [];
    const ytTrailers = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
    const official = ytTrailers.find((v) => v.official === true);
    return official ?? ytTrailers[0] ?? null;
  }, [videosData]);
  const trailerUrl = useMemo(() => (trailer ? `https://www.youtube.com/embed/${trailer.key}` : null), [trailer]);
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
        <div className={styles.posterWrap}>
          {showLandscapePoster ? (
            <picture>
              {posterLandscapeSrcSetMobile ? <source media="(max-width: 640px)" srcSet={posterLandscapeSrcSetMobile} sizes="300px" /> : null}
              {posterLandscapeSrcSet ? <source srcSet={posterLandscapeSrcSet} sizes={BACKDROP_IMAGE_SIZES_ATTR} /> : null}
              <img
                className={styles.posterLandscape}
                src={posterLandscapeSrc}
                srcSet={posterLandscapeSrcSet ?? undefined}
                sizes={BACKDROP_IMAGE_SIZES_ATTR}
                alt={`${data.title} backdrop`}
                onError={(e) => {
                  e.currentTarget.src = imageFallbackLandscape;
                }}
              />
            </picture>
          ) : (
            <picture>
              {posterSrcSetMobile ? <source media="(max-width: 640px)" srcSet={posterSrcSetMobile} /> : null}
              {posterSrcSet ? <source srcSet={posterSrcSet} sizes={POSTER_IMAGE_SIZES_ATTR} /> : null}
              <img
                className={styles.poster}
                src={posterSrc}
                srcSet={posterSrcSet ?? undefined}
                sizes={POSTER_IMAGE_SIZES_ATTR}
                alt={data.title}
                onError={(e) => {
                  e.currentTarget.src = imageFallbackPortrait;
                }}
              />
            </picture>
          )}
          <button
            className={`${styles.addButton} ${isFavorited ? styles.favorited : ""}`}
            type="button"
            disabled={!isAuthenticated || toggleFavoriteMutation.isPending}
            onClick={() => {
              if (!isAuthenticated || toggleFavoriteMutation.isPending) return;
              toggleFavoriteMutation.mutate();
            }}
          >
            {!isAuthenticated ? (
              "Login to Favorite"
            ) : toggleFavoriteMutation.isPending ? (
              "Saving..."
            ) : isFavorited ? (
              <>
                <Cross1Icon />
                <span>Remove from Favorites</span>
              </>
            ) : (
              <>
                <HeartIcon />
                <span>Add to Favorites</span>
              </>
            )}
          </button>
        </div>
        <div className={styles.info}>
          <div className={styles.infoHeader}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>{data.title}</h1>
              <div className={styles.genres}>
                {data.genres?.map((genre) => (
                  <Link key={genre.id} className={styles.genreTag} to={`/genres/${genre.id}`}>
                    {genre.name}
                  </Link>
                ))}
              </div>
              <Dialog.Root open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
                <p className={styles.overview} ref={overviewRef}>
                  {data.overview || "No overview available."}
                  {data.overview && isClamped ? (
                    <Dialog.Trigger asChild>
                      <button className={styles.readMore}>
                        <OpenInNewWindowIcon />
                        More
                      </button>
                    </Dialog.Trigger>
                  ) : null}
                </p>
                <Dialog.Portal>
                  <Dialog.Overlay className={styles.dialogOverlay} />
                  <Dialog.Content className={styles.dialogContent} aria-label={`${data.title} overview`}>
                    <div className={styles.dialogHeader}>
                      <Dialog.Title>{data.title} — Overview</Dialog.Title>
                      <Dialog.Close asChild>
                        <button className={styles.dialogClose}>
                          <CrossCircledIcon />
                        </button>
                      </Dialog.Close>
                    </div>
                    <div className={styles.dialogBody}>{data.overview}</div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Release Date</span>
                <span className={styles.metaValue}>{data.release_date || "—"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Runtime</span>
                <span className={styles.metaValue}>{formatRuntime(data.runtime)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Director</span>
                <span className={styles.metaValue}>{directorName}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>IMDB Rating</span>
                <span className={styles.metaValue}>
                  <img src={starIcon} alt="" />
                  {data.imdb_rating}
                </span>
              </div>
            </div>
          </div>

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
