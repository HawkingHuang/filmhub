import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { POSTER_BASE_URL, PROFILE_BASE_URL } from "../../lib/api";
import { fetchActorCredits, fetchActorDetail } from "../../utils/apiUtils";
import type { ActorCredit } from "../../types/actorTypes";
import styles from "./Actor.module.scss";
import { CrossCircledIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Select } from "@radix-ui/themes";
import * as Dialog from "@radix-ui/react-dialog";

function Actor() {
  const { id } = useParams();

  const {
    data: actor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["actor", id],
    queryFn: () => fetchActorDetail(id ?? ""),
    enabled: Boolean(id),
  });

  const { data: creditsData } = useQuery({
    queryKey: ["actor", id, "credits"],
    queryFn: () => fetchActorCredits(id ?? ""),
    enabled: Boolean(id),
  });

  const credits = useMemo(() => creditsData?.cast ?? [], [creditsData]);
  const [creditQuery, setCreditQuery] = useState("");
  const [creditYear, setCreditYear] = useState("all");

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

  const [isBioOpen, setIsBioOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container">
        <div className={styles.state}>Loading actor...</div>
      </div>
    );
  }

  if (isError || !actor) {
    return (
      <div className="container">
        <div className={styles.state}>Unable to load actor details.</div>
      </div>
    );
  }

  const profileUrl = actor.profile_path ? `${PROFILE_BASE_URL}${actor.profile_path}` : null;

  return (
    <div className="container">
      <section className={styles.topSection}>
        <div className={styles.profileWrap}>{profileUrl ? <img className={styles.profileImage} src={profileUrl} alt={actor.name} /> : <div className={styles.profileFallback}>No image</div>}</div>
        <div className={styles.bioSection}>
          <h1 className={styles.actorName}>{actor.name}</h1>
          <Dialog.Root open={isBioOpen} onOpenChange={setIsBioOpen}>
            <div className={styles.bioInfoRow}>
              <div className={styles.biographyWrap}>
                <p className={styles.biography}>
                  {actor.biography || "No biography available."}
                  {actor.biography ? (
                    <Dialog.Trigger asChild>
                      <button className={styles.readMore}>Read more</button>
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
        <div className={styles.creditsGrid}>
          {filteredCredits.length > 0 ? (
            filteredCredits.map((credit: ActorCredit) => {
              const posterPath = credit.poster_path || credit.backdrop_path || null;
              const posterUrl = posterPath ? `${POSTER_BASE_URL}${posterPath}` : null;
              return (
                <Link key={credit.id} to={`/movies/${credit.id}`} className={styles.creditLink}>
                  <div className={styles.creditCard}>
                    {posterUrl ? <img className={styles.creditPoster} src={posterUrl} alt={credit.title} /> : <div className={styles.creditPosterFallback}>No poster</div>}
                    <div className={styles.creditTitle}>{credit.title}</div>
                    <div className={styles.creditMeta}>{credit.character || "—"}</div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div>No credits found.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Actor;
