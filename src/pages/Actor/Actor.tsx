import { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./Actor.module.scss";
import ErrorState from "../../components/ErrorState/ErrorState";
import FullPageSpinner from "../../components/FullPageSpinner/FullPageSpinner";
import ActorBioSection from "../../components/ActorBioSection/ActorBioSection";
import ActorCreditsHeader from "../../components/ActorCreditsHeader/ActorCreditsHeader";
import ActorProfile from "../../components/ActorProfile/ActorProfile";
import ResultsGrid, { type ResultsGridItem } from "../../components/ResultsGrid";
import { useActorDetail } from "../../hooks/useActorDetail";
import { useActorCredits } from "../../hooks/useActorCredits";
import { deriveActorCreditsView, getActorCreditTitle, type CreditMode } from "../../utils/actorCreditsUtils";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";

function Actor() {
  const { id } = useParams();

  // Data fetching
  const { data: actor, isLoading, isError } = useActorDetail(id);
  const { data: creditsData, isError: isCreditsError } = useActorCredits(id);

  // Local UI state
  const [creditQuery, setCreditQuery] = useState("");
  const [creditYear, setCreditYear] = useState("all");
  const [creditMode, setCreditMode] = useState<CreditMode>("movie");

  const { creditYears, filteredCredits, yearAriaLabel } = deriveActorCreditsView({
    credits: creditsData?.cast,
    creditMode,
    creditYear,
    creditQuery,
  });

  const creditItems: ResultsGridItem[] = filteredCredits.map((credit, index) => {
    const posterPath = credit.poster_path || credit.backdrop_path || null;
    const titleText = getActorCreditTitle(credit);
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

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isError || !actor) {
    return (
      <div className="container">
        <ErrorState message="Unable to load actor details." />
      </div>
    );
  }

  return (
    <div className="container">
      <section className={styles.topSection}>
        <ActorProfile profilePath={actor.profile_path} actorName={actor.name} />
        <ActorBioSection actor={actor} />
      </section>

      {isCreditsError ? (
        <ErrorState message="Unable to load credits." />
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
          {creditItems.length > 0 ? <ResultsGrid items={creditItems} /> : <ErrorState message="No credits found." />}
        </section>
      )}
    </div>
  );
}

export default Actor;
