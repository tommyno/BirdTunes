// Read a JSON value from localStorage. Falls back to an empty list on the
// server and when the stored value is missing or corrupted.
export const getItem = (key: string) => {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
};

// Write a string value to localStorage
export const setItem = (key: string, value: string) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(key, value);
};
