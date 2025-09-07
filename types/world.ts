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

export interface StreetVisitData {
  visitCount: number;
  firstVisit: number;
  lastVisit: number;
  totalTimeSpent: number; // in seconds
  averageTimeSpent: number;
}

export interface MapTrackingPanelProps {
  isLocationSubscrActive: string;
  currentStreetId: string | null;
  streetData: StreetData | null;
  sessionCountVisitedStreets: number;
  allCountVisitedStreets: number;
  onClose: () => void;
  // New props for visit tracking
  mostVisitedStreets?: Array<{ streetId: string; visitData: StreetVisitData }>;
  currentStreetVisitData?: StreetVisitData | null;
  streetsByTimeSpent:any;
}


export interface StreetVisitData {
  visitCount: number;
  firstVisit: number;
  lastVisit: number;
  totalTimeSpent: number; // in seconds
  averageTimeSpent: number;
}
export interface ActiveHoursData {
  totalActiveHours: number;
  currentSessionStart: number | null;
  dailyActiveTime: Map<string, number>;
}