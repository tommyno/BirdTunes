import type { NextApiRequest, NextApiResponse } from "next";

import { MapStation, StationsMapData } from "types/api";
import { fetchGraphQL } from "utils/fetcher";
import { cleanStationName } from "utils/species";

type GraphQLStationNode = {
  id: string;
  name: string | null;
  coords: { lat: number; lon: number } | null;
  latestDetectionAt: string | null;
};

type GraphQLStationsResponse = {
  data?: {
    stations?: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: GraphQLStationNode[];
    };
  };
};

const PAGE_SIZE = 5000;
const MAX_PAGES = 10;
const ACTIVE_WITHIN_DAYS = 30;
// "Has ever detected anything" — Birdweather has only existed since ~2021
const DETECTION_PERIOD_YEARS = 20;

// Round coordinates to 4 decimals (~11 m accuracy), enough for a map pin
const roundCoordinate = (value: number) => Math.round(value * 10000) / 10000;

// Fetch every public station from the Birdweather GraphQL API (~5 pages)
const fetchAllStations = async (): Promise<GraphQLStationNode[]> => {
  const allNodes: GraphQLStationNode[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    // The period filter makes the server skip stations that have never had a detection
    const graphqlQuery = `query {
      stations(first: ${PAGE_SIZE}${cursor ? `, after: "${cursor}"` : ""
      }, period: {count: ${DETECTION_PERIOD_YEARS}, unit: "year"}) {
        pageInfo { hasNextPage endCursor }
        nodes { id name coords { lat lon } latestDetectionAt }
      }
    }`;

    const result: GraphQLStationsResponse = await fetchGraphQL(graphqlQuery);
    const stations = result.data?.stations;

    if (!stations) {
      throw new Error("Error: unexpected GraphQL response");
    }

    allNodes.push(...stations.nodes);

    if (!stations.pageInfo.hasNextPage || !stations.pageInfo.endCursor) {
      break;
    }

    cursor = stations.pageInfo.endCursor;
  }

  return allNodes;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StationsMapData | { message: string }>
) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const nodes = await fetchAllStations();
    const activeThreshold =
      Date.now() - ACTIVE_WITHIN_DAYS * 24 * 60 * 60 * 1000;

    // Compact tuple format to keep the payload small. Stations without
    // coordinates have location privacy enabled and can't be shown on a map
    // (there is no query argument for this, so it's filtered here)
    const stations: MapStation[] = nodes.flatMap((node) => {
      if (!node.coords || !node.latestDetectionAt) return [];

      const station: MapStation = [
        node.id,
        cleanStationName(node.name?.trim()) || `Station ${node.id}`,
        roundCoordinate(node.coords.lat),
        roundCoordinate(node.coords.lon),
        new Date(node.latestDetectionAt).getTime() > activeThreshold ? 1 : 0,
      ];
      return [station];
    });

    // Cache on Vercel's shared CDN for 23 hours, so the daily cron ping always
    // lands on an expired cache and refreshes it. Stale copies are served
    // instantly while revalidating in the background.
    res.setHeader(
      "Cache-Control",
      "public, max-age=3600, s-maxage=82800, stale-while-revalidate=604800"
    );
    res.status(200).json({
      // Not read by the app — kept so cached snapshots can be dated when debugging
      updatedAt: new Date().toISOString(),
      stations,
    });
  } catch (error) {
    res.status(502).json({
      message: error instanceof Error ? error.message : "Error",
    });
  }
}

// Fetching ~24k stations from Birdweather takes 10-15 seconds
export const config = {
  maxDuration: 60,
};
