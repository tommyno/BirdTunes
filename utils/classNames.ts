/*
Usage example:

const buttonClass = classNames(
  styles.button,
  isActive && styles.active,
  color && styles[`-color-${color}`]
);

<Button className={buttonClass} />
*/

export const classNames = (
  ...args: Array<string | false | null | undefined>
): string => {
  return args.filter(Boolean).join(" ");
};
