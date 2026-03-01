import { useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import * as Toast from "@radix-ui/react-toast";
import { BACKDROP_IMAGE_SIZES, POSTER_IMAGE_SIZES, BACKDROP_IMAGE_SIZES_ATTR, POSTER_IMAGE_SIZES_ATTR, buildTmdbImageSrcSet, buildTmdbImageUrl } from "../../lib/api";
import type { RootState } from "../../store";
import type { ToastPayload } from "../../types/toastTypes";
import styles from "../../assets/styles/MediaDetail.module.scss";
import { HeartIcon, Cross1Icon, CrossCircledIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import starIcon from "../../assets/images/star.svg";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";
import imageFallbackLandscape from "../../assets/images/image_fallback_landscape.webp";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import * as Dialog from "@radix-ui/react-dialog";
import { useIsClamped } from "../../hooks/useIsClamped";
import { useCredits } from "../../hooks/useCredits";
import { useTvDetail } from "../../hooks/useTvDetail";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useVideos } from "../../hooks/useVideos";
import { useCheckIsFavorited } from "../../hooks/useCheckIsFavorited";
import { useToggleFavorite } from "../../hooks/useToggleFavorite";
import useShowLandscapePoster from "../../hooks/useShowLandscapePoster";
import useWriteRecentView from "../../hooks/useWriteRecentView";
import MediaCredits from "../../components/MediaCredits/MediaCredits";
import Trailer from "../../components/Trailer/Trailer";
import Recommendations from "../../components/Recommendations/Recommendations";

function Tv() {
  const { id } = useParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastContent, setToastContent] = useState<ToastPayload | null>(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const topBlockRef = useRef<HTMLElement | null>(null);

  const tvId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  const { data, isLoading, isError } = useTvDetail(id);
  const { data: creditsData, isError: isCreditsError } = useCredits(id, "tv");
  const { data: videosData } = useVideos(id, "tv");
  const { data: recommendationsData } = useRecommendations(id, "tv");
  const { data: isFavorited } = useCheckIsFavorited(tvId, isAuthenticated);
  const showLandscapePoster = useShowLandscapePoster(topBlockRef, isLoading);

  const { ref: overviewRef, isClamped } = useIsClamped(data?.overview ?? "");
  const posterSrc = data?.poster_path ? buildTmdbImageUrl(data.poster_path, POSTER_IMAGE_SIZES.lg) : imageFallbackPortrait;

  const posterSrcSet = data?.poster_path ? buildTmdbImageSrcSet(data.poster_path, POSTER_IMAGE_SIZES) : null;

  const posterSrcSetMobile = data?.poster_path ? buildTmdbImageSrcSet(data.poster_path, { sm: POSTER_IMAGE_SIZES.sm }) : null;

  const posterLandscapeSrc = data?.backdrop_path ? buildTmdbImageUrl(data.backdrop_path, BACKDROP_IMAGE_SIZES.md) : imageFallbackLandscape;

  const posterLandscapeSrcSet = data?.backdrop_path ? buildTmdbImageSrcSet(data.backdrop_path, BACKDROP_IMAGE_SIZES) : null;

  const posterLandscapeSrcSetMobile = data?.backdrop_path ? buildTmdbImageSrcSet(data.backdrop_path, { sm: BACKDROP_IMAGE_SIZES.sm }) : null;

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

  const recommendations = useMemo(() => recommendationsData?.results ?? [], [recommendationsData]);
  const castMembers = useMemo(() => creditsData?.cast?.slice(0, 8) ?? [], [creditsData]);
  const creators = useMemo(() => data?.created_by ?? [], [data]);
  const trailer = useMemo(() => {
    const videos = videosData?.results ?? [];
    const ytTrailers = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
    const official = ytTrailers.find((v) => v.official === true);
    return official ?? ytTrailers[0] ?? null;
  }, [videosData]);
  const trailerUrl = useMemo(() => (trailer ? `https://www.youtube.com/embed/${trailer.key}` : null), [trailer]);
  const years = useMemo(() => {
    const firstYear = data?.first_air_date?.slice(0, 4) ?? "—";
    const lastYear = data?.last_air_date?.slice(0, 4) ?? "—";
    return `${firstYear} - ${lastYear}`;
  }, [data?.first_air_date, data?.last_air_date]);
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
                alt={`${data.name} backdrop`}
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
                alt={data.name}
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
              "Login to Add"
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
              <h1 className={styles.title}>{data.name}</h1>
              <div className={styles.genres}>
                {data.genres?.map((genre) => (
                  <Link key={genre.id} className={styles.genreTag} to={`/genres/${genre.id}?page=1&type=tv`}>
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
                  <Dialog.Content className={styles.dialogContent} aria-label={`${data.name} overview`}>
                    <div className={styles.dialogHeader}>
                      <Dialog.Title>{data.name} — Overview</Dialog.Title>
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
                <span className={styles.metaLabel}>Years</span>
                <span className={styles.metaValue}>{years}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Created By</span>
                {creators.length > 0 ? <span className={styles.metaValue}>{creators.map((c) => c.name).join(", ")}</span> : <span className={styles.metaValue}>—</span>}
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Seasons</span>
                <span className={styles.metaValue}>{data.number_of_seasons}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Episodes</span>
                <span className={styles.metaValue}>{data.number_of_episodes}</span>
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
