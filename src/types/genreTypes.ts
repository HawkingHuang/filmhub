export type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
};

export type TmdbResponse = {
  results: TmdbMovie[];
  page?: number;
  total_pages?: number;
  total_results?: number;
};

export type GenreRowProps = {
  title: string;
  endpoint: string;
  withGenres?: number;
  mediaType: "movie" | "tv";
};

export type MovieGenre = {
  id: number;
  name: string;
};

export type MovieGenresResponse = {
  genres: MovieGenre[];
};
