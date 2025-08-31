import React from 'react';
import { Text, TouchableOpacity, View } from "react-native";
import { RowLayout, SectionSpacing } from "@/components/dev";

interface TabSelectorProps {
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
  tabOne: string;
  tabTwo: string;
  containerClassName?: string;
}

export default function TabSelector({ 
  tab, 
  setTab, 
  tabOne, 
  tabTwo, 
  containerClassName = "" 
}: TabSelectorProps) {
  const getTabButtonClasses = (isActive: boolean) => {
    return `px-14 py-3 rounded-full ${
      isActive
        ? "bg-accent shadow-sm"
        : "bg-white border border-gray-200"
    }`;
  };

  const getTabTextClasses = (isActive: boolean) => {
    return `font-semibold text-base ${
      isActive ? "text-white" : "text-textGray"
    }`;
  };

  return (
    <SectionSpacing className={containerClassName}>
      <RowLayout className="justify-center gap-4">
        <TouchableOpacity
          onPress={() => setTab(tabOne)}
          className={getTabButtonClasses(tab === tabOne)}
          activeOpacity={0.7}
        >
          <Text className={getTabTextClasses(tab === tabOne)}>
            {tabOne}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setTab(tabTwo)}
          className={getTabButtonClasses(tab === tabTwo)}
          activeOpacity={0.7}
        >
          <Text className={getTabTextClasses(tab === tabTwo)}>
            {tabTwo}
          </Text>
        </TouchableOpacity>
      </RowLayout>
    </SectionSpacing>
  );
}