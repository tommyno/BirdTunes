import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./LastUpdated.module.scss";
import { timeDetailedNow } from "utils/date";
import { useTranslation } from "hooks/useTranslation";

export const LastUpdated: React.FC<{ lang?: string | null }> = ({ lang }) => {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const { t } = useTranslation();

  // Avoid hydration error
  useEffect(() => {
    setTime(timeDetailedNow(lang));
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.content}>
        <button
          className={styles.button}
          title={t("toTop")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img src="/icons/arrow-up.svg" alt={t("toTop")} />
        </button>

        <p className="no-wrap">
          {t("lastUpdated")} {time}
        </p>

        <button
          className={styles.button}
          title="Refresh"
          onClick={() => router.reload()}
        >
          <img src="/icons/refresh.svg" alt="Refresh" />
        </button>
      </div>
    </div>
  );
};
