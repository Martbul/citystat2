export interface Settings {
  id: string;
  userId: string;
  theme: Theme;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export type Theme = "Light" | "Dark";
export type Language = "En" | "Es" | "Fr" | "De" | "It" | "Pt"| "Ru" | "Bg"; 

export interface SettingsProviderInterface {
   settings: Settings | null;
   setSettings: (settings: Settings) => void;
   updateTheme: (theme: Theme) => void;
   updateLanguage: (language: Language) => void;
}