export interface UserCoords {
  latitude: number;
  longitude: number;
}

export interface Street {
  type: "Feature";
  id: string;
  geometry: {
    coordinates: number[][];
    type: "LineString";
  };
  properties: {
    name?: string;
    highway?: string;
    surface?: string;
  };
}

export interface StreetData {
  type: "FeatureCollection";
  features: Street[];
}

export interface VisitedStreet {
  streetId: string;
  streetName: string;
  timestamp: number;
  coordinates: UserCoords;
  duration?: number;
}

export interface VisitedStreetRequest {
  streetId: string;
  streetName: string;
  entryTimestamp: number;
  exitTimestamp?: number;
  durationSeconds?: number;
  entryLatitude: number;
  entryLongitude: number;
}

export interface SaveVisitedStreetsRequest {
  sessionId: string;
  visitedStreets: VisitedStreetRequest[];
}

export interface FetchedVisitedStreet {
  streetId: string;
  streetName: string;
  entryTimestamp: number;
  exitTimestamp?: number;
  durationSeconds?: number;
  entryLatitude: number;
  entryLongitude: number;
}
