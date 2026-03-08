import type { ActorCredit } from "../types/actorTypes";

export type CreditMode = "movie" | "tv";

type DeriveActorCreditsViewParams = {
  credits?: ActorCredit[];
  creditMode: CreditMode;
  creditYear: string;
  creditQuery: string;
};

export const getActorCreditTitle = (credit: ActorCredit) => (credit.media_type === "tv" ? credit.name : credit.title) ?? "Untitled";

export const getActorCreditDate = (credit: ActorCredit) => (credit.media_type === "tv" ? credit.first_air_date : credit.release_date) ?? "";

export const deriveActorCreditsView = ({ credits = [], creditMode, creditYear, creditQuery }: DeriveActorCreditsViewParams) => {
  const movieCredits = credits.filter((credit) => credit.media_type === "movie");
  const tvCredits = credits.filter((credit) => credit.media_type === "tv");
  const selectedCredits = creditMode === "movie" ? movieCredits : tvCredits;
  const yearAriaLabel = creditMode === "movie" ? "Filter by year" : "Filter by first aired year";

  const creditYears = Array.from(new Set(selectedCredits.map((credit) => getActorCreditDate(credit).slice(0, 4)).filter(Boolean))).sort((a, b) => b.localeCompare(a));

  const sortedCredits = [...selectedCredits].sort((a, b) => {
    const creditDateA = getActorCreditDate(a);
    const creditDateB = getActorCreditDate(b);

    if (creditDateA === creditDateB) return 0;
    if (!creditDateB) return -1;
    if (!creditDateA) return 1;
    return creditDateB.localeCompare(creditDateA);
  });

  const normalizedQuery = creditQuery.trim().toLowerCase();
  const yearFilteredCredits = creditYear === "all" ? sortedCredits : sortedCredits.filter((credit) => getActorCreditDate(credit).startsWith(creditYear));

  const filteredCredits = !normalizedQuery
    ? yearFilteredCredits
    : yearFilteredCredits.filter((credit) => {
        const title = getActorCreditTitle(credit).toLowerCase();
        const character = credit.character?.toLowerCase() ?? "";
        return title.includes(normalizedQuery) || character.includes(normalizedQuery);
      });

  return {
    creditYears,
    filteredCredits,
    yearAriaLabel,
  };
};
