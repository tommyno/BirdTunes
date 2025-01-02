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
  right?: AllowedValues;
  bottom?: AllowedValues;
  left?: AllowedValues;
  children: React.ReactNode;
  center?: boolean;
};

export const Block = ({
  top,
  bottom,
  left,
  right,
  center,
  children,
  ...rest
}: Props) => {
  const blockClass = classNames(
    styles.block,
    { [styles[`-top-${top}`]]: !!top },
    { [styles[`-right-${right}`]]: !!right },
    { [styles[`-bottom-${bottom}`]]: !!bottom },
    { [styles[`-left-${left}`]]: !!left },
    { [styles["-center"]]: !!center }
  );

  return (
    <div className={blockClass} {...rest}>
      {children}
    </div>
  );
};
