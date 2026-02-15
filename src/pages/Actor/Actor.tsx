import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { POSTER_BASE_URL, PROFILE_BASE_URL } from "../../lib/api";
import type { ActorCredit } from "../../types/actorTypes";
import styles from "./Actor.module.scss";
import { CrossCircledIcon, MagnifyingGlassIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Select } from "@radix-ui/themes";
import * as Dialog from "@radix-ui/react-dialog";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import ResultsGrid, { type ResultsGridItem } from "../../components/ResultsGrid";
import { useIsClamped } from "../../hooks/useIsClamped";
import { useActorDetail } from "../../hooks/useActorDetail";
import { useActorCredits } from "../../hooks/useActorCredits";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";

function Actor() {
  const { id } = useParams();

  // Data fetching
  const { data: actor, isLoading, isError } = useActorDetail(id);
  const { data: creditsData, isError: isCreditsError } = useActorCredits(id);

  // Local UI state
  const [creditQuery, setCreditQuery] = useState("");
  const [creditYear, setCreditYear] = useState("all");
  const [isBioOpen, setIsBioOpen] = useState(false);

  // Derived UI helpers
  const { ref: biographyRef, isClamped } = useIsClamped(actor?.biography ?? "");
  const credits = useMemo(() => creditsData?.cast ?? [], [creditsData]);
  const creditYears = useMemo(() => {
    const years = new Set<string>();
    credits.forEach((credit) => {
      const year = credit.release_date?.slice(0, 4);
      if (year) {
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [credits]);

  // sort credits by release_date descending (latest first). Empty dates sort last.
  const sortedCredits = useMemo(() => {
    return [...credits].sort((a, b) => {
      const da = a.release_date ?? "";
      const db = b.release_date ?? "";
      // ISO date strings compare lexicographically
      if (da === db) return 0;
      if (!db) return -1;
      if (!da) return 1;
      return db.localeCompare(da);
    });
  }, [credits]);

  const filteredCredits = useMemo(() => {
    const normalizedQuery = creditQuery.trim().toLowerCase();
    const yearFiltered = creditYear === "all" ? sortedCredits : sortedCredits.filter((credit) => credit.release_date?.startsWith(creditYear));

    if (!normalizedQuery) {
      return yearFiltered;
    }
    return yearFiltered.filter((credit) => {
      const title = credit.title?.toLowerCase() ?? "";
      const character = credit.character?.toLowerCase() ?? "";
      return title.includes(normalizedQuery) || character.includes(normalizedQuery);
    });
  }, [creditQuery, creditYear, sortedCredits]);

  const creditItems = useMemo<ResultsGridItem[]>(() => {
    return filteredCredits.map((credit: ActorCredit) => {
      const posterPath = credit.poster_path || credit.backdrop_path || null;
      const posterUrl = posterPath ? `${POSTER_BASE_URL}${posterPath}` : imageFallbackPortrait;
      const titleText = credit.title ?? "Untitled";
      return {
        id: credit.id,
        href: `/movies/${credit.id}`,
        title: titleText,
        imageSrc: posterUrl,
        alt: titleText,
        meta: <div className={styles.creditMeta}>{credit.character || "—"}</div>,
      };
    });
  }, [filteredCredits]);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isError || !actor) {
    return (
      <div className="container">
        <div className={styles.state}>Unable to load actor details.</div>
      </div>
    );
  }

  const profileUrl = actor.profile_path ? `${PROFILE_BASE_URL}${actor.profile_path}` : imageFallbackPortrait;

  return (
    <div className="container">
      <section className={styles.topSection}>
        <div className={styles.profileWrap}>
          <img
            className={styles.profileImage}
            src={profileUrl}
            alt={actor.name}
            onError={(e) => {
              e.currentTarget.src = imageFallbackPortrait;
            }}
          />
        </div>
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
      </section>

      {isCreditsError ? (
        <div className={styles.state}>Unable to load credits.</div>
      ) : (
        <section className={styles.creditsSection}>
          <div className={styles.creditsHeader}>
            <h2 className={styles.creditsTitle}>Credits</h2>
            <div className={styles.creditsControls}>
              <Select.Root value={creditYear} onValueChange={setCreditYear}>
                <Select.Trigger className={styles.creditsSelectTrigger} aria-label="Filter by year" />
                <Select.Content className={styles.creditsSelectContent}>
                  <Select.Item value="all">All years</Select.Item>
                  {creditYears.map((year) => (
                    <Select.Item key={year} value={year}>
                      {year}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <div className={styles.creditsFilterWrap}>
                <input
                  className={styles.creditsFilter}
                  type="search"
                  placeholder="Enter title or characters..."
                  value={creditQuery}
                  onChange={(event) => setCreditQuery(event.target.value)}
                  aria-label="Filter credits"
                />
                {creditQuery ? (
                  <button type="button" className={styles.clearFilter} aria-label="Clear filter" onClick={() => setCreditQuery("")}>
                    <CrossCircledIcon />
                  </button>
                ) : (
                  <MagnifyingGlassIcon className={styles.searchIcon} />
                )}
              </div>
            </div>
          </div>
          {creditItems.length > 0 ? <ResultsGrid items={creditItems} /> : <div>No credits found.</div>}
        </section>
      )}
    </div>
  );
}

export default Actor;
