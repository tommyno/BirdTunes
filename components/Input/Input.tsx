import React from "react";

import styles from "./Input.module.scss";
import { classNames } from "utils/classNames";

type Props = {
  value: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  placeholder?: string;
  width?: "full" | "small";
};

export const Input: React.FC<Props> = ({
  value,
  handleChange,
  autoFocus,
  placeholder,
  width = "full",
}) => {
  const inputClass = classNames(
    styles.input,
    width && styles[`-width-${width}`]
  );

  return (
    <input
      type="text"
      placeholder={placeholder}
      onChange={handleChange}
      value={value}
      className={inputClass}
      aria-label={placeholder}
      autoFocus={autoFocus}
    />
  );
};
