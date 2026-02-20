import { Link } from "react-router-dom";
import { PROFILE_BASE_URL } from "../../lib/api";
import type { CreditPerson } from "../../types/movieTypes";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";
import styles from "./MediaCredits.module.scss";

type MediaCreditsProps = {
  castMembers: CreditPerson[];
};

function MediaCredits({ castMembers }: MediaCreditsProps) {
  return (
    <div className={styles.castList}>
      {castMembers.map((member) => {
        const profileUrl = member.profile_path ? `${PROFILE_BASE_URL}${member.profile_path}` : imageFallbackPortrait;
        return (
          <Link className={styles.castLink} key={member.id} to={`/actors/${member.id}`}>
            <div className={styles.castItem}>
              <img
                className={styles.castImage}
                src={profileUrl}
                alt={member.name}
                onError={(e) => {
                  e.currentTarget.src = imageFallbackPortrait;
                }}
              />
              <div className={styles.castName}>{member.name}</div>
              <div className={styles.castCharacter}>{member.character || "—"}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default MediaCredits;
