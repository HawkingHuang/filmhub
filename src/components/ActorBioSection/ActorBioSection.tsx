import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CrossCircledIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { useIsClamped } from "../../hooks/useIsClamped";
import type { ActorDetail } from "../../types/actorTypes";
import styles from "./ActorBioSection.module.scss";

type ActorBioSectionProps = {
  actor: ActorDetail;
};

function ActorBioSection({ actor }: ActorBioSectionProps) {
  const [isBioOpen, setIsBioOpen] = useState(false);
  const { ref: biographyRef, isClamped } = useIsClamped(actor.biography ?? "");

  return (
    <div className={styles.bioSection}>
      <h1 className={styles.actorName}>{actor.name}</h1>
      <Dialog.Root open={isBioOpen} onOpenChange={setIsBioOpen}>
        <div className={styles.bioInfoRow}>
          <div className={styles.biographyWrap}>
            <p className={styles.biography} ref={biographyRef}>
              {actor.biography || "No biography available."}
              {actor.biography && isClamped ? (
                <Dialog.Trigger asChild>
                  <button className={styles.readMore}>
                    <OpenInNewWindowIcon />
                    More
                  </button>
                </Dialog.Trigger>
              ) : null}
            </p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Birthday</span>
              <span className={styles.infoValue}>{actor.birthday || "—"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Place of Birth</span>
              <span className={styles.infoValue}>{actor.place_of_birth || "—"}</span>
            </div>
          </div>
        </div>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.dialogContent} aria-label={`${actor.name} biography`}>
            <div className={styles.dialogHeader}>
              <Dialog.Title>{actor.name} — Biography</Dialog.Title>
              <Dialog.Close asChild>
                <button className={styles.dialogClose}>
                  <CrossCircledIcon />
                </button>
              </Dialog.Close>
            </div>
            <div className={styles.dialogBody}>{actor.biography}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default ActorBioSection;
