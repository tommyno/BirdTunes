import React, { useState, useRef, useEffect } from "react";
import styles from "./StationSearch.module.scss";
import { useRouter } from "next/router";
import { useTranslation } from "hooks/useTranslation";
import { setQueryParams } from "hooks/useQueryParams";
import { useStationSearch } from "hooks/useStationSearch";
import { SearchStation } from "types/api";
import { Spinner } from "components/Spinner";

export const StationSearch: React.FC = () => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [showResults, setShowResults] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const { data: searchResults, isLoading } = useStationSearch(inputValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowResults(value.length > 0);
  };

  const handleSelectStation = async (station: SearchStation) => {
    await setQueryParams({
      router,
      params: { station: station.id },
      options: { shallow: false },
    });

    window.location.reload();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults = searchResults.length > 0;
  const showDropdown =
    showResults && (hasResults || isLoading || inputValue.length > 0);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.inputWrap}>
        <img
          src="/icons/search.svg"
          alt=""
          className={styles.searchIcon}
          aria-hidden="true"
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={t("searchStation")}
          className={styles.input}
          aria-label={t("searchStation")}
          onFocus={() => inputValue.length > 0 && setShowResults(true)}
        />
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {hasResults && (
            <ul className={styles.results}>
              {searchResults.map((station) => (
                <li key={station.id}>
                  <button
                    type="button"
                    className={styles.resultItem}
                    onClick={() => handleSelectStation(station)}
                  >
                    <span className={styles.stationName}>{station.name}</span>
                    <span className={styles.stationId}>#{station.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!hasResults && isLoading && (
            <div className={styles.dropdownMessage}>
              <Spinner />
            </div>
          )}

          {!hasResults && !isLoading && inputValue.length > 0 && (
            <div className={styles.dropdownMessage}>{t("noResults")}</div>
          )}
        </div>
      )}
    </div>
  );
};
