import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PROFILE_IMAGE_SIZES, PROFILE_IMAGE_SIZES_ATTR, buildTmdbImageSrcSet, buildTmdbImageUrl } from "../../lib/api";
import type { ActorCredit } from "../../types/actorTypes";
import styles from "./Actor.module.scss";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import ActorBioSection from "../../components/ActorBioSection/ActorBioSection";
import ActorCreditsHeader from "../../components/ActorCreditsHeader/ActorCreditsHeader";
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
      const titleText = getCreditTitle(credit);
      const itemKey = `${credit.media_type}-${credit.id}-${credit.credit_id ?? index}`;
      return {
        id: itemKey,
        href: credit.media_type === "tv" ? `/tv/${credit.id}` : `/movies/${credit.id}`,
        title: titleText,
        imageSrc: imageFallbackPortrait,
        imagePath: posterPath,
        imageType: posterPath ? "poster" : undefined,
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

  const profileSrcSet = actor.profile_path ? buildTmdbImageSrcSet(actor.profile_path, PROFILE_IMAGE_SIZES) : null;
  const profileSrc = actor.profile_path ? buildTmdbImageUrl(actor.profile_path, PROFILE_IMAGE_SIZES.md) : imageFallbackPortrait;

  return (
    <div className="container">
      <section className={styles.topSection}>
        <div className={styles.profileWrap}>
          <picture>
            {profileSrcSet ? <source srcSet={profileSrcSet} sizes={PROFILE_IMAGE_SIZES_ATTR} /> : null}
            <img
              className={styles.profileImage}
              src={profileSrc}
              srcSet={profileSrcSet ?? undefined}
              sizes={PROFILE_IMAGE_SIZES_ATTR}
              alt={actor.name}
              onError={(e) => {
                e.currentTarget.src = imageFallbackPortrait;
              }}
            />
          </picture>
        </div>
        <ActorBioSection actor={actor} />
      </section>

      {isCreditsError ? (
        <div className={styles.state}>Unable to load credits.</div>
      ) : (
        <section className={styles.creditsSection}>
          <ActorCreditsHeader
            creditMode={creditMode}
            creditYear={creditYear}
            creditYears={creditYears}
            creditQuery={creditQuery}
            yearAriaLabel={yearAriaLabel}
            onModeChange={(mode) => {
              setCreditMode(mode);
              setCreditYear("all");
            }}
            onYearChange={setCreditYear}
            onQueryChange={setCreditQuery}
            onClearQuery={() => setCreditQuery("")}
          />
          {creditItems.length > 0 ? <ResultsGrid items={creditItems} /> : <div>No credits found.</div>}
        </section>
      )}
    </div>
  );
}

export default Actor;
