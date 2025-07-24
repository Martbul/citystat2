export interface Settings {
  id: string;
  userId: string;
  theme: Theme;
  language: Language;
  createdAt: string;
  updatedAt: string;
}


export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Auto = 'auto'
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

export interface SettingsProviderInterface {
   settings: Settings | null;
   setSettings: (settings: Settings) => void;
   updateTheme: (theme: Theme) => void;
   updateLanguage: (language: Language) => void;
}