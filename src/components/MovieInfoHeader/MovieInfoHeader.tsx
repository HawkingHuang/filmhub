import starIcon from "../../assets/images/star.svg";
import { formatRuntime } from "../../utils/commonUtils";
import MediaTitleBlock from "../MediaTitleBlock/MediaTitleBlock";
import styles from "./MovieInfoHeader.module.scss";

type GenreItem = {
  id: number;
  name: string;
};

type MovieInfoHeaderProps = {
  title: string;
  genres?: GenreItem[];
  overview?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  directorName: string;
  imdbRating?: string | null;
};

function MovieInfoHeader({ title, genres = [], overview, releaseDate, runtime, directorName, imdbRating }: MovieInfoHeaderProps) {
  return (
    <div className={styles.infoHeader}>
      <MediaTitleBlock title={title} genres={genres} overview={overview} mediaType="movie" />
      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Release Date</span>
          <span className={styles.metaValue}>{releaseDate || "—"}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Runtime</span>
          <span className={styles.metaValue}>{formatRuntime(runtime ?? null)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Director</span>
          <span className={styles.metaValue}>{directorName}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>IMDB Rating</span>
          <span className={styles.metaValue}>
            <img src={starIcon} alt="" />
            {imdbRating}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MovieInfoHeader;
