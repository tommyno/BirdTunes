import { useState, useEffect } from "react";

import { getItem } from "utils/localStorage";

// Read from localStorage after mount (avoids hydration mismatch)
export const useLocalStorageCache = <T>(key: string): T | null => {
  const [data, setData] = useState<T | null>(null);

  // Also resets to null when the new key has nothing stored, so data from
  // the previous key isn't shown
  useEffect(() => {
    setData(getItem<T>(key));
  }, [key]);

  return data;
};
