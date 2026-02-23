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
      const recTitle = rec.title ?? rec.name ?? "Recommendation";
      return {
        id: rec.id,
        href: `${basePath}/${rec.id}`,
        title: recTitle,
        imageSrc: imageFallbackPortrait,
        imagePath: rec.poster_path ?? null,
        imageType: rec.poster_path ? "poster" : undefined,
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
