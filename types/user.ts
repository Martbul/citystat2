import { Language, Theme } from "./settings";




export enum Status {
  ACTIVE = 'ACTIVE',
  SLEEP = 'SLEEP',
  OFFLINE = 'OFFLINE',
  BANNED = 'BANNED',
  PENDING = 'PENDING',
  IDLE = 'IDLE',
  INVISIBLE = 'INVISIBLE'
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
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
  id: string; // Clerk user ID
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  phoneNumber?: string;
  role: Role;
  completedTutorial: boolean;
  friendIds: string[];
  note?: string;
  status: Status;
  cityStats?: CityStat;
  settings?: Settings;
  createdAt: string;
  updatedAt: string;
}
