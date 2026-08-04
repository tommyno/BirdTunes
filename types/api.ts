// Types for Birdweather API responses

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

export type Detection = {
  id: number;
  timestamp: string; // ISO date string
  soundscape: {
    url: string;
    startTime: number;
  };
};

export type Station = {
  name: string;
};

export type SearchStation = {
  id: string;
  name: string;
  location?: string;
};

// Compact station tuple served by /api/stations for the map:
// [id, name, latitude, longitude, active within last 30 days]
export type MapStation = [string, string, number, number, 0 | 1];

export type StationsMapData = {
  updatedAt: string;
  stations: MapStation[];
};

