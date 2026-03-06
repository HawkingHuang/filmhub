import starIcon from "../../assets/images/star.svg";
import MediaTitleBlock from "../MediaTitleBlock/MediaTitleBlock";
import styles from "./TvInfoHeader.module.scss";

type GenreItem = {
  id: number;
  name: string;
};

type Creator = {
  id: number;
  name: string;
};

type TvInfoHeaderProps = {
  title: string;
  genres?: GenreItem[];
  overview?: string | null;
  years: string;
  creators: Creator[];
  numberOfSeasons: number;
  numberOfEpisodes: number;
  imdbRating?: string | null;
};

function TvInfoHeader({ title, genres = [], overview, years, creators, numberOfSeasons, numberOfEpisodes, imdbRating }: TvInfoHeaderProps) {
  return (
    <div className={styles.infoHeader}>
      <MediaTitleBlock title={title} genres={genres} overview={overview} mediaType="tv" />
      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Years</span>
          <span className={styles.metaValue}>{years}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Created By</span>
          {creators.length > 0 ? <span className={styles.metaValue}>{creators.map((c) => c.name).join(", ")}</span> : <span className={styles.metaValue}>—</span>}
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Seasons</span>
          <span className={styles.metaValue}>{numberOfSeasons}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Episodes</span>
          <span className={styles.metaValue}>{numberOfEpisodes}</span>
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

export default TvInfoHeader;
