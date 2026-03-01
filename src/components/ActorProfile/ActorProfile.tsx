import { PROFILE_IMAGE_SIZES, PROFILE_IMAGE_SIZES_ATTR, buildTmdbImageSrcSet, buildTmdbImageUrl } from "../../lib/api";
import imageFallbackPortrait from "../../assets/images/image_fallback_portrait.webp";
import styles from "./ActorProfile.module.scss";

type ActorProfileProps = {
  profilePath: string | null | undefined;
  actorName: string;
};

function ActorProfile({ profilePath, actorName }: ActorProfileProps) {
  const profileSrcSet = profilePath ? buildTmdbImageSrcSet(profilePath, PROFILE_IMAGE_SIZES) : null;
  const profileSrc = profilePath ? buildTmdbImageUrl(profilePath, PROFILE_IMAGE_SIZES.md) : imageFallbackPortrait;

  return (
    <div className={styles.profileWrap}>
      <picture>
        {profileSrcSet ? <source srcSet={profileSrcSet} sizes={PROFILE_IMAGE_SIZES_ATTR} /> : null}
        <img
          className={styles.profileImage}
          src={profileSrc}
          srcSet={profileSrcSet ?? undefined}
          sizes={PROFILE_IMAGE_SIZES_ATTR}
          alt={actorName}
          onError={(e) => {
            e.currentTarget.src = imageFallbackPortrait;
          }}
        />
      </picture>
    </div>
  );
}

export default ActorProfile;
