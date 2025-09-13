import React, { createContext, useContext, useState, ReactNode } from "react";

interface DrawerProviderType {
  isSideMenuDrawerOpen: boolean;
  isTopSearchDrawerOpen: boolean;
  setIsSideMenuDrawerOpen: (open: boolean) => void;
  setIsTopSearchDrawerOpen: (open: boolean) => void;
}

const DrawerContext = createContext<
  DrawerProviderType | undefined
>(undefined);

export const DrawerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isSideMenuDrawerOpen, setIsSideMenuDrawerOpen] = useState(false);
  const [isTopSearchDrawerOpen, setIsTopSearchDrawerOpen] = useState(false);

  return (
    <DrawerContext.Provider
      value={{ isSideMenuDrawerOpen, isTopSearchDrawerOpen, setIsSideMenuDrawerOpen,setIsTopSearchDrawerOpen }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export const useMenusDrawer = () => {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error(
      "useMenusDrawer must be used within a DrawerProvider"
    );
  }
  return context;
};
