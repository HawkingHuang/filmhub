export const API_BASE_URL = "https://api.themoviedb.org/3";

export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const BACKDROP_IMAGE_SIZES = {
  sm: "w300",
  md: "w780",
} as const;

export const POSTER_IMAGE_SIZES = {
  sm: "w185",
  md: "w342",
  lg: "w500",
} as const;

export const PROFILE_IMAGE_SIZES = {
  sm: "w185",
  md: "w185",
} as const;

export const POSTER_IMAGE_SIZES_ATTR = "(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 220px";
export const BACKDROP_IMAGE_SIZES_ATTR = "(max-width: 1024px) 92vw, (max-width: 1440px) 70vw, 780px";
export const PROFILE_IMAGE_SIZES_ATTR = "(max-width: 640px) 32vw, 185px";

export const BACKDROP_BASE_URL = `${TMDB_IMAGE_BASE_URL}/${BACKDROP_IMAGE_SIZES.md}`;
export const POSTER_BASE_URL = `${TMDB_IMAGE_BASE_URL}/${POSTER_IMAGE_SIZES.lg}`;
export const PROFILE_BASE_URL = `${TMDB_IMAGE_BASE_URL}/${PROFILE_IMAGE_SIZES.md}`;

type ImageSizeMap = Record<string, string>;

export function buildTmdbImageUrl(path: string, size: string) {
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export function buildTmdbImageSrcSet(path: string, sizes: ImageSizeMap) {
  return Object.values(sizes)
    .map((size) => `${buildTmdbImageUrl(path, size)} ${Number.parseInt(size.slice(1), 10)}w`)
    .join(", ");
}
