export enum Theme {
  LIGHT = 'LIGHT',    
  DARK = 'DARK',
  SYSTEM = 'SYSTEM'
}

export enum Language {
  En = 'En',
  Es = 'Es', 
  Fr = 'Fr',
  De = 'De',
  Zh = 'Zh',
  Ja = 'Ja',
  Ru = 'Ru',
  Bg = 'Bg'
}

export enum TextSize {
  BIG = 'BIG',
  MEDIUM = 'MEDIUM',
  SMALL = 'SMALL'
}

export enum RoleColors {
  NEXTTONAME = 'NEXTTONAME',
  INNAME = 'INNAME',
  DONTSHOW = 'DONTSHOW',
  SYNCPROFILECOLORS = 'SYNCPROFILECOLORS'
}

export enum Motion {
  REDUCEDMOTION = 'REDUCEDMOTION',
  SYNCWITHDEVICE = 'SYNCWITHDEVICE',
  DONTPLAYGIFWHENPOSSIBLESHOW = 'DONTPLAYGIFWHENPOSSIBLESHOW',
  PLAYEMOJIES = 'PLAYEMOJIES'
}

export enum StickersAnimation {
  ALWAYS = 'ALWAYS',
  ONINTERACTION = 'ONINTERACTION',
  NEVER = 'NEVER'
}

export enum MessagesAllowance {
  ALLMSG = 'ALLMSG',
  UNREADMAS = 'UNREADMAS',
  HIDE = 'HIDE'
}
// Settings update request type
export interface SettingsUpdateRequest {
  theme?: Theme;
  textSize?: TextSize;
  zoomLevel?: string;
  fontStyle?: string;
  messagesAllowance?: MessagesAllowance;
  showRoleColors?: RoleColors;
  language?: Language;
  enabledLocationTracking?: boolean;
  allowCityStatDataUsage?: boolean;
  allowDataPersonalizationUsage?: boolean;
  allowInAppRewards?: boolean;
  allowDataAnaliticsAndPerformance?: boolean;
  enableInAppNotifications?: boolean;
  enableSoundEffects?: boolean;
  enableVibration?: boolean;
}

// Full settings type matching Prisma
export interface Settings {
  id: string;
  userId: string;
  theme: Theme;
  language: Language;
  enabledLocationTracking: boolean;
  allowCityStatDataUsage: boolean;
  allowDataPersonalizationUsage: boolean;
  allowInAppRewards: boolean;
  allowDataAnaliticsAndPerformance: boolean;
  motion: Motion;
  textSize: TextSize;
  zoomLevel: string;
  fontStyle: string;
  messagesAllowance: MessagesAllowance;
  showRoleColors: RoleColors;
  enableInAppNotifications: boolean;
  enableSoundEffects: boolean;
  enableVibration: boolean;
  stickersAnimation: StickersAnimation,
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsProviderInterface {
  settings: Settings | null;
  setSettings: (settings: Settings) => void;
  updateTheme: (theme: Theme) => void;
  updateLanguage: (language: Language) => void;
}