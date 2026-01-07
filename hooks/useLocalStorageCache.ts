import { useState, useEffect } from "react";

// Read from localStorage after mount (avoids hydration mismatch)
export const useLocalStorageCache = <T>(key: string): T[] => {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setData(JSON.parse(stored));
  }, [key]);

  return data;
};
