import { Language, Settings, SettingsProviderInterface, Theme } from "@/types/settings";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";



const SettingsContext = createContext<SettingsProviderInterface | undefined>(
  undefined
);

export const useSettingsContext = () => {
   const context = useContext(SettingsContext);
   if (context === undefined) {
      throw new Error("useSettingsContext must be used within a SettingsProvider");
   }
   return context;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
   const [settings, setSettings] = useState<Settings | null>(null);

   useEffect(() => {
      fetch("/api/settings")
         .then((res) => res.json())
         .then((data) => setSettings(data))
         .catch(() => {});
   }, []);

   const updateTheme = (theme: Theme) => {
      if (!settings) return;
      const updated = { ...settings, theme };
      setSettings(updated);
      fetch("/api/settings", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ theme }),
      });
   };

   const updateLanguage = (language: Language) => {
      if (!settings) return;
      const updated = { ...settings, language };
      setSettings(updated);
      fetch("/api/settings", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ language }),
      });
   };

   return (
      <SettingsContext.Provider
         value={{ settings, setSettings, updateTheme, updateLanguage }}
      >
         {children}
      </SettingsContext.Provider>
   );
};

export default SettingsContext;
