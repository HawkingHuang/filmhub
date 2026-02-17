export type ActorDetail = {
  id: number;
  name: string;
  profile_path: string | null;
  birthday: string | null;
  place_of_birth: string | null;
  biography: string | null;
};

export type ActorCredit = {
  credit_id?: string;
  id: number;
  media_type: "movie" | "tv";
  title?: string | null;
  name?: string | null;
  poster_path: string | null;
  backdrop_path?: string | null;
  character?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
};

export type ActorCreditsResponse = {
  cast: ActorCredit[];
};
