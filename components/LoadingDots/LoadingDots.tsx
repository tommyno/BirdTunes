import styles from "./LoadingDots.module.scss";

export const LoadingDots = () => {
  return (
    <span className={styles.loading} aria-hidden="true">
      <span className={styles.dot}>.</span>
      <span className={styles.dot}>.</span>
      <span className={styles.dot}>.</span>
    </span>
  );
};
