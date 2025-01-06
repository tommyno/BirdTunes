import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./Settings.module.scss";
import { Species } from "hooks/useFetchSpecies";
import { Input } from "components/Input/Input";
import Link from "next/link";

type Props = {
  speciesData?: Species[];
  speciesError?: Error | null;
  stationId?: string | null;
  stationName?: string | null;
};

export const Settings: React.FC<Props> = ({
  speciesData,
  speciesError,
  stationId,
  stationName,
}) => {
  const totalDetections = speciesData?.reduce(
    (total, species) => total + species.detections.total,
    0
  );

  return (
    <div className={styles.wrap}>
      <p>
        {totalDetections} observasjoner · {speciesData?.length || 0} arter
      </p>
      {stationId && (
        <p>
          <Link
            className="link"
            href={`https://app.birdweather.com/stations/${stationId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {stationName}
          </Link>
        </p>
      )}

      {speciesError && <p>{speciesError.toString()}</p>}
    </div>
  );
};
