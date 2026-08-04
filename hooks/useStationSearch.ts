import { useEffect, useState } from "react";

import { SearchStation } from "types/api";
import { fetchGraphQL } from "utils/fetcher";

type SearchResponse = {
  data?: {
    station?: SearchStation;
    stations?: { nodes: SearchStation[] };
  };
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

        const result: SearchResponse = await fetchGraphQL(graphqlQuery);

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
