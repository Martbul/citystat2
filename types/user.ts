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
  totalStreetsWalked: number;
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
  userData: UserData | null;
  settings: Settings;

  completedTutorial: boolean;
  status: Status;
  note: string;
  friends: any[];
  cityStats: CityStat | null;
  totalStreetsWalked: number;
  totalKilometers: number;
  cityCoveragePct: number;
  daysActive: number;
  longestStreakDays: number;
  foundUsers: UserData[];
  isLoading: boolean;
  error: string | null;
  getFriends: () => Promise<Friend[]>;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  getLocationPermission: () => Promise<any>;
  fetchVisitedStreets: () => Promise<any>;
  saveVisitedStreets: (
    visitedStreets: SaveVisitedStreetsRequest
  ) => Promise<any>;
  fetchOtherUserProfile: (otherUserId: string) => Promise<any>;
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
  refreshUserData: () => Promise<void>;
  saveLocationPermission: (hasPermission: boolean) => Promise<any>;
  removeFriend: (friendId: string) => Promise<void>;
  updateCityStats: (
    cityStats: Partial<
      Omit<
        CityStat,
        "id" | "createdAt" | "updatedAt" | "streetWalks" | "userId"
      >
    >
  ) => Promise<void>;
  searchUsers: (searchQuery: string) => Promise<void>;
  addFriendByUser: (friendUser: UserData) => Promise<boolean>;
}
