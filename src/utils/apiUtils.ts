import { API_BASE_URL } from "../lib/api";
import type { TmdbResponse } from "../types/genreTypes";
import type { MovieDetail, MovieRecommendation, CreditsResponse, VideosResponse } from "../types/movieTypes";
import type { ActorDetail, ActorCreditsResponse } from "../types/actorTypes";
import type { SearchMultiResponse } from "../types/searchTypes";

const REQUIRED_PARAMS: Record<string, string> = {
  sort_by: "popularity.desc",
  page: "1",
};

export const getRandomPage = (max = 10) => String(Math.floor(Math.random() * max) + 1);

export const getApiKey = (): string => {
  const key = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
  if (!key) {
    throw new Error("Missing VITE_TMDB_API_KEY");
  }
  return key;
};

export const getOmdbApiKey = (): string | undefined => {
  return import.meta.env.VITE_OMDB_API_KEY as string | undefined;
};

const attachAuthParams = (url: URL) => {
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "en-US");
};

export const buildUrl = (endpoint: string, params?: Record<string, string>) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  attachAuthParams(url);
  Object.entries(REQUIRED_PARAMS).forEach(([key, value]) => {
    if (key === "page") {
      url.searchParams.set(key, getRandomPage(10));
    } else {
      url.searchParams.set(key, value);
    }
  });
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
};

export const fetchMovies = async (endpoint: string, params?: Record<string, string>) => {
  const response = await fetch(buildUrl(endpoint, params));
  if (!response.ok) {
    throw new Error("Failed to fetch movies");
  }
  return (await response.json()) as TmdbResponse;
};

export const fetchMovieDetail = async (movieId: string) => {
  const url = new URL(`${API_BASE_URL}/movie/${movieId}`);
  attachAuthParams(url);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }
  const movie = (await response.json()) as MovieDetail;

  let imdbRating: string | null = null;
  const omdbKey = getOmdbApiKey();
  if (movie.imdb_id && omdbKey) {
    try {
      const omdbUrl = new URL("https://www.omdbapi.com/");
      omdbUrl.searchParams.set("i", movie.imdb_id);
      omdbUrl.searchParams.set("apikey", omdbKey);
      const omdbResponse = await fetch(omdbUrl.toString());
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

export const fetchRecommendations = async (movieId: string) => {
  const base = `${API_BASE_URL}/movie/${movieId}/recommendations`;
  // randomly pick page 1 or 2
  const page = Math.random() < 0.5 ? 1 : 2;
  const url = new URL(base);
  attachAuthParams(url);
  url.searchParams.set("page", String(page));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch recommendations");
  }
  const data = (await response.json()) as { results: MovieRecommendation[] };

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

export const fetchCredits = async (movieId: string) => {
  const url = new URL(`${API_BASE_URL}/movie/${movieId}/credits`);
  attachAuthParams(url);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch credits");
  }
  return (await response.json()) as CreditsResponse;
};

export const fetchVideos = async (movieId: string) => {
  const url = new URL(`${API_BASE_URL}/movie/${movieId}/videos`);
  attachAuthParams(url);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }
  return (await response.json()) as VideosResponse;
};

export const fetchActorDetail = async (personId: string) => {
  const url = new URL(`${API_BASE_URL}/person/${personId}`);
  attachAuthParams(url);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch actor details");
  }
  return (await response.json()) as ActorDetail;
};

export const fetchActorCredits = async (personId: string) => {
  const url = new URL(`${API_BASE_URL}/person/${personId}/movie_credits`);
  attachAuthParams(url);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch actor credits");
  }
  return (await response.json()) as ActorCreditsResponse;
};

export const fetchSearchMulti = async (query: string, page = 1) => {
  const url = new URL(`${API_BASE_URL}/search/multi`);
  attachAuthParams(url);
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }
  return (await response.json()) as SearchMultiResponse;
};
