import React from "react";

import styles from "./Input.module.scss";

type Props = {
  value: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
};

export const Input: React.FC<Props> = ({ value, handleChange, autoFocus }) => {
  return (
    <input
      type="text"
      placeholder="Søk"
      onChange={handleChange}
      value={value}
      className={styles.input}
      aria-label="Søk"
      autoFocus={autoFocus}
    />
  );
};
