import { TranslationKey } from "hooks/useTranslation";

// Return relative time, ex: 12 minutter siden / 16 timer siden / 2 dager siden
export const timeAgo = (date: string, t: (key: TranslationKey) => string) => {
  if (!date) {
    return;
  }
  const dateObject = new Date(date);

  const now = new Date();
  const diff = now.getTime() - dateObject.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes} ${t(minutes === 1 ? "minute" : "minutes")} ${t("ago")}`;
  } else if (hours < 24) {
    return `${hours} ${t(hours === 1 ? "hour" : "hours")} ${t("ago")}`;
  } else {
    return `${days} ${t(days === 1 ? "day" : "days")} ${t("ago")}`;
  }
};

// Ex: 11. sept 2024 14:20:46 (use local time, without timezone)
export const dateDetailed = (date?: string, locale?: string | null) => {
  if (!date) {
    return;
  }

  // Remove timezone (to use the local recorded time without converting to UTC)
  const localDateTime = date.split(/[+]/)[0];
  const dateObject = new Date(localDateTime);

  // undefined = use the browser's default locale
  // except for Norwegian
  const dateLocale = locale === "no" ? "no" : undefined;

  return new Intl.DateTimeFormat(dateLocale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(dateObject);
};

// Ex: 14:20:46 or 2:20:46 PM
export const timeDetailedNow = (locale?: string | null) => {
  const dateObject = new Date();

  // undefined = use the browser's default locale
  // except for Norwegian
  const dateLocale = locale === "no" ? "no" : undefined;

  return new Intl.DateTimeFormat(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(dateObject);
};
