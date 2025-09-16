import { Settings } from "./settings";
import { SaveVisitedStreetsRequest, VisitedStreet } from "./world";

export enum Status {
  ACTIVE = "ACTIVE",
  SLEEP = "SLEEP",
  OFFLINE = "OFFLINE",
  BANNED = "BANNED",
  PENDING = "PENDING",
  IDLE = "IDLE",
  INVISIBLE = "INVISIBLE",
}

//! the prisma schema has been updates so update this file accordingly

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

export interface Device {
  id: string;
  userId: string;
  settingsId?: string;
  name: string;
  location: string;
  lastLoggedIn: string;
}

export interface CityStat {
  id: string;
  name: string;
  state: string;
  country: string;
  population?: number;
  area?: number;
  totalKilometers: number;
  cityCoveragePct: number;
  daysActive: number;
  longestStreakDays: number;
  userId: string;
  settingsId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  firstName?: string;
  lastName?: string;
  userName: string;
  imageUrl?: string;
  createdAt: string;
  user?: UserData;
  friend?: UserData;
}

export interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  imageUrl: string;
  phoneNumber?: string;
  city?: string;
  
  // City location data
  cityName?: string;
  cityCountry?: string;
  cityState?: string;
  cityLat?: number;
  cityLng?: number;
  cityDisplayName?: string;
  
  // City statistics
  cityAllStreetsCount?: number;
  cityAllKilometers?: number;
  cityBboxNorth?: number;
  cityBboxSouth?: number;
  cityBboxEast?: number;
  cityBboxWest?: number;
  
  // User activity data
  activeHours?: number;
  
  // User profile fields
  role: Role;
  completedTutorial: boolean;
  aboutMe?: string;
  disableAccount: boolean;
  deleteAccount: boolean;
  note?: string;
  status: Status;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  lastLogin: string;
  
  // Relationships
  cityStats?: CityStat;
  Settings?: Settings;
  devices?: Device;
  friends?: Friend[];
  friendOf?: Friend[];
  visitedStreets?: VisitedStreet[];
  streetVisitStats?: StreetVisitStat[];
  rankId?: string;
  rank?: Rank;
  timeSpentLocations?: TimeSpentLocation[];
  stationarySessions?: StationarySession[];
  timeSpentSummaries?: TimeSpentSummary[];
}

// Street Visit Statistics Interface
export interface StreetVisitStat {
  id: string;
  userId: string;
  streetId: string;
  streetName?: string;
  visitCount: number;
  totalTimeSpent: number; // seconds
  averageTimeSpent: number; // seconds
  firstVisit: string; // ISO date string
  lastVisit: string; // ISO date string
  longestSession?: number; // seconds
  shortestSession?: number; // seconds
  createdAt: string;
  updatedAt: string;
}

// Rank Interface
export interface Rank {
  id: string;
  userId: string;
  points: number;
  level: Level;
  createdAt: string;
  updatedAt: string;
}

// Level Enum
export enum Level {
  Iron = 'Iron',
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  Platinum = 'Platinum',
  Diamond = 'Diamond',
  Master = 'Master',
  Grandmaster = 'Grandmaster'
}

// Time Spent Location Interface
export interface TimeSpentLocation {
  id: string;
  userId: string;
  
  // Location data
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  address?: string;
  placeName?: string;
  placeType?: string;
  
  // Time tracking data
  totalTimeSpent: number; // seconds
  visitCount: number;
  firstVisit: string; // ISO date string
  lastVisit: string; // ISO date string
  lastSessionDuration: number; // seconds
  
  // Statistics
  averageSessionDuration?: number;
  longestSessionDuration?: number; // seconds
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  
  // Relations
  stationarySessions?: StationarySession[];
  timeSpentLocationCategories?: TimeSpentLocationCategory[];
}

// Stationary Session Interface
export interface StationarySession {
  id: string;
  userId: string;
  timeSpentLocationId?: string;
  
  // Session data
  startTime: string; // ISO date string
  endTime?: string; // ISO date string
  duration?: number; // seconds
  
  // Location data for this specific session
  startLatitude: number;
  startLongitude: number;
  endLatitude?: number;
  endLongitude?: number;
  
  // Session metadata
  sessionId: string;
  isCompleted: boolean;
  endReason?: string; // "movement", "timeout", "manual", etc.
  
  // Movement data during session
  maxDistanceFromCenter?: number;
  averageSpeed?: number;
  movementCount?: number;
  
  // Context data
  dayOfWeek?: number; // 0-6, Sunday = 0
  hourOfDay?: number; // 0-23
  weather?: string;
  temperature?: number;
  
  createdAt: string;
  updatedAt: string;
  
  // Relations
  timeSpentLocation?: TimeSpentLocation;
}

// Time Spent Summary Interface
export interface TimeSpentSummary {
  id: string;
  userId: string;
  
  // Time period
  date: string; // ISO date string
  summaryType: TimeSpentSummaryType;
  
  // Aggregated data
  totalTimeSpent: number; // seconds
  totalSessions: number;
  uniqueLocations: number;
  averageSessionDuration: number;
  longestSession: number; // seconds
  
  // Top location for this period
  topLocationId?: string;
  topLocationTime?: number; // seconds
  
  // Activity patterns
  mostActiveHour?: number; // 0-23
  leastActiveHour?: number; // 0-23
  
  createdAt: string;
  updatedAt: string;
}

// Time Spent Summary Type Enum
export enum TimeSpentSummaryType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

// Location Category Interface
export interface LocationCategory {
  id: string;
  name: string;
  description?: string;
  color?: string; // Hex color
  icon?: string; // Icon name or emoji
  createdAt: string;
  updatedAt: string;
  
  // Relations
  timeSpentLocations?: TimeSpentLocationCategory[];
}

// Time Spent Location Category Junction Interface
export interface TimeSpentLocationCategory {
  id: string;
  timeSpentLocationId: string;
  locationCategoryId: string;
  
  // Optional: confidence score for auto-categorization
  confidence?: number; // 0.0 - 1.0
  isAutoGenerated: boolean;
  
  createdAt: string;
  
  // Relations
  timeSpentLocation?: TimeSpentLocation;
  locationCategory?: LocationCategory;
}

export interface UserDetailsUpdateReq {
  firstName:string;
  lastName:string;
  userName:string;
  imageUrl:string;
  completedTutorial:boolean;
  isLocationTrackingEnabled: boolean;
  selectedCity:any

}

export interface UserDataContextType {
  // --- Core state ---
  userData: UserData | null;
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  foundUsers: UserData[];

  // --- Derived values ---
  completedTutorial: boolean;
  status: Status;
  note: string;
  friends: any[];
  cityStats: CityStat | null;
  totalKilometers: number;
  cityCoveragePct: number;
  daysActive: number;
  longestStreakDays: number;

  // --- Core methods ---
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  refreshUserData: () => Promise<void>;
  updateUserDetails: (
    updates:UserDetailsUpdateReq
  ) => Promise<void>;
  updateSettings: (
    settings: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>
  ) => Promise<void>;
  updateUserField: (field: string, value: any) => Promise<void>;
  updateUserNote: (note: string) => Promise<void>;

  // --- Friends ---
  getFriends: () => Promise<Friend[]>;
  addFriendByUser: (friendUser: UserData) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsers: (searchQuery: string) => Promise<void>;
  fetchOtherUserProfile: (otherUserId: string) => Promise<any>;

  // --- City / Stats ---
  fetchVisitedStreets: () => Promise<any>;
  saveVisitedStreets: (
    visitedStreets: SaveVisitedStreetsRequest
  ) => Promise<any>;
  get2MainStats: () => Promise<any>;
  getMainRadarChartData: () => Promise<any>;
  updateCityStats: (
    cityStats: Partial<
      Omit<CityStat, "id" | "createdAt" | "updatedAt" | "userId">
    >
  ) => Promise<void>;
  fetchUsersSameCity: () => Promise<any>;

  // --- Leaderboards & Rankings ---
  fetchLocalLeaderboard: () => Promise<any>;
  fetchGlobalLeaderboard: () => Promise<any>;
  fetchRank: () => Promise<any>;
  fetchRankProgress: () => Promise<any>;

  // --- Permissions ---
  getLocationPermission: () => Promise<any>;
  saveLocationPermission: (hasPermission: boolean) => Promise<any>;
}