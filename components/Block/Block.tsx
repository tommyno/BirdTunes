import { classNames } from "utils/classNames";
import styles from "./Block.module.scss";

type AllowedValues =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | undefined;

type Props = {
  top?: AllowedValues;
  bottom?: AllowedValues;
  children: React.ReactNode;
  center?: boolean;
};

export const Block = ({ top, bottom, center, children }: Props) => {
  const blockClass = classNames(
    styles.block,
    top && styles[`-top-${top}`],
    bottom && styles[`-bottom-${bottom}`],
    center && styles["-center"]
  );

  return (
    <div className={blockClass}>
      {children}
    </div>
  );
};
