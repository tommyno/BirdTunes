import React, { useState, useEffect } from "react";
import styles from "./Search.module.scss";
import { Input } from "components/Input/Input";
import { useTranslation } from "hooks/useTranslation";
import { useQueryParam } from "hooks/useQueryParams";

export const Search: React.FC = () => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useQueryParam({
    key: "search",
    defaultValue: "",
  });
  const [inputValue, setInputValue] = useState("");

  // Sync input value with query param
  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchValue(value || null);
  };

  const handleClear = () => {
    setInputValue("");
    setSearchValue(null);
  };

  return (
    <div className={styles.wrap}>
      <Input
        value={inputValue}
        handleChange={handleInputChange}
        autoFocus={true}
        placeholder={t("searchPlaceholder")}
      />

      {inputValue && (
        <button onClick={handleClear} className={styles.button}>
          <img src="/icons/close.svg" alt={t("clearSearch")} />
        </button>
      )}
    </div>
  );
};
