import React from "react";
import styles from "./NewSpecies.module.scss";
import { Species } from "hooks/useFetchSpecies";
import { useNewSpecies } from "hooks/useNewSpecies";
import { useTranslation } from "hooks/useTranslation";

type Props = {
  speciesData: Species[];
};

export const NewSpecies: React.FC<Props> = ({ speciesData }) => {
  const { t } = useTranslation();

  const totalNewSpecies = 0;

  return (
    <div className={styles.wrap}>
      <p>
        {totalNewSpecies} {t("newSpecies")} {t("sinceLastVisit")}:
      </p>
    </div>
  );
};
