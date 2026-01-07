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

