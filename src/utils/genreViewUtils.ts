import imageFallbackPortrait from "../assets/images/image_fallback_portrait.webp";
import type { ResultsGridItem } from "../components/ResultsGrid";
import type { MovieGenre, MovieGenresResponse, TmdbMovie, TmdbResponse } from "../types/genreTypes";

type DeriveGenreViewParams = {
  genresData?: MovieGenresResponse;
  resultsData?: TmdbResponse;
  safeGenreId: number;
  detailBasePath: string;
};

export const deriveGenreView = ({ genresData, resultsData, safeGenreId, detailBasePath }: DeriveGenreViewParams) => {
  const genres: MovieGenre[] = genresData?.genres ?? [];
  const currentGenre = genres.find((genre) => genre.id === safeGenreId);
  const results: TmdbMovie[] = resultsData?.results ?? [];
  const totalPages = resultsData?.total_pages ?? 0;

  const resultItems: ResultsGridItem[] = results.map((item) => {
    const titleText = item.title ?? item.name ?? "Untitled";

    return {
      id: item.id,
      href: `${detailBasePath}/${item.id}`,
      title: titleText,
      imageSrc: imageFallbackPortrait,
      imagePath: item.poster_path ?? null,
      imageType: item.poster_path ? "poster" : undefined,
      alt: titleText,
      loading: "lazy",
    };
  });

  return {
    genres,
    currentGenre,
    totalPages,
    resultItems,
  };
};
