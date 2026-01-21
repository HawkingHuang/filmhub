import { API_BASE_URL } from "../lib/api";
import type { TmdbResponse } from "../types/genreTypes";
import type { MovieDetail, MovieRecommendation, CreditsResponse, VideosResponse } from "../types/movieTypes";

const REQUIRED_PARAMS: Record<string, string> = {
  language: "en-US",
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

export const buildUrl = (endpoint: string, params?: Record<string, string>) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  const apiKey = getApiKey();
  url.searchParams.set("api_key", apiKey);
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
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "en-US");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }
  return (await response.json()) as MovieDetail;
};

export const fetchRecommendations = async (movieId: string) => {
  const base = `${API_BASE_URL}/movie/${movieId}/recommendations`;
  const apiKey = getApiKey();

  // randomly pick page 1 or 2
  const page = Math.random() < 0.5 ? 1 : 2;
  const url = new URL(base);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
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
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "en-US");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch credits");
  }
  return (await response.json()) as CreditsResponse;
};

export const fetchVideos = async (movieId: string) => {
  const url = new URL(`${API_BASE_URL}/movie/${movieId}/videos`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "en-US");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }
  return (await response.json()) as VideosResponse;
};
