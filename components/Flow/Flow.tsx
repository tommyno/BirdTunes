import { classNames } from "utils/classNames";
import styles from "./Flow.module.css";

type Props = {
  children: React.ReactNode;
  space?: "xsmall" | "small" | "normal" | "large" | "xlarge";
  fixed?: boolean; // Use fixed px for spacing (default is em/relative)
};

export const Flow = ({ children, space = "normal", fixed, ...rest }: Props) => {
  const flowClass = classNames(
    styles.flow,
    styles[`-${space}`],
    fixed ? styles[`-fixed`] : "",
  );

  return (
    <div className={flowClass} {...rest}>
      {children}
    </div>
  );
};
