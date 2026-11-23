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

// Remove timezone (to use the local recorded time without converting to UTC)
const toLocalRecordedDate = (date: string) => new Date(date.split(/[+]/)[0]);

// undefined = use the browser's default locale, except for Norwegian
const toDateLocale = (locale?: string | null) =>
  locale === "no" ? "no" : undefined;

// Ex: 11. sept (use local time, without timezone)
export const dateShort = (date?: string, locale?: string | null) => {
  if (!date) {
    return;
  }

  return new Intl.DateTimeFormat(toDateLocale(locale), {
    month: "short",
    day: "numeric",
  }).format(toLocalRecordedDate(date));
};

// Ex: 14:20:46 or 2:20:46 PM
const formatTime = (dateObject: Date, locale?: string | null) =>
  new Intl.DateTimeFormat(toDateLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(dateObject);

// Ex: 14:20:46 or 2:20:46 PM (use local time, without timezone)
export const timeDetailed = (date?: string, locale?: string | null) => {
  if (!date) {
    return;
  }

  return formatTime(toLocalRecordedDate(date), locale);
};

// Ex: 0:07 or 1:15
export const formatSeconds = (seconds: number) => {
  const wholeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = String(wholeSeconds % 60).padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
};

export const timeDetailedNow = (locale?: string | null) =>
  formatTime(new Date(), locale);
