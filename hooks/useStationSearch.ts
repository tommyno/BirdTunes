import { useState, useCallback } from "react";

type Station = {
  id: string;
  name: string;
  location: string;
  country: string;
  continent: string;
  state: string;
  coords: {
    lat: number;
    lon: number;
  };
  type: string;
  weather: {
    temp: number;
  };
};

type StationsResponse = {
  stations: {
    nodes: Station[];
  };
};

export const useStationSearch = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchStations = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://app.birdweather.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query SearchStations($query: String) {
              stations(query: $query) {
                nodes {
                  id
                  name
                  location
                  country
                  continent
                  state
                  coords {
                    lat
                    lon
                  }
                  type
                  weather {
                    temp
                  }
                }
              }
            }
          `,
          variables: { query },
        }),
      });

      const data: { data: StationsResponse } = await response.json();
      setStations(data.data.stations.nodes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while searching stations"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stations,
    loading,
    error,
    searchStations,
  };
};
