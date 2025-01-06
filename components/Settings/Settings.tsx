import React, { useState } from "react";
import styles from "./Settings.module.scss";
import { Species } from "hooks/useFetchSpecies";
import { Input } from "components/Input/Input";
import { Button } from "components/Button";
import router from "next/router";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [inputValue, setInputValue] = useState(stationId || "");

  const totalDetections = speciesData?.reduce(
    (total, species) => total + species.detections.total,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const query = { ...router.query, station: inputValue };

    router.replace({ query }, undefined, { shallow: true });
    setIsEditMode(false);
  };

  return (
    <div className={styles.wrap}>
      {!isEditMode && (
        <>
          {stationId && (
            <p>
              <strong>
                <button className="link" onClick={() => setIsEditMode(true)}>
                  {stationName}
                </button>
              </strong>
            </p>
          )}

          <p>
            {totalDetections} observasjoner · {speciesData?.length || 0} arter
          </p>

          {speciesError && <p>{speciesError.toString()}</p>}
        </>
      )}

      {isEditMode && (
        <>
          <p>
            Stasjon ID fra{" "}
            <a href="https://app.birdweather.com/" className="link">
              BirdWeather ↗
            </a>
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              value={inputValue}
              handleChange={handleInputChange}
              width="small"
            />

            <Button type="submit">Lagre</Button>
          </form>
        </>
      )}
    </div>
  );
};
