import { Language, Theme, Settings } from "./settings";

export enum Status {
  ACTIVE = "ACTIVE",
  SLEEP = "SLEEP",
  OFFLINE = "OFFLINE",
  BANNED = "BANNED",
  PENDING = "PENDING",
  IDLE = "IDLE",
  INVISIBLE = "INVISIBLE",
}

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

// Add missing Device interface from your schema
export interface Device {
  id: string;
  userId: string;
  settingsId?: string;
  name: string;
  location: string;
  lastLoggedIn: string;
}

// Add VisitedStreet interface from your schema
export interface VisitedStreet {
  id: string;
  userId: string;
  sessionId: string;
  streetId: string;
  streetName: string;
  entryTimestamp: number; // BigInt in Prisma, but number in TS for JSON
  exitTimestamp?: number;
  durationSeconds?: number;
  entryLatitude: number; // Decimal in Prisma
  entryLongitude: number;
  createdAt: string;
}

export interface StreetWalk {
  id: string;
  streetName: string;
  geoJson: any; // JSON type from Prisma
  distanceKm: number;
  cityStatId: string;
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
  streetWalks: StreetWalk[];
  userId: string; // Add this - it's in your Prisma schema
  settingsId?: string; // Add this - it's in your Prisma schema
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
  devices?: Device; // Note: Device? in schema (one-to-one)
  friends?: Friend[]; // Friends where this user is the "user"
  friendOf?: Friend[]; // Friends where this user is the "friend"
  visitedStreets?: VisitedStreet[];
}

export interface UserDataContextType {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  isLoading: boolean;
  error: string | null;
  getFriends: () => Promise<Friend[]>
  
  settings: Settings;
  fetchOtherUserProfile:(otherUserId: string) => Promise<any>;
  updateUser: (updates: Partial<Omit<UserData, "id" | "createdAt" | "updatedAt" | "cityStats" | "settings">>) => Promise<void>;
  updateSettings: (settings: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  updateUserField: (field: string, value: any) => Promise<void>;
  updateUserNote: (note: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  
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
  streetWalks: StreetWalk[];
  
  // Friends & City stats
  removeFriend: (friendId: string) => Promise<void>;
  updateCityStats: (cityStats: Partial<Omit<CityStat, "id" | "createdAt" | "updatedAt" | "streetWalks" | "userId">>) => Promise<void>;
  addStreetWalk: (streetWalk: Omit<StreetWalk, "id" | "cityStatId">) => Promise<void>;
  searchUsers:(searchQuery: string) => Promise<void>
  foundUsers:UserData[],
addFriendByUser: (friendUser: UserData) => Promise<boolean>;
}
