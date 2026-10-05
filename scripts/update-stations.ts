import { mkdirSync, writeFileSync } from "node:fs";

import type { MapStation, StationsMapData } from "types/api";
import { fetchGraphQL } from "utils/fetcher";
import { cleanStationName } from "utils/species";

// Runs as the first step of "npm run build", so every deploy ships a fresh
// station list. A weekly GitHub Action (.github/workflows/weekly-deploy.yml)
// triggers a redeploy to keep it current. Any error fails the build, which
// leaves the previous deployment live.

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
const DETECTION_PERIOD_YEARS = 20;
const ACTIVE_PERIOD_DAYS = 30;

const DATA_DIRECTORY = "public/data";
const DATA_FILE = `${DATA_DIRECTORY}/stations.json`;

// Round coordinates to 4 decimals (~11 m accuracy), enough for a map pin
const roundCoordinate = (value: number) => Math.round(value * 10000) / 10000;

// Stored as a flag rather than a date to keep the file small
const isRecentlyActive = (latestDetectionAt: string, activeSince: number) =>
  new Date(latestDetectionAt).getTime() >= activeSince ? 1 : 0;

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
    console.log(`Fetched ${allNodes.length} stations`);

    if (!stations.pageInfo.hasNextPage || !stations.pageInfo.endCursor) {
      break;
    }

    cursor = stations.pageInfo.endCursor;
  }

  return allNodes;
};

// Compact tuple format to keep the file small. Stations without coordinates
// have location privacy enabled and can't be shown on a map, and ones that
// have never detected anything don't deserve a pin — neither has a query
// argument, so both are filtered here
const toMapStations = (nodes: GraphQLStationNode[]): MapStation[] => {
  const activeSince = Date.now() - ACTIVE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

  return nodes.flatMap<MapStation>((node) => {
    if (!node.coords || !node.latestDetectionAt) return [];

    const station: MapStation = [
      node.id,
      cleanStationName(node.name?.trim()) || `Station ${node.id}`,
      roundCoordinate(node.coords.lat),
      roundCoordinate(node.coords.lon),
      isRecentlyActive(node.latestDetectionAt, activeSince),
    ];
    return [station];
  });
};

const run = async () => {
  const nodes = await fetchAllStations();
  const stations = toMapStations(nodes);

  if (!stations.length) {
    throw new Error("Error: no stations with coordinates were returned");
  }

  const data: StationsMapData = {
    updatedAt: new Date().toISOString(),
    stations,
  };

  mkdirSync(DATA_DIRECTORY, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data));

  console.log(`Wrote ${stations.length} stations to ${DATA_FILE}`);
};

run();
