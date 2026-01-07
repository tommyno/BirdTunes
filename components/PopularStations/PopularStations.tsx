import React from "react";
import Link from "next/link";

import { useTranslation } from "hooks/useTranslation";
import { useQueryParam } from "hooks/useQueryParams";
import styles from "./PopularStations.module.scss";
import { Block } from "components/Block";

const popularStations = [
  { id: 8588, name: "Nesodden (Norway)" },
  { id: 18836, name: "Lilleby (Sweden)" },
  { id: 12540, name: "Abbey Road Allotments (England)" },
  { id: 4445, name: "Würenlingen (Switzerland)" },
  { id: 11264, name: "Sanjiacun (China)" },
  { id: 5566, name: "Sunshine Coast (Australia)" },
  { id: 17860, name: "Brisbane (Australia)" },
  { id: 19519, name: "Eastside Landing (Canada)" },
  { id: 19555, name: "Austin (USA)" },
  { id: 10737, name: "National park (Belize)" },
];

export const PopularStations: React.FC = () => {
  const { t } = useTranslation();
  const [lang] = useQueryParam({ key: "lang" });

  return (
    <div className={styles.wrap}>
      <h2>{t("popularStations")}</h2>

      <div className={styles.stations}>
        {popularStations.map((station) => (
          <Link
            className={styles.stationLink}
            href={`?station=${station.id}${lang ? `&lang=${lang}` : ""}`}
            key={station.id}
          >
            {station.name}{" "}
            <span className={styles.stationId}>#{station.id}</span>
          </Link>
        ))}
      </div>

      <Block top="6">
        <p>
          <a
            href="https://app.birdweather.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            {t("findOtherStations")} ↗
          </a>
        </p>
      </Block>
    </div>
  );
};
