// Return relative time, ex: 12 minutter siden / 16 timer siden / 2 dager siden
export const timeAgo = (date: string) => {
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
    return `${minutes} minutt${minutes !== 1 ? "er" : ""} siden`;
  } else if (hours < 24) {
    return `${hours} time${hours !== 1 ? "r" : ""} siden`;
  } else {
    return `${days} dag${days !== 1 ? "er" : ""} siden`;
  }
};

// Returns today's date in ISO format, ex: 2024-02-19
export const todayIso = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  return formattedDate;
};

// Ex: 11.09.2024 14:20:46
export const dateDetailed = (date?: string) => {
  if (!date) {
    return;
  }
  const dateObject = new Date(date);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Oslo",
  };

  return (
    dateObject.toLocaleDateString("no", options) +
    " " +
    dateObject.toLocaleTimeString("no")
  );
};
