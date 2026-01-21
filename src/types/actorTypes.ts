export type ActorDetail = {
  id: number;
  name: string;
  profile_path: string | null;
  birthday: string | null;
  place_of_birth: string | null;
  biography: string | null;
};

export type ActorCredit = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  character?: string | null;
  release_date?: string | null;
};

export type ActorCreditsResponse = {
  cast: ActorCredit[];
};
