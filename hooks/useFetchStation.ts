import { useEffect, useState } from "react";

import { API_BASE_URL } from "constants/birdweather";

type Station = {
  name: string;
};

export const useFetchStation = (stationId: string | null) => {
  // Delay fetch until query params are ready
  const shouldFetch = stationId;

  const [data, setData] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      if (!shouldFetch) {
        setError(new Error("Invalid parameters"));
        setIsLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/stations/${stationId}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shouldFetch]);

  return { data, isLoading, error };
};
