import React from "react";
import styles from "./NewSpecies.module.scss";
import { Species } from "types/api";
import { useTranslation } from "hooks/useTranslation";

type Props = {
  cachedSpecies: Species[];
  freshSpecies: Species[] | undefined;
  stationId: string | null;
};

export const NewSpecies: React.FC<Props> = ({
  cachedSpecies,
  freshSpecies,
  stationId,
}) => {
  const { t } = useTranslation();

  // Only show when we have both cached (previous) and fresh (current) data
  if (!stationId || !freshSpecies || cachedSpecies.length === 0) return null;

  // Find species in fresh data that weren't in cached data
  const cachedIds = new Set(cachedSpecies.map((species) => species.id));
  const newSpecies = freshSpecies.filter(
    (species) => !cachedIds.has(species.id)
  );

  // Don't show if no new species
  if (newSpecies.length === 0) return null;

  // If all species are new, don't show anything (first visit)
  if (newSpecies.length === freshSpecies.length) return null;

  // If there is a ton of new species, don't show anything
  if (newSpecies.length > 12) return null;

  return (
    <div className={styles.wrap}>
      <p>
        {newSpecies.length}{" "}
        {newSpecies.length === 1 ? t("newSpecie") : t("newSpecies")}{" "}
        {t("sinceLastVisit")}:
      </p>

      <div>
        {newSpecies.map((species, index) => (
          <React.Fragment key={species.id}>
            {index > 0 && ", "}
            <strong>{species.commonName}</strong>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
