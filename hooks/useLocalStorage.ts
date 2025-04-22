// Get from local storage
export const getItem = (key: string) => {
  const isBrowser = typeof window !== "undefined";
  if (!isBrowser) return [];

  const stored = window.localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

// Write to local storage
export const setItem = (key: string, value: string) => {
  const isBrowser = typeof window !== "undefined";
  if (!isBrowser) return [];

  window.localStorage.setItem(key, value);
};
