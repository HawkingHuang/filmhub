import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import * as Toast from "@radix-ui/react-toast";
import { BACKDROP_BASE_URL, POSTER_BASE_URL, PROFILE_BASE_URL } from "../../lib/api";
import { addToFavorites, deleteFromFavorites } from "../../utils/favoritesUtils";
import { formatRuntime, writeInRecentViewToLocalStorage } from "../../utils/commonUtils";
import type { RecentMovie, MovieRecommendation } from "../../types/movieTypes";
import type { RootState } from "../../store";
import type { ToastPayload } from "../../types/toastTypes";
import styles from "./Movie.module.scss";
import { HeartIcon, Cross1Icon, CrossCircledIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import starIcon from "../../assets/images/star.svg";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.png";
import imageFallbackLandscape from "../../assets/images/image_fallback_landscape.png";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import * as Dialog from "@radix-ui/react-dialog";
import { useIsClamped } from "../../hooks/useIsClamped";
import { useCredits } from "../../hooks/useCredits";
import { useMovieDetail } from "../../hooks/useMovieDetail";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useVideos } from "../../hooks/useVideos";
import { useCheckIsFavorited } from "../../hooks/useCheckIsFavorited";

function Movie() {
  // Routing + auth context
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Local UI state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastContent, setToastContent] = useState<ToastPayload | null>(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [showLandscapePoster, setShowLandscapePoster] = useState(false);
  const topBlockRef = useRef<HTMLElement | null>(null);

  // Derived identifiers
  const movieId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  // Data fetching
  const { data, isLoading, isError } = useMovieDetail(id);
  const { data: creditsData } = useCredits(id);
  const { data: videosData } = useVideos(id);
  const { data: recommendationsData } = useRecommendations(id);
  const { data: isFavorited } = useCheckIsFavorited(movieId, isAuthenticated);

  // Derived UI helpers
  const { ref: overviewRef, isClamped } = useIsClamped(data?.overview ?? "");
  const posterUrl = useMemo(() => {
    if (!data?.poster_path) return imageFallbackPortrait;
    return `${POSTER_BASE_URL}${data.poster_path}`;
  }, [data?.poster_path]);

  const posterUrlLandscape = useMemo(() => {
    if (!data?.backdrop_path) return imageFallbackLandscape;
    return `${BACKDROP_BASE_URL}${data.backdrop_path}`;
  }, [data]);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!movieId || !data) {
        return null;
      }

      if (isFavorited) {
        return deleteFromFavorites(movieId);
      }

      return addToFavorites({
        movie_id: movieId,
        title: data.title,
        poster_path: data.poster_path ?? null,
        backdrop_path: data.backdrop_path ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", "isFavorited", movieId] });
      if (isFavorited) {
        setToastContent({ title: "Successfully Removed", description: data?.title });
      } else {
        setToastContent({ title: "Successfully Added", description: data?.title });
      }
      setToastOpen(true);
    },
    onError: (error) => {
      const err = error as { code?: string };
      if (err?.code === "23505") {
        setToastContent({ title: "Already in favorites" });
      } else {
        setToastContent({ title: "Something went wrong" });
      }
      setToastOpen(true);
      queryClient.invalidateQueries({ queryKey: ["favorites", "isFavorited", movieId] });
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

  // Automatically log recent view
  useEffect(() => {
    if (!data || !movieId) return;

    const payload: RecentMovie = {
      movie_id: movieId,
      title: data.title,
      poster_path: data.poster_path ?? null,
      backdrop_path: data.backdrop_path ?? null,
    };

    writeInRecentViewToLocalStorage(payload);
  }, [data, movieId]);

  // Resize observer for landscape poster
  useEffect(() => {
    if (isLoading) return;
    const el = topBlockRef.current;
    if (!el) return;

    const update = () => {
      const width = el.getBoundingClientRect().width;
      setShowLandscapePoster(width < 1360);
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, [isLoading]);

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
            <img
              className={styles.posterLandscape}
              src={posterUrlLandscape}
              alt={`${data.title} backdrop`}
              onError={(e) => {
                e.currentTarget.src = imageFallbackLandscape;
              }}
            />
          ) : (
            <img
              className={styles.poster}
              src={posterUrl}
              alt={data.title}
              onError={(e) => {
                e.currentTarget.src = imageFallbackPortrait;
              }}
            />
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

          <div className={styles.castList}>
            {castMembers.map((member) => {
              const profileUrl = member.profile_path ? `${PROFILE_BASE_URL}${member.profile_path}` : imageFallbackPortrait;
              return (
                <Link className={styles.castLink} key={member.id} to={`/actors/${member.id}`}>
                  <div className={styles.castItem}>
                    <img
                      className={styles.castImage}
                      src={profileUrl}
                      alt={member.name}
                      onError={(e) => {
                        e.currentTarget.src = imageFallbackPortrait;
                      }}
                    />
                    <div className={styles.castName}>{member.name}</div>
                    <div className={styles.castCharacter}>{member.character || "—"}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {trailerUrl && (
        <section className={styles.middleBlock}>
          <div className={styles.trailer}>
            <div className={styles.trailerHeader}>Trailer</div>
            <div className={styles.trailerFrame}>
              <iframe
                className={styles.trailerIframe}
                src={trailerUrl}
                title={trailer?.name ?? `${data.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className={styles.recommendations}>
          <h2 className={styles.recommendationsTitle}>Recommendations</h2>
          <div className={styles.resultsGrid}>
            {recommendations.map((item) => {
              const rec = (item as MovieRecommendation | undefined) ?? undefined;
              const recPoster = rec?.poster_path ? `${POSTER_BASE_URL}${rec.poster_path}` : imageFallbackPortrait;
              if (!rec || !rec.id) return null;
              return (
                <Link key={rec.id} to={`/movies/${rec.id}`} className={styles.cardLink}>
                  <div className={styles.card}>
                    <img
                      className={styles.poster}
                      src={recPoster}
                      alt={rec.title ?? "Recommendation"}
                      onError={(e) => {
                        e.currentTarget.src = imageFallbackPortrait;
                      }}
                    />
                    <div className={styles.cardTitle}>{rec.title ?? "Recommendation"}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
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
