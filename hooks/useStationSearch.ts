import { API_BASE_URL_GRAPHQL } from "constants/birdweather";
import { useEffect, useState } from "react";

export type SearchStation = {
  id: string;
  name: string;
  location?: string;
};

export const useStationSearch = (query: string) => {
  const [data, setData] = useState<SearchStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setData([]);
      return;
    }

    const searchStations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const isNumeric = /^\d+$/.test(query.trim());

        const graphqlQuery = isNumeric
          ? `query { station(id: "${query}") { id name location } }`
          : `query { stations(query: "${query}", first: 10) { nodes { id name location } } }`;

        const response = await fetch(API_BASE_URL_GRAPHQL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: graphqlQuery }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();

        if (isNumeric && result.data?.station) {
          setData([result.data.station]);
        } else if (!isNumeric && result.data?.stations?.nodes) {
          setData(result.data.stations.nodes);
        } else {
          setData([]);
        }
      } catch (err) {
        setError(err as Error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchStations, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { data, isLoading, error };
};
