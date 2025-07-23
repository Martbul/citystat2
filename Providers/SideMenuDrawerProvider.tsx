import React, { createContext, useContext, useState, ReactNode } from "react";

interface SideMenuDrawerProviderType {
  isSideMenuDrawerOpen: boolean;
  setIsSideMenuDrawerOpen: (open: boolean) => void;
}

const SideMenuDrawerContext = createContext<SideMenuDrawerProviderType | undefined>(
  undefined
);

export const SideMenuDrawerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isSideMenuDrawerOpen, setIsSideMenuDrawerOpen] = useState(false);

  return (
    <SideMenuDrawerContext.Provider
      value={{ isSideMenuDrawerOpen, setIsSideMenuDrawerOpen }}
    >
      {children}
    </SideMenuDrawerContext.Provider>
  );
};

export const useSideMenusDrawer = () => {
  const context = useContext(SideMenuDrawerContext);
  if (context === undefined) {
    throw new Error(
      "useSideMenusDrawer must be used within a SideMenuDrawerProvider"
    );
  }
  return context;
};
