import { POSTER_BASE_URL } from "../../lib/api";
import type { Recommendation } from "../../types/movieTypes";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";
import ResultsGrid, { type ResultsGridItem } from "../ResultsGrid";
import styles from "./Recommendations.module.scss";

type RecommendationsProps = {
  recommendations: Recommendation[];
  title?: string;
  basePath?: "/movies" | "/tv";
};

function Recommendations({ recommendations, title = "Recommendations", basePath = "/movies" }: RecommendationsProps) {
  const items: ResultsGridItem[] = recommendations
    .filter((rec) => Boolean(rec?.id))
    .map((rec) => {
      const recPoster = rec.poster_path ? `${POSTER_BASE_URL}${rec.poster_path}` : imageFallbackPortrait;
      const recTitle = rec.title ?? "Recommendation";
      return {
        id: rec.id,
        href: `${basePath}/${rec.id}`,
        title: recTitle,
        imageSrc: recPoster,
        alt: recTitle,
      };
    });

  return (
    <section className={styles.recommendations}>
      <h2 className={styles.recommendationsTitle}>{title}</h2>
      <ResultsGrid items={items} />
    </section>
  );
}

export default Recommendations;
