type Genres = {
  key: string;
  title: string;
  endpoint?: string;
  withGenres?: number;
};

export const GENRES: Genres[] = [
  { key: "trending", title: "Trending", endpoint: "/trending/movie/day" },
  { key: "action", title: "Action", withGenres: 28 },
  { key: "drama", title: "Drama", withGenres: 18 },
  { key: "comedy", title: "Comedy", withGenres: 35 },
  { key: "thriller", title: "Thriller", withGenres: 53 },
  { key: "horror", title: "Horror", withGenres: 27 },
  { key: "science-fiction", title: "Science Fiction", withGenres: 878 },
  { key: "animation", title: "Animation", withGenres: 16 },
];

export const RECENT_KEY = "recently_viewed";

export const MAX_RECENT = 8;

export const PAGE_SIZE = 20;
