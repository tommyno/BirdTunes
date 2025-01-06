import React from "react";

import styles from "./Button.module.scss";
import { classNames } from "utils/classNames";

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
  isActive?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<Props> = ({
  onClick,
  title,
  children,
  isActive,
  ...props
}) => {
  const buttonClass = classNames(styles.button, isActive && styles.isActive);

  return (
    <button onClick={onClick} title={title} className={buttonClass} {...props}>
      {children}
    </button>
  );
};
