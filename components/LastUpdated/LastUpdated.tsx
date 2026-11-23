import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useTranslation } from "hooks/useTranslation";
import { timeDetailedNow } from "utils/date";
import { LoadingDots } from "components/LoadingDots";
import styles from "./LastUpdated.module.scss";

type Props = {
  lang?: string | null;
  isUpdating?: boolean;
};

export const LastUpdated: React.FC<Props> = ({ lang, isUpdating }) => {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const { t } = useTranslation();

  // Update time when a fetch completes. Reading the clock has to wait until
  // after hydration, otherwise server and client render different times.
  useEffect(() => {
    if (isUpdating) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(timeDetailedNow(lang));
  }, [isUpdating]);

  return (
    <div className={styles.wrap} key={time}>
      <div className={styles.content}>
        <button
          className={styles.button}
          title={t("toTop")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img src="/icons/arrow-up.svg" alt={t("toTop")} />
        </button>

        <p className={styles.lastUpdatedText}>
          {isUpdating ? (
            <>
              {t("updating")} <LoadingDots />
            </>
          ) : (
            `${t("lastUpdated")} ${time}`
          )}
        </p>

        <button
          className={styles.button}
          title={t("refresh")}
          onClick={() => router.reload()}
        >
          <img
            src="/icons/refresh.svg"
            alt={t("refresh")}
            className={isUpdating ? styles.spinning : undefined}
          />
        </button>
      </div>
    </div>
  );
};
