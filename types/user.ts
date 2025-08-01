import { Language, Theme } from "./settings";

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
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  theme: Theme;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  id: string; 
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  imageUrl?: string;
  phoneNumber?: string;
  role: Role;
  completedTutorial: boolean;
  friends?: Friend[]; // Friends where this user is the "user"
  friendOf?: Friend[];
  note?: string;
  status: Status;
  cityStats?: CityStat;
  settings?: Settings;
  createdAt: string;
  updatedAt: string;
}

export interface Friend {
  id: string;
  userId: string;
  imageUrl: string;
  userName: string;
  friendId: string;
  createdAt: string;
  friend?: UserData;
}


export interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;

  updateUser: (
    updates: Partial<
      Omit<
        UserData,
        "id" | "createdAt" | "updatedAt" | "cityStats" | "settings"
      >
    >
  ) => Promise<void>;
  refreshUserData: () => Promise<void>;

  completedTutorial: boolean;
  setCompletedTutorial: (completed: boolean) => Promise<void>;

  theme: Theme;
  language: Language;
  updateTheme: (theme: Theme) => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
  updateSettings: (
    settings: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>
  ) => Promise<void>;

  status: Status;
  setStatus: (status: Status) => Promise<void>;

  note: String;
  setNote: (note:string) => Promise<void>;

  friends: Friend[];
  addFriend: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;

  cityStats: CityStat | null;
  totalStreetsWalked: number;
  totalKilometers: number;
  cityCoveragePct: number;
  daysActive: number;
  longestStreakDays: number;
  streetWalks: StreetWalk[];
  updateCityStats: (
    cityStats: Partial<
      Omit<CityStat, "id" | "createdAt" | "updatedAt" | "streetWalks">
    >
  ) => Promise<void>;
  addStreetWalk: (
    streetWalk: Omit<StreetWalk, "id" | "cityStatId">
  ) => Promise<void>;
  incrementStreetsWalked: () => Promise<void>;
  addKilometers: (km: number) => Promise<void>;
}
