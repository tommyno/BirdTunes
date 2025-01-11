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

// Returns today's date in ISO format, ex: 2024-02-19
export const todayIso = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  return formattedDate;
};

// Ex: 11.09.2024 14:20:46 (use local time, without timezone)
export const dateDetailed = (date?: string) => {
  if (!date) {
    return;
  }

  // Example: "2024-11-02T16:36:35.286+08:00"

  // Parse the ISO string directly to preserve local time
  const [datePart, timePart] = date.split("T");
  const [year, month, day] = datePart.split("-");
  const time = timePart.split(".")[0]; // Gets HH:mm:ss

  return `${day}.${month}.${year} ${time}`;
};

// Ex: 14:20:46
export const timeDetailedNow = () => {
  const dateObject = new Date();
  return dateObject.toLocaleTimeString("no", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};
