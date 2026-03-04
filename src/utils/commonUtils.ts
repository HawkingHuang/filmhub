import { RECENT_KEY, MAX_RECENT } from "../lib/constants";
import type { CreditsResponse, MovieVideo, RecentMedia, Recommendation, VideosResponse } from "../types/movieTypes";
import type { TvDetail } from "../types/tvTypes";

export const formatRuntime = (runtime: number | null) => {
  if (!runtime) return "—";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export const writeInRecentViewToLocalStorage = (payload: RecentMedia) => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list: RecentMedia[] = Array.isArray(parsed) ? parsed : [];
    const filtered = list.filter((item) => item.movie_id !== payload.movie_id);
    const updated = [payload, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // do nothing
  }
};

export const readRecentViewFromLocalStorage = (): RecentMedia[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_RECENT);
  } catch {
    return [];
  }
};

const getPreferredTrailer = (videosData?: VideosResponse | null): MovieVideo | null => {
  const videos = videosData?.results ?? [];
  const ytTrailers = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  const officialTrailer = ytTrailers.find((v) => v.official === true);
  return officialTrailer ?? ytTrailers[0] ?? null;
};

export const deriveMovieViewData = (creditsData?: CreditsResponse, recommendationsData?: { results: Recommendation[] }, videosData?: VideosResponse) => {
  const recommendations = recommendationsData?.results ?? [];
  const castMembers = creditsData?.cast?.slice(0, 8) ?? [];
  const crew = creditsData?.crew ?? [];
  const director = crew.find((c) => (c.job ?? "").toLowerCase() === "director");
  const directorName = director?.name ?? "—";
  const trailer = getPreferredTrailer(videosData);
  const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;

  return { recommendations, castMembers, directorName, trailer, trailerUrl };
};

export const deriveTvViewData = (tvData?: TvDetail, creditsData?: CreditsResponse, recommendationsData?: { results: Recommendation[] }, videosData?: VideosResponse) => {
  const recommendations = recommendationsData?.results ?? [];
  const castMembers = creditsData?.cast?.slice(0, 8) ?? [];
  const creators = tvData?.created_by ?? [];
  const trailer = getPreferredTrailer(videosData);
  const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  const firstYear = tvData?.first_air_date?.slice(0, 4) ?? "—";
  const lastYear = tvData?.last_air_date?.slice(0, 4) ?? "—";
  const years = `${firstYear} - ${lastYear}`;

  return { recommendations, castMembers, creators, trailer, trailerUrl, years };
};
