export type TvDetail = {
  id: number;
  name: string;
  created_by: { id: number; name: string }[];
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  last_air_date: string;
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  imdb_rating?: string | null;
};
