export type MovieDetail = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  imdb_id: string;
  imdb_rating: string | null;
};

export type FavoritePayload = {
  movie_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: "movie" | "tv";
};

export type FavoriteRow = FavoritePayload & {
  created_at: string;
};

export type RecentMovie = FavoritePayload;

export type Recommendation = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
};

export type CreditPerson = {
  id: number;
  name: string;
  job?: string;
  character?: string;
  profile_path?: string | null;
};

export type CreditsResponse = {
  id: number;
  cast: CreditPerson[];
  crew: CreditPerson[];
};

export type MovieVideo = {
  id: string;
  key: string;
  site: string;
  type: string;
  name: string;
  official?: boolean;
};

export type VideosResponse = {
  id: number;
  results: MovieVideo[];
};
