import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.png";
import styles from "./ResultsGrid.module.scss";

export type ResultsGridItem = {
  id: string | number;
  href: string;
  title: string;
  imageSrc: string;
  alt?: string;
  loading?: "lazy" | "eager";
  meta?: ReactNode;
};

type ResultsGridProps = {
  items: ResultsGridItem[];
};

function ResultsGrid({ items }: ResultsGridProps) {
  return (
    <div className={styles.resultsGrid}>
      {items.map((item) => (
        <Link key={item.id} className={styles.cardLink} to={item.href}>
          <div className={styles.card}>
            <img
              className={styles.poster}
              src={item.imageSrc}
              alt={item.alt ?? item.title}
              loading={item.loading}
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.src.endsWith(imageFallbackPortrait)) {
                  el.src = imageFallbackPortrait;
                }
              }}
            />
            <div className={styles.cardTitle}>{item.title}</div>
            {item.meta ?? null}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ResultsGrid;
