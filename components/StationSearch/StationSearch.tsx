import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

import { SearchStation } from "types/api";
import { useTranslation } from "hooks/useTranslation";
import { getQueryParam } from "hooks/useQueryParams";
import { useStationSearch } from "hooks/useStationSearch";
import { buildHref } from "utils/url";
import { Spinner } from "components/Spinner";
import { MapLink } from "components/MapLink";
import styles from "./StationSearch.module.scss";

export const StationSearch: React.FC = () => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  // Only true while the input has text
  const [showResults, setShowResults] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const { data: searchResults, isLoading } = useStationSearch(inputValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowResults(value.length > 0);
  };

  // A regular navigation (like the station links below), so Back returns
  // to the search
  const handleSelectStation = (station: SearchStation) => {
    const lang = getQueryParam({ value: router.query.lang });
    router.push(buildHref("/", { station: station.id, lang }));
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

  return (
    <div className={styles.row}>
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

        {showResults && (
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

            {!hasResults && !isLoading && (
              <div className={styles.dropdownMessage}>{t("noResults")}</div>
            )}
          </div>
        )}
      </div>

      <MapLink />
    </div>
  );
};
