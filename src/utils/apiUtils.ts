import type { TmdbResponse } from "../types/genreTypes";
import type { MovieDetail, Recommendation, CreditsResponse, VideosResponse } from "../types/movieTypes";
import type { ActorDetail, ActorCreditsResponse } from "../types/actorTypes";
import type { SearchMultiResponse } from "../types/searchTypes";
import type { TvDetail } from "../types/tvTypes";
import type { MovieGenresResponse } from "../types/genreTypes";

const REQUIRED_PARAMS: Record<string, string> = {
  sort_by: "popularity.desc",
  page: "1",
};

export const getRandomPage = (max = 10) => String(Math.floor(Math.random() * max) + 1);

const buildTmdbProxyUrl = (endpoint: string, params?: Record<string, string>, includeRequiredParams = false) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL("/api/tmdb", "http://local");
  url.searchParams.set("path", path);

  if (includeRequiredParams) {
    Object.entries(REQUIRED_PARAMS).forEach(([key, value]) => {
      if (key === "page") {
        url.searchParams.set(key, getRandomPage(10));
      } else {
        url.searchParams.set(key, value);
      }
    });
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return `${url.pathname}${url.search}`;
};

export const buildUrl = (endpoint: string, params?: Record<string, string>) => buildTmdbProxyUrl(endpoint, params, true);

export const fetchTmdbList = async (endpoint: string, params?: Record<string, string>) => {
  const response = await fetch(buildUrl(endpoint, params));
  if (!response.ok) {
    throw new Error("Failed to fetch movies");
  }
  return (await response.json()) as TmdbResponse;
};

export const fetchMovieDetail = async (movieId: string) => {
  const response = await fetch(buildTmdbProxyUrl(`/movie/${movieId}`));
  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }
  const movie = (await response.json()) as MovieDetail;

  let imdbRating: string | null = null;
  if (movie.imdb_id) {
    try {
      const omdbResponse = await fetch(`/api/omdb?i=${encodeURIComponent(movie.imdb_id)}`);
      if (omdbResponse.ok) {
        const omdbData = (await omdbResponse.json()) as { imdbRating?: string };
        imdbRating = omdbData.imdbRating ?? null;
      }
    } catch {
      imdbRating = null;
    }
  }

  return { ...movie, imdb_rating: imdbRating } as MovieDetail;
};

export const fetchTvDetail = async (tvId: string) => {
  const response = await fetch(buildTmdbProxyUrl(`/tv/${tvId}`));
  if (!response.ok) {
    throw new Error("Failed to fetch tv details");
  }
  const tv = (await response.json()) as TvDetail;

  let imdbRating: string | null = null;
  const externalIds = await fetchTvExternalIds(tvId);
  if (externalIds?.imdb_id) {
    try {
      const omdbResponse = await fetch(`/api/omdb?i=${encodeURIComponent(externalIds.imdb_id)}`);
      if (omdbResponse.ok) {
        const omdbData = (await omdbResponse.json()) as { imdbRating?: string };
        imdbRating = omdbData.imdbRating ?? null;
      }
    } catch {
      imdbRating = null;
    }
  }

  return { ...tv, imdb_rating: imdbRating } as TvDetail;
};

export const fetchTvExternalIds = async (tvId: string) => {
  const response = await fetch(buildTmdbProxyUrl(`/tv/${tvId}/external_ids`));
  if (!response.ok) {
    throw new Error("Failed to fetch tv external ids");
  }
  return (await response.json()) as { imdb_id: string | null };
};

export const fetchRecommendations = async (id: string, mediaType: "movie" | "tv" = "movie") => {
  // randomly pick page 1 or 2
  const page = Math.random() < 0.5 ? 1 : 2;
  const response = await fetch(buildTmdbProxyUrl(`/${mediaType}/${id}/recommendations`, { page: String(page) }));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${mediaType} recommendations`);
  }
  const data = (await response.json()) as {
    results: Recommendation[];
  };

  const items = data.results ?? [];
  // shuffle (Fisher-Yates) and pick up to 4
  const shuffled = items.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selected = shuffled.slice(0, 4);
  return { results: selected };
};

export const fetchCredits = async (id: string, mediaType: "movie" | "tv" = "movie") => {
  const response = await fetch(buildTmdbProxyUrl(`/${mediaType}/${id}/credits`));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${mediaType} credits`);
  }
  return (await response.json()) as CreditsResponse;
};

export const fetchVideos = async (id: string, mediaType: "movie" | "tv" = "movie") => {
  const response = await fetch(buildTmdbProxyUrl(`/${mediaType}/${id}/videos`));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${mediaType} videos`);
  }
  return (await response.json()) as VideosResponse;
};

export const fetchActorDetail = async (personId: string) => {
  const response = await fetch(buildTmdbProxyUrl(`/person/${personId}`));
  if (!response.ok) {
    throw new Error("Failed to fetch actor details");
  }
  return (await response.json()) as ActorDetail;
};

export const fetchActorCredits = async (personId: string) => {
  const response = await fetch(buildTmdbProxyUrl(`/person/${personId}/movie_credits`));
  if (!response.ok) {
    throw new Error("Failed to fetch actor credits");
  }
  return (await response.json()) as ActorCreditsResponse;
};

export const fetchSearchMulti = async (query: string, page = 1) => {
  const response = await fetch(buildTmdbProxyUrl("/search/multi", { query, page: String(page) }));
  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }
  return (await response.json()) as SearchMultiResponse;
};

export const fetchMovieGenres = async () => {
  const response = await fetch(buildUrl("/genre/movie/list"));
  if (!response.ok) {
    throw new Error("Failed to fetch genres");
  }
  return (await response.json()) as MovieGenresResponse;
};
