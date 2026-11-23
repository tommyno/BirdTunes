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
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setData([]);
      setIsLoading(false);
      return;
    }

    // Set when the query changes, so a slow response for an older query
    // doesn't overwrite the results for the newer one
    let isStale = false;

    const searchStations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const isNumeric = /^\d+$/.test(trimmedQuery);
        // JSON.stringify quotes and escapes the input, so characters like "
        // can't break the GraphQL query
        const quotedQuery = JSON.stringify(trimmedQuery);

        const graphqlQuery = isNumeric
          ? `query { station(id: ${quotedQuery}) { id name location } }`
          : `query { stations(query: ${quotedQuery}, first: 10) { nodes { id name location } } }`;

        const result: SearchResponse = await fetchGraphQL(graphqlQuery);
        if (isStale) return;

        if (isNumeric && result.data?.station) {
          setData([result.data.station]);
        } else if (!isNumeric && result.data?.stations?.nodes) {
          setData(result.data.stations.nodes);
        } else {
          setData([]);
        }
      } catch (err) {
        if (isStale) return;
        setError(err as Error);
        setData([]);
      } finally {
        if (!isStale) setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchStations, 300);
    return () => {
      isStale = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return { data, isLoading, error };
};
