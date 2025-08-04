export enum Theme {
  Light = 'Light', 
  Dark = 'Dark',
  Auto = 'Auto'
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
  textSize: TextSize;
  zoomLevel: string;
  fontStyle: string;
  messagesAllowance: MessagesAllowance;
  showRoleColors: RoleColors;
  motion: Motion;
  stickersAnimation: StickersAnimation;
  enableInAppNotifications: boolean;
  enableSoundEffects: boolean;
  enableVibration: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsProviderInterface {
  settings: Settings | null;
  setSettings: (settings: Settings) => void;
  updateTheme: (theme: Theme) => void;
  updateLanguage: (language: Language) => void;
}