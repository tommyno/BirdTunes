import React from "react";

import styles from "./Button.module.scss";
import { classNames } from "utils/classNames";

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
  isActive?: boolean;
};

export const Button: React.FC<Props> = ({
  onClick,
  title,
  children,
  isActive,
}) => {
  const buttonClass = classNames(styles.button, {
    [styles.isActive]: !!isActive,
  });

  return (
    <button onClick={onClick} title={title} className={buttonClass}>
      {children}
    </button>
  );
};
