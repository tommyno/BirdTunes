import { API_BASE_URL } from "constants/birdweather";
import { useEffect, useState } from "react";

export type Species = {
  id: number;
  commonName: string;
  scientificName: string;
  color: string;
  imageUrl: string;
  thumbnailUrl: string;
  detections: {
    total: number;
    almostCertain: number;
    veryLikely: number;
    uncertain: number;
    unlikely: number;
  };
  latestDetectionAt: string; // ISO date string
};

type Props = {
  data: Species[];
  isLoading: boolean;
  error: Error | null;
};

type PageData = {
  species: Species[];
  success: boolean;
};

type FetchSpeciesOptions = {
  station?: string | number;
  locale?: string;
  period?: string;
};

export const useFetchSpecies = (options?: FetchSpeciesOptions): Props => {
  const [data, setData] = useState<Species[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAllPages = async () => {
      setIsLoading(true);
      setError(null);
      let allResults: Species[] = [];
      let currentPage = 1;

      const station = options?.station;
      const locale = options?.locale;
      const period = options?.period;

      if (!station) {
        setError(new Error("Station ID is required"));
        setIsLoading(false);
        return;
      }

      const baseUrl = `${API_BASE_URL}/stations/${station}/species`;
      const url = `${baseUrl}?locale=${locale}&period=${period}`;

      try {
        // We're unable to fetch more than 100 results per page, so we're looping through all pages to get all results
        while (true) {
          const response = await fetch(`${url}&page=${currentPage}`);

          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const pageData: PageData = await response.json();
          allResults = [...allResults, ...pageData?.species];

          if (pageData?.species?.length < 100) {
            break; // Exit loop when the last page is reached (less than 100 results on the page)
          }
          currentPage++;
        }

        setData(allResults);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPages();
  }, [options?.station, options?.locale, options?.period]);

  return { data, isLoading, error };
};
