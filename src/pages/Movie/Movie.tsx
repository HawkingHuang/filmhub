import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { POSTER_BASE_URL, PROFILE_BASE_URL } from "../../lib/api";
import { fetchMovieDetail, fetchRecommendations, fetchCredits, fetchVideos } from "../../utils/apiUtils";
import { formatRuntime } from "../../utils/commonUtils";
import type { MovieRecommendation } from "../../types/movieTypes";
import styles from "./Movie.module.scss";
import starIcon from "../../assets/images/star.svg";

function Movie() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => fetchMovieDetail(id ?? ""),
    enabled: Boolean(id),
  });
  const { data: creditsData } = useQuery({
    queryKey: ["movie", id, "credits"],
    queryFn: () => fetchCredits(id ?? ""),
    enabled: Boolean(id),
  });
  const { data: videosData } = useQuery({
    queryKey: ["movie", id, "videos"],
    queryFn: () => fetchVideos(id ?? ""),
    enabled: Boolean(id),
  });
  const { data: recommendationsData } = useQuery({
    queryKey: ["movie", id, "recommendations"],
    queryFn: () => fetchRecommendations(id ?? ""),
    enabled: Boolean(id),
  });

  const posterUrl = useMemo(() => {
    if (!data?.poster_path) return null;
    return `${POSTER_BASE_URL}${data.poster_path}`;
  }, [data?.poster_path]);

  const recommendations = useMemo(() => {
    return recommendationsData?.results ?? [];
  }, [recommendationsData]);

  const castMembers = useMemo(() => {
    return creditsData?.cast?.slice(0, 8) ?? [];
  }, [creditsData]);

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

  const trailerUrl = useMemo(() => {
    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  }, [trailer]);

  if (isLoading) {
    return (
      <div className="container">
        <div className={styles.state}>Loading movie...</div>
      </div>
    );
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
      <section className={styles.topBlock}>
        <div className={styles.posterWrap}>
          {posterUrl ? <img className={styles.poster} src={posterUrl} alt={data.title} /> : <div className={styles.posterFallback}>No poster</div>}
          <button className={styles.addButton} type="button">
            Add to Favorites
          </button>
        </div>
        <div className={styles.info}>
          <div className={styles.infoHeader}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>{data.title}</h1>
              <div className={styles.genres}>
                {data.genres?.map((genre) => (
                  <span key={genre.id} className={styles.genreTag}>
                    {genre.name}
                  </span>
                ))}
              </div>
              <p className={styles.overview}>{data.overview || "No overview available."}</p>
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
              const profileUrl = member.profile_path ? `${PROFILE_BASE_URL}${member.profile_path}` : null;
              return (
                <Link key={member.id} to={`/actors/${member.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className={styles.castItem}>
                    {profileUrl ? <img className={styles.castImage} src={profileUrl} alt={member.name} /> : <div className={styles.castImageFallback} />}
                    <div className={styles.castName}>{member.name}</div>
                    <div className={styles.castCharacter}>{member.character || "—"}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.middleBlock}>
        <div className={styles.trailer}>
          <div className={styles.trailerHeader}>Trailer</div>
          {trailerUrl ? (
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
          ) : (
            <div className={styles.trailerPlaceholder}>Trailer unavailable</div>
          )}
        </div>
      </section>

      <section className={styles.recommendations}>
        <h2 className={styles.recommendationsTitle}>Recommendations</h2>
        <div className={styles.recommendationRow}>
          {(recommendations.length > 0 ? recommendations : Array.from({ length: 4 })).map((item, index) => {
            const rec = (item as MovieRecommendation | undefined) ?? undefined;
            const recPoster = rec?.poster_path ? `${POSTER_BASE_URL}${rec.poster_path}` : null;
            if (rec && rec.id) {
              return (
                <Link key={rec.id} to={`/movies/${rec.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className={styles.recommendationCard}>
                    {recPoster ? <img className={styles.recommendationPoster} src={recPoster} alt={rec.title ?? "Recommendation"} /> : <div className={styles.recommendationPoster} />}
                    <div className={styles.recommendationTitle}>{rec.title ?? "Recommendation"}</div>
                  </div>
                </Link>
              );
            }

            return (
              <div key={rec?.id ?? index} className={styles.recommendationCard}>
                {recPoster ? <img className={styles.recommendationPoster} src={recPoster} alt={rec?.title ?? "Recommendation"} /> : <div className={styles.recommendationPoster} />}
                <div className={styles.recommendationTitle}>{rec?.title ?? "Recommendation"}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Movie;
