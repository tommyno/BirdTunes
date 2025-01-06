import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./Search.module.scss";
import { Input } from "components/Input/Input";

export const Search: React.FC = () => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");

  // Get search param from URL on mount
  useEffect(() => {
    const searchParam = router.query.search as string;
    if (searchParam) {
      setInputValue(searchParam);
    }
  }, [router.query.search]);

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
    router.replace({ query }, undefined, { shallow: true });
  };

  const handleClear = () => {
    setInputValue("");
    const query = { ...router.query };
    delete query.search;
    router.replace({ query }, undefined, { shallow: true });
  };

  return (
    <div className={styles.wrap}>
      <Input
        value={inputValue}
        handleChange={handleInputChange}
        autoFocus={true}
      />

      {inputValue && (
        <button onClick={handleClear} className={styles.button}>
          <img src="/icons/close.svg" alt="Nullstill" />
        </button>
      )}
    </div>
  );
};
