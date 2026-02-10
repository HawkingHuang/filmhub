import { POSTER_BASE_URL } from "../../lib/api";
import type { MovieRecommendation } from "../../types/movieTypes";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.png";
import ResultsGrid, { type ResultsGridItem } from "../ResultsGrid";
import styles from "./Recommendations.module.scss";

type RecommendationsProps = {
  recommendations: MovieRecommendation[];
  title?: string;
};

function Recommendations({ recommendations, title = "Recommendations" }: RecommendationsProps) {
  const items: ResultsGridItem[] = recommendations
    .filter((rec) => Boolean(rec?.id))
    .map((rec) => {
      const recPoster = rec.poster_path ? `${POSTER_BASE_URL}${rec.poster_path}` : imageFallbackPortrait;
      const recTitle = rec.title ?? "Recommendation";
      return {
        id: rec.id,
        href: `/movies/${rec.id}`,
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
