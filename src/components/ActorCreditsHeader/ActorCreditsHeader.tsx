import { CrossCircledIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Select } from "@radix-ui/themes";
import styles from "./ActorCreditsHeader.module.scss";

type CreditMode = "movie" | "tv";

type ActorCreditsHeaderProps = {
  creditMode: CreditMode;
  creditYear: string;
  creditYears: string[];
  creditQuery: string;
  yearAriaLabel: string;
  onModeChange: (mode: CreditMode) => void;
  onYearChange: (year: string) => void;
  onQueryChange: (query: string) => void;
  onClearQuery: () => void;
};

function ActorCreditsHeader({ creditMode, creditYear, creditYears, creditQuery, yearAriaLabel, onModeChange, onYearChange, onQueryChange, onClearQuery }: ActorCreditsHeaderProps) {
  return (
    <div className={styles.creditsHeader}>
      <h2 className={styles.creditsTitle}>Credits</h2>
      <div className={styles.creditsControls}>
        <div className={styles.creditsModeToggle} role="group" aria-label="Credit type">
          <button type="button" className={`${styles.modeButton} ${creditMode === "movie" ? styles.modeButtonActive : ""}`} aria-pressed={creditMode === "movie"} onClick={() => onModeChange("movie")}>
            Movies
          </button>
          <button type="button" className={`${styles.modeButton} ${creditMode === "tv" ? styles.modeButtonActive : ""}`} aria-pressed={creditMode === "tv"} onClick={() => onModeChange("tv")}>
            TV
          </button>
        </div>
        <div className={styles.creditsSelectGroup}>
          <Select.Root value={creditYear} onValueChange={onYearChange}>
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
            onChange={(event) => onQueryChange(event.target.value)}
            aria-label="Filter credits"
          />
          {creditQuery ? (
            <button type="button" className={styles.clearFilter} aria-label="Clear filter" onClick={onClearQuery}>
              <CrossCircledIcon />
            </button>
          ) : (
            <MagnifyingGlassIcon className={styles.searchIcon} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ActorCreditsHeader;
