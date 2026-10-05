import React from "react";

import { useTranslation } from "hooks/useTranslation";
import { classNames } from "utils/classNames";
import styles from "./StationFilter.module.scss";

const OPTIONS = [
  { onlyActive: false, labelKey: "allStations" },
  { onlyActive: true, labelKey: "activeStations" },
] as const;

type Props = {
  showOnlyActive: boolean;
  onChange: (showOnlyActive: boolean) => void;
};

export const StationFilter: React.FC<Props> = ({ showOnlyActive, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrap}>
      {OPTIONS.map(({ onlyActive, labelKey }) => {
        const isSelected = showOnlyActive === onlyActive;
        const buttonClass = classNames(
          styles.button,
          isSelected && styles["-selected"],
        );

        return (
          <button
            key={labelKey}
            type="button"
            className={buttonClass}
            aria-pressed={isSelected}
            onClick={() => onChange(onlyActive)}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
};
