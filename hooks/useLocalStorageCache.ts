import { useState, useEffect } from "react";

import { getItem } from "utils/localStorage";

// Read from localStorage after mount (avoids hydration mismatch)
export const useLocalStorageCache = <T>(key: string): T[] => {
  const [data, setData] = useState<T[]>([]);

  // Also resets to empty when the new key has nothing stored, so data from
  // the previous key isn't shown
  useEffect(() => {
    setData(getItem(key));
  }, [key]);

  return data;
};
