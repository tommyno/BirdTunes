import styles from "./Spinner.module.scss";

export const Spinner = () => {
  return (
    <div className={styles.circle}>
      <div></div>
      <div></div>
    </div>
  );
};
