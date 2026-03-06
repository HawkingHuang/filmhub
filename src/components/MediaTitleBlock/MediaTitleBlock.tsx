import { useState } from "react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { CrossCircledIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { useIsClamped } from "../../hooks/useIsClamped";
import styles from "./MediaTitleBlock.module.scss";

type GenreItem = {
  id: number;
  name: string;
};

type MediaTitleBlockProps = {
  title: string;
  overview?: string | null;
  genres?: GenreItem[];
  mediaType: "movie" | "tv";
};

function MediaTitleBlock({ title, overview, genres = [], mediaType }: MediaTitleBlockProps) {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const normalizedOverview = overview ?? "";
  const { ref: overviewRef, isClamped } = useIsClamped(normalizedOverview);

  return (
    <div className={styles.titleBlock}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.genres}>
        {genres.map((genre) => (
          <Link key={genre.id} className={styles.genreTag} to={`/genres/${genre.id}?page=1&type=${mediaType}`}>
            {genre.name}
          </Link>
        ))}
      </div>
      <Dialog.Root open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
        <p className={styles.overview} ref={overviewRef}>
          {overview || "No overview available."}
          {overview && isClamped ? (
            <Dialog.Trigger asChild>
              <button className={styles.readMore}>
                <OpenInNewWindowIcon />
                More
              </button>
            </Dialog.Trigger>
          ) : null}
        </p>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.dialogContent} aria-label={`${title} overview`}>
            <div className={styles.dialogHeader}>
              <Dialog.Title>{title} — Overview</Dialog.Title>
              <Dialog.Close asChild>
                <button className={styles.dialogClose}>
                  <CrossCircledIcon />
                </button>
              </Dialog.Close>
            </div>
            <div className={styles.dialogBody}>{overview}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default MediaTitleBlock;
