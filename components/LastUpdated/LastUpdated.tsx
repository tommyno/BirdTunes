import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./LastUpdated.module.scss";
import { timeDetailedNow } from "utils/date";
import { useTranslation } from "hooks/useTranslation";

export const LastUpdated: React.FC = () => {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const { t } = useTranslation();

  // Avoid hydration error
  useEffect(() => {
    setTime(timeDetailedNow());
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.content}>
        <a href="#">
          <img src="/icons/arrow-up.svg" alt="Refresh" />
        </a>
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
