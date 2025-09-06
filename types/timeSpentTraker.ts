import { UserCoords } from "./world";

export interface SaveTimeSpentLocationsRequest {
  locations: Array<{
    id: string;
    centerLatitude: number;
    centerLongitude: number;
    totalTimeSpent: number;
    firstVisit: number;
    lastVisit: number;
    visitCount: number;
    radius: number;
    address?: string;
    lastSessionDuration: number;
  }>;
}

export interface SaveStationarySessionsRequest {
  sessions: Array<{
    sessionId: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    startLatitude: number;
    startLongitude: number;
    endLatitude?: number;
    endLongitude?: number;
    endReason?: string;
    maxDistanceFromCenter?: number;
    timeSpentLocationId?: string;
  }>;
}

export interface TimeSpentLocationResponse {
  id: string;
  centerLatitude: number;
  centerLongitude: number;
  totalTimeSpent: number;
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
  address?: string;
  placeName?: string;
  averageSessionDuration?: number;
}

export interface TimeSpentAnalyticsResponse {
  totalTimeSpent: number;
  totalLocations: number;
  totalSessions: number;
  topLocations: TimeSpentLocationResponse[];
  dailySummary: Array<{
    date: string;
    totalTime: number;
    sessionCount: number;
    uniqueLocations: number;
  }>;
  weeklyPattern: Array<{
    dayOfWeek: number;
    averageTime: number;
    sessionCount: number;
  }>;
  hourlyPattern: Array<{
    hour: number;
    averageTime: number;
    sessionCount: number;
  }>;
}


export interface TimeSpentLocation {
  id: string; // Unique identifier for this location
  centerCoords: UserCoords; // Center of the circle
  totalTimeSpent: number; // Total seconds spent in this location
  firstVisit: number; // Timestamp of first visit
  lastVisit: number; // Timestamp of last visit
  visitCount: number; // Number of separate visits
  radius: number; // Radius of the area in meters
  address?: string; // Optional address/place name
  lastSessionDuration: number; // Duration of the most recent session
}

export interface StationarySession {
  id: string;
  locationId: string | null; // Associated time spent location ID
  startTime: number;
  centerCoords: UserCoords;
  isActive: boolean;
  lastUpdateTime: number;
  currentDuration: number; // Current session duration in seconds
}

export interface MovementData {
  isStationary: boolean;
  currentSpeed: number; // m/s
  timeStationary: number; // seconds since last significant movement
  lastMovementTime: number;
}