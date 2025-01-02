import React, { useState } from "react";

import styles from "./Settings.module.scss";
import { Species } from "hooks/useFetchSpecies";
import { Input } from "components/Input/Input";

type Props = {
  speciesData?: Species[];
  speciesError?: Error | null;
  onFilterChange: (filter: string) => void;
};

export const Settings: React.FC<Props> = ({
  speciesData,
  speciesError,
  onFilterChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const totalDetections = speciesData?.reduce(
    (total, species) => total + species.detections.total,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onFilterChange(value);
  };

  const handleToggleSettings = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Reset filter when closing
    if (!newIsOpen) {
      setInputValue("");
      onFilterChange("");
    }
  };

  return (
    <div className={styles.wrap}>
      {!isOpen && (
        <div>
          <p>{totalDetections} observasjoner </p>
          <p>{speciesData?.length || 0} ulike arter</p>
          {speciesError && <p>{speciesError.toString()}</p>}
        </div>
      )}

      {isOpen && <Input value={inputValue} handleChange={handleInputChange} />}

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
