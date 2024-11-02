import { useEffect, useState } from "react";

import { API_BASE_URL, STATION_ID } from "constants/birdweather";

type StationStats = {
  detections: number;
  species: number;
};

type Props = {
  data: StationStats | null;
  isLoading: boolean;
  error: Error | null;
};

export const useFetchStation = (): Props => {
  const [data, setData] = useState<StationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const url = `${API_BASE_URL}/stations/${STATION_ID}/stats?period=all`;
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
  }, []);

  return { data, isLoading, error };
};
