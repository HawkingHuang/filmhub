import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Genre from "../../components/Genre/Genre";
import styles from "./Home.module.scss";

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";

  useEffect(() => {
    if (!searchParams.get("type")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("type", "movie");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleTypeChange = (nextType: "movie" | "tv") => {
    if (nextType === type) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("type", nextType);
    setSearchParams(nextParams);
  };

  return (
    <>
      <div className="container">
        <div className={styles.toggleWrap}>
          <div className={styles.typeToggle} role="tablist" aria-label="Media type">
            <button type="button" className={styles.toggleButton} data-active={type === "movie"} onClick={() => handleTypeChange("movie")}>
              Movies
            </button>
            <button type="button" className={styles.toggleButton} data-active={type === "tv"} onClick={() => handleTypeChange("tv")}>
              TV Series
            </button>
          </div>
        </div>
      </div>
      <Genre searchParams={searchParams} />
    </>
  );
}

export default Home;
