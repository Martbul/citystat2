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

// Updated Friend interface to match Prisma schema
export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  firstName?: string; // Add these fields from your schema
  lastName?: string;
  userName: string;
  imageUrl?: string;
  createdAt: string;
  // Relations
  user?: UserData;
  friend?: UserData;
}

// Updated UserData interface to match Prisma schema exactly
export interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  imageUrl: string; // Not optional in schema, has default value
  phoneNumber?: string;
  role: Role;
  completedTutorial: boolean;
  aboutMe?: string; // Add this field from schema
  disableAccount: boolean; // Add this field from schema
  deleteAccount: boolean; // Add this field from schema
  note?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  cityStats?: CityStat;
  settings?: Settings;
  devices?: Device; // Note: Device? in schema (one-to-one)
  friends?: Friend[]; // Friends where this user is the "user"
  friendOf?: Friend[]; // Friends where this user is the "friend"
  visitedStreets?: VisitedStreet[];
}

// Updated context type with proper typing
export interface UserDataContextType {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>; // Proper typing instead of 'any'
  isLoading: boolean;
  error: string | null;

  // User operations
  updateUser: (
    updates: Partial<Omit<UserData, "id" | "createdAt" | "updatedAt" | "cityStats" | "settings">>
  ) => Promise<void>;
  refreshUserData: () => Promise<void>;

  // Tutorial
  completedTutorial: boolean;
  setCompletedTutorial: (completed: boolean) => Promise<void>;

  // Settings
  theme: Theme;
  language: Language;
  updateTheme: (theme: Theme) => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
  updateSettings: (
    settings: Partial<Omit<Settings, "id" | "userId" | "createdAt" | "updatedAt">>
  ) => Promise<void>;

  // User status and profile
  status: Status;
  setStatus: (status: Status) => Promise<void>;
  note?: string; // Fix: should be optional and string, not String
  setNote: (note: string) => Promise<void>;

  // Friends
  friends: Friend[];
  addFriend: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;

  // City stats
  cityStats: CityStat | null;
  totalStreetsWalked: number;
  totalKilometers: number;
  cityCoveragePct: number;
  daysActive: number;
  longestStreakDays: number;
  streetWalks: StreetWalk[];
  updateCityStats: (
    cityStats: Partial<Omit<CityStat, "id" | "createdAt" | "updatedAt" | "streetWalks" | "userId">>
  ) => Promise<void>;
  addStreetWalk: (
    streetWalk: Omit<StreetWalk, "id" | "cityStatId">
  ) => Promise<void>;
  incrementStreetsWalked: () => Promise<void>;
  addKilometers: (km: number) => Promise<void>;

  // Add missing methods for new fields
  updateAboutMe: (aboutMe: string) => Promise<void>;
  setDisableAccount: (disabled: boolean) => Promise<void>;
  setDeleteAccount: (deleted: boolean) => Promise<void>;
}

// import { Settings } from "react-native";
// import { Language, Theme } from "./settings";

// export enum Status {
//   ACTIVE = "ACTIVE",
//   SLEEP = "SLEEP",
//   OFFLINE = "OFFLINE",
//   BANNED = "BANNED",
//   PENDING = "PENDING",
//   IDLE = "IDLE",
//   INVISIBLE = "INVISIBLE",
// }

// export enum Role {
//   USER = "USER",
//   ADMIN = "ADMIN",
//   MODERATOR = "MODERATOR",
// }

// export interface StreetWalk {
//   id: string;
//   streetName: string;
//   geoJson: any; // JSON type from Prisma
//   distanceKm: number;
//   cityStatId: string;
// }

// export interface CityStat {
//   id: string;
//   name: string;
//   state: string;
//   country: string;
//   population?: number;
//   area?: number;
//   totalStreetsWalked: number;
//   totalKilometers: number;
//   cityCoveragePct: number;
//   daysActive: number;
//   longestStreakDays: number;
//   streetWalks: StreetWalk[];
//   createdAt: string;
//   updatedAt: string;
// }



// export interface UserData {
//   id: string; 
//   email: string;
//   firstName?: string;
//   lastName?: string;
//   userName?: string;
//   imageUrl?: string;
//   phoneNumber?: string;
//   role: Role;
//   completedTutorial: boolean;
//   friends?: Friend[]; // Friends where this user is the "user"
//   friendOf?: Friend[];
//   note?: string;
//   status: Status;
//   cityStats?: CityStat;
//   settings?: Settings;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Friend {
//   id: string;
//   userId: string;
//   imageUrl: string;
//   userName: string;
//   friendId: string;
//   createdAt: string;
//   friend?: UserData;
// }


// export interface UserDataContextType {
//   userData: UserData | null;
//   setUserData:any;
//   isLoading: boolean;
//   error: string | null;

//   updateUser: (
//     updates: Partial<
//       Omit<
//         UserData,
//         "id" | "createdAt" | "updatedAt" | "cityStats" | "settings"
//       >
//     >
//   ) => Promise<void>;
//   refreshUserData: () => Promise<void>;

//   completedTutorial: boolean;
//   setCompletedTutorial: (completed: boolean) => Promise<void>;

//   theme: Theme;
//   language: Language;
//   updateTheme: (theme: Theme) => Promise<void>;
//   updateLanguage: (language: Language) => Promise<void>;
//   updateSettings: (
//     settings: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>
//   ) => Promise<void>;

//   status: Status;
//   setStatus: (status: Status) => Promise<void>;

//   note: String;
//   setNote: (note:string) => Promise<void>;

//   friends: Friend[];
//   addFriend: (friendId: string) => Promise<void>;
//   removeFriend: (friendId: string) => Promise<void>;

//   cityStats: CityStat | null;
//   totalStreetsWalked: number;
//   totalKilometers: number;
//   cityCoveragePct: number;
//   daysActive: number;
//   longestStreakDays: number;
//   streetWalks: StreetWalk[];
//   updateCityStats: (
//     cityStats: Partial<
//       Omit<CityStat, "id" | "createdAt" | "updatedAt" | "streetWalks">
//     >
//   ) => Promise<void>;
//   addStreetWalk: (
//     streetWalk: Omit<StreetWalk, "id" | "cityStatId">
//   ) => Promise<void>;
//   incrementStreetsWalked: () => Promise<void>;
//   addKilometers: (km: number) => Promise<void>;
// }
