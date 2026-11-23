// Read a JSON value from localStorage. Returns null on the server and when
// the stored value is missing or corrupted.
export const getItem = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

// Write a string value to localStorage
export const setItem = (key: string, value: string) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(key, value);
};
