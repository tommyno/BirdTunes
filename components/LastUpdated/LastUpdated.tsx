import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./LastUpdated.module.scss";
import { timeDetailedNow } from "utils/date";
import { useTranslation } from "hooks/useTranslation";
import { LoadingDots } from "components/LoadingDots/LoadingDots";

export const LastUpdated: React.FC<{
  lang?: string | null;
  isUpdating?: boolean;
}> = ({ lang, isUpdating }) => {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const { t } = useTranslation();

  // Avoid hydration error
  useEffect(() => {
    // Update time when a fetch completes
    if (!isUpdating) {
      setTime(timeDetailedNow(lang));
    }
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
          title="Refresh"
          onClick={() => router.reload()}
        >
          <img
            src="/icons/refresh.svg"
            alt="Refresh"
            className={isUpdating ? styles.spinning : undefined}
          />
        </button>
      </div>
    </div>
  );
};
