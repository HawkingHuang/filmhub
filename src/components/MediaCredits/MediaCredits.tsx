import { Link } from "react-router-dom";
import { PROFILE_IMAGE_SIZES, PROFILE_IMAGE_SIZES_ATTR, buildTmdbImageSrcSet, buildTmdbImageUrl } from "../../lib/api";
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
        const profileSrcSet = member.profile_path ? buildTmdbImageSrcSet(member.profile_path, PROFILE_IMAGE_SIZES) : null;
        const profileSrc = member.profile_path ? buildTmdbImageUrl(member.profile_path, PROFILE_IMAGE_SIZES.md) : imageFallbackPortrait;

        return (
          <Link className={styles.castLink} key={member.id} to={`/actors/${member.id}`}>
            <div className={styles.castItem}>
              <picture>
                {profileSrcSet ? <source srcSet={profileSrcSet} sizes={PROFILE_IMAGE_SIZES_ATTR} /> : null}
                <img
                  className={styles.castImage}
                  src={profileSrc}
                  srcSet={profileSrcSet ?? undefined}
                  sizes={PROFILE_IMAGE_SIZES_ATTR}
                  alt={member.name}
                  onError={(e) => {
                    e.currentTarget.src = imageFallbackPortrait;
                  }}
                />
              </picture>
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
