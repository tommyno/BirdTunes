import useSWR from "swr";

import { useLocalStorageCache } from "hooks/useLocalStorageCache";
import { setItem } from "utils/localStorage";

type Props<T> = {
  cacheKey: string;
  url: string | null;
  fetcher: (url: string) => Promise<T>;
};

// SWR that also saves each response in localStorage, so the last response
// shows instantly on the next visit while fresh data loads.
// data is the fresh response when there is one, otherwise the cached one.
export const useCachedSWR = <T>({ cacheKey, url, fetcher }: Props<T>) => {
  const cachedData = useLocalStorageCache<T>(cacheKey);

  const {
    data: freshData,
    isLoading,
    error,
  } = useSWR<T>(url, fetcher, {
    onSuccess: (data) => setItem(cacheKey, JSON.stringify(data)),
  });

  return {
    data: freshData ?? cachedData ?? undefined,
    freshData,
    cachedData,
    isLoading,
    error,
  };
};
