import { useState, useEffect } from "react";

// Read from localStorage after mount (avoids hydration mismatch)
export const useLocalStorageCache = <T>(key: string): T[] => {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setData(JSON.parse(stored));
    } catch {
      // Clear corrupted cache data
      localStorage.removeItem(key);
    }
  }, [key]);

  return data;
};
