// Usage example:
// const buttonClass = classNames(
//   styles.button, // Always include
//   { [styles.active]: !!isActive } // Conditionally include
// );
// <Button className={buttonClass} />

export const classNames = (
  ...args: Array<string | { [key: string]: boolean }>
): string => {
  return args
    .flatMap((arg) =>
      typeof arg === "string" ? arg : Object.keys(arg).filter((key) => arg[key])
    )
    .join(" ");
};
