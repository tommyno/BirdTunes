import { useEffect, useState } from "react";

import { API_BASE_URL, STATION_ID } from "constants/birdweather";

export type Detection = {
  id: number;
  timestamp: string; // ISO date string
  soundscape: {
    url: string;
    startTime: number;
  };
};

type Props = {
  data: Detection[] | null;
  isLoading: boolean;
  error: Error | null;
};

type FetchDetectionsProps = {
  speciesId: number;
  stationId: string | null;
  lang: string | null;
};

export const useFetchDetections = ({
  speciesId,
  stationId,
  lang,
}: FetchDetectionsProps): Props => {
  // Delay fetch until query params are ready
  const shouldFetch = speciesId && stationId && lang;

  const [data, setData] = useState<Detection[] | null>(null);
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

      const url = `${API_BASE_URL}/stations/${stationId}/detections?limit=5&speciesId=${speciesId}&locale=${lang}&order=desc`;
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
  }, [shouldFetch]);

  return { data, isLoading, error };
};
