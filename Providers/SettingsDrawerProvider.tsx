// contexts/DrawerContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface DrawerContextType {
  isSettingsDrawerOpen: boolean;
  setIsSettingsDrawerOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const DrawerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

  return (
    <DrawerContext.Provider
      value={{ isSettingsDrawerOpen, setIsSettingsDrawerOpen }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export const useSettingsDrawer = () => {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
};
