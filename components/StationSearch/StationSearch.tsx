import React, { useState } from "react";
import styles from "./StationSearch.module.scss";
import { Input } from "components/Input/Input";
import { useRouter } from "next/router";
import { useTranslation } from "hooks/useTranslation";
import { setQueryParams } from "hooks/useQueryParams";
import { useStationSearch } from "hooks/useStationSearch";
import { SearchStation } from "types/api";
import { Spinner } from "components/Spinner";

type Props = {
  stationId?: string | null;
};

export const StationSearch: React.FC<Props> = ({ stationId }) => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { t } = useTranslation();

  const { data: searchResults, isLoading } = useStationSearch(inputValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowResults(value.length > 0);
  };

  const handleSelectStation = async (station: SearchStation) => {
    if (station.id === stationId) {
      setInputValue("");
      setShowResults(false);
      return;
    }

    await setQueryParams({
      router,
      params: { station: station.id },
      options: { shallow: false },
    });

    window.location.reload();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.form}>
        <Input
          value={inputValue}
          handleChange={handleInputChange}
          type="text"
          placeholder={t("searchStation")}
        />
      </div>

      {showResults && searchResults.length > 0 && (
        <div className={styles.searchResults}>
          {searchResults.map((station) => (
            <button
              key={station.id}
              type="button"
              className={styles.stationResult}
              onClick={() => handleSelectStation(station)}
            >
              {station.name}{" "}
              <small className="color-muted">#{station.id}</small>
            </button>
          ))}
        </div>
      )}

      {showResults && searchResults.length === 0 && isLoading && <Spinner />}

      {showResults && searchResults.length === 0 && !isLoading && (
        <p className={styles.noResults}>{t("noResults")}</p>
      )}
    </div>
  );
};

