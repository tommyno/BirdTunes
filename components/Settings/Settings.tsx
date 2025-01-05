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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Initialize input value from URL on mount
  useEffect(() => {
    const searchParam = router.query.search as string;
    if (searchParam) {
      setInputValue(searchParam);
      setIsOpen(true);
    }
  }, [router.query.search]);

  const totalDetections = speciesData?.reduce(
    (total, species) => total + species.detections.total,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Update URL with search param
    const query = { ...router.query };
    if (value) {
      query.search = value;
    } else {
      delete query.search;
    }
    router.push({ query }, undefined, { shallow: true });
  };

  const handleToggleSettings = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Reset filter when closing
    if (!newIsOpen) {
      setInputValue("");
      const query = { ...router.query };
      delete query.search;
      router.push({ query }, undefined, { shallow: true });
    }
  };

  return (
    <div className={styles.wrap}>
      {!isOpen && (
        <div>
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
      )}

      {isOpen && (
        <Input
          value={inputValue}
          handleChange={handleInputChange}
          autoFocus={true}
        />
      )}

      <button
        className={styles.button}
        aria-label={isOpen ? "Lukk søk" : "Åpne søk"}
        onClick={handleToggleSettings}
      >
        <img
          src={isOpen ? "/icons/close.svg" : "/icons/search.svg"}
          alt="Søk"
        />
      </button>
    </div>
  );
};
