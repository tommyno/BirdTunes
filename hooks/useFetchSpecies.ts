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

type PageData = {
  species: Species[];
  success: boolean;
};

type FetchSpeciesParams = {
  station: string | null;
  locale: string | null;
  period: string | null;
  enabled?: boolean;
};

export function useFetchSpecies({
  station,
  locale,
  period,
  enabled = true,
}: FetchSpeciesParams) {
  // Delay fetch until query params are ready
  const shouldFetch = enabled && station && locale && period;

  const [data, setData] = useState<Species[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAllPages = async () => {
      setIsLoading(true);
      setError(null);
      let allResults: Species[] = [];
      let currentPage = 1;

      if (!shouldFetch) {
        setError(new Error("Invalid parameters"));
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
  }, [shouldFetch]);

  return { data, isLoading, error };
}
