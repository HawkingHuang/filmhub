import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { POSTER_BASE_URL, PROFILE_BASE_URL } from "../../lib/api";
import type { ActorCredit } from "../../types/actorTypes";
import styles from "./Actor.module.scss";
import { CrossCircledIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Select } from "@radix-ui/themes";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import ActorBioSection from "../../components/ActorBioSection/ActorBioSection";
import ResultsGrid, { type ResultsGridItem } from "../../components/ResultsGrid";
import { useActorDetail } from "../../hooks/useActorDetail";
import { useActorCredits } from "../../hooks/useActorCredits";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";

type CreditMode = "movie" | "tv";

function Actor() {
  const { id } = useParams();

  // Data fetching
  const { data: actor, isLoading, isError } = useActorDetail(id);
  const { data: creditsData, isError: isCreditsError } = useActorCredits(id);

  // Local UI state
  const [creditQuery, setCreditQuery] = useState("");
  const [creditYear, setCreditYear] = useState("all");
  const [creditMode, setCreditMode] = useState<CreditMode>("movie");

  // Derived UI helpers
  const getCreditTitle = (credit: ActorCredit) => (credit.media_type === "tv" ? credit.name : credit.title) ?? "Untitled";
  const getCreditDate = (credit: ActorCredit) => (credit.media_type === "tv" ? credit.first_air_date : credit.release_date) ?? "";

  const credits = useMemo(() => creditsData?.cast ?? [], [creditsData]);
  const movieCredits = useMemo(() => credits.filter((credit) => credit.media_type === "movie"), [credits]);
  const tvCredits = useMemo(() => credits.filter((credit) => credit.media_type === "tv"), [credits]);
  const selectedCredits = useMemo(() => (creditMode === "movie" ? movieCredits : tvCredits), [creditMode, movieCredits, tvCredits]);

  const yearAriaLabel = creditMode === "movie" ? "Filter by year" : "Filter by first aired year";

  const creditYears = useMemo(() => {
    const years = new Set<string>();
    selectedCredits.forEach((credit) => {
      const year = getCreditDate(credit).slice(0, 4);
      if (year) {
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [selectedCredits]);

  // sort credits by release/first-air date descending (latest first). Empty dates sort last.
  const sortedCredits = useMemo(() => {
    return [...selectedCredits].sort((a, b) => {
      const da = getCreditDate(a);
      const db = getCreditDate(b);
      // ISO date strings compare lexicographically
      if (da === db) return 0;
      if (!db) return -1;
      if (!da) return 1;
      return db.localeCompare(da);
    });
  }, [selectedCredits]);

  const filteredCredits = useMemo(() => {
    const normalizedQuery = creditQuery.trim().toLowerCase();
    const yearFiltered = creditYear === "all" ? sortedCredits : sortedCredits.filter((credit) => getCreditDate(credit).startsWith(creditYear));

    if (!normalizedQuery) {
      return yearFiltered;
    }
    return yearFiltered.filter((credit) => {
      const title = getCreditTitle(credit).toLowerCase();
      const character = credit.character?.toLowerCase() ?? "";
      return title.includes(normalizedQuery) || character.includes(normalizedQuery);
    });
  }, [creditQuery, creditYear, sortedCredits]);

  const creditItems = useMemo<ResultsGridItem[]>(() => {
    return filteredCredits.map((credit: ActorCredit, index) => {
      const posterPath = credit.poster_path || credit.backdrop_path || null;
      const posterUrl = posterPath ? `${POSTER_BASE_URL}${posterPath}` : imageFallbackPortrait;
      const titleText = getCreditTitle(credit);
      const itemKey = `${credit.media_type}-${credit.id}-${credit.credit_id ?? index}`;
      return {
        id: itemKey,
        href: credit.media_type === "tv" ? `/tv/${credit.id}` : `/movies/${credit.id}`,
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
        <ActorBioSection actor={actor} />
      </section>

      {isCreditsError ? (
        <div className={styles.state}>Unable to load credits.</div>
      ) : (
        <section className={styles.creditsSection}>
          <div className={styles.creditsHeader}>
            <h2 className={styles.creditsTitle}>Credits</h2>
            <div className={styles.creditsControls}>
              <div className={styles.creditsModeToggle} role="group" aria-label="Credit type">
                <button
                  type="button"
                  className={`${styles.modeButton} ${creditMode === "movie" ? styles.modeButtonActive : ""}`}
                  aria-pressed={creditMode === "movie"}
                  onClick={() => {
                    setCreditMode("movie");
                    setCreditYear("all");
                  }}
                >
                  Movies
                </button>
                <button
                  type="button"
                  className={`${styles.modeButton} ${creditMode === "tv" ? styles.modeButtonActive : ""}`}
                  aria-pressed={creditMode === "tv"}
                  onClick={() => {
                    setCreditMode("tv");
                    setCreditYear("all");
                  }}
                >
                  TV
                </button>
              </div>
              <div className={styles.creditsSelectGroup}>
                <Select.Root value={creditYear} onValueChange={setCreditYear}>
                  <Select.Trigger className={styles.creditsSelectTrigger} aria-label={yearAriaLabel} />
                  <Select.Content className={styles.creditsSelectContent}>
                    <Select.Item value="all">All years</Select.Item>
                    {creditYears.map((year) => (
                      <Select.Item key={year} value={year}>
                        {year}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
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
