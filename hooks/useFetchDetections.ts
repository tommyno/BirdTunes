import { useEffect, useState } from "react";

import { API_BASE_URL, STATION_ID } from "constants/birdweather";

export type Detection = {
  id: number;
  timestamp: string; // ISO date string
  soundscape: {
    url: string;
  };
};

type Props = {
  data: Detection[] | null;
  isLoading: boolean;
  error: Error | null;
};

export const useFetchDetections = (speciesId: number): Props => {
  const [data, setData] = useState<Detection[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const url = `${API_BASE_URL}/stations/${STATION_ID}/detections?limit=5&speciesId=${speciesId}&locale=no&order=desc`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setData(data?.detections);
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
