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
  role: Role;
  completedTutorial: boolean;
  aboutMe?: string;
  disableAccount: boolean;
  deleteAccount: boolean;
  note?: string;
  status: Status;

  cityName?: string;
  cityCountry?: string;
  cityState?: string;
  cityCoords?: {
    lat: number;
    lng: number;
  };
  selectedCity?: {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
    display_name: string;
  };
  createdAt: string;
  updatedAt: string;

  cityStats?: CityStat;
  settings?: Settings;
  devices?: Device;
  friends?: Friend[];
  friendOf?: Friend[];
  visitedStreets?: VisitedStreet[];
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
    updates: Partial<
      Omit<
        UserData,
        "id" | "createdAt" | "updatedAt" | "cityStats" | "settings"
      >
    >
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