import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./LastUpdated.module.scss";
import { timeDetailedNow } from "utils/date";

export const LastUpdated: React.FC = () => {
  const router = useRouter();
  const [time, setTime] = useState<string>("");

  // Avoid hydration error
  useEffect(() => {
    setTime(timeDetailedNow());
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.content}>
        <p className="no-wrap">Sist oppdatert: {time}</p>
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
