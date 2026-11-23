import React from "react";

import styles from "./Input.module.scss";

type Props = {
  value: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  placeholder?: string;
};

export const Input: React.FC<Props> = ({
  value,
  handleChange,
  autoFocus,
  placeholder,
}) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      onChange={handleChange}
      value={value}
      className={styles.input}
      aria-label={placeholder}
      autoFocus={autoFocus}
    />
  );
};
