export type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
};

export type TmdbResponse = {
  results: TmdbMovie[];
};

export type GenreRowProps = {
  title: string;
  endpoint: string;
  withGenres?: number;
};
