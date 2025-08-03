import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "@clerk/clerk-expo";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useUserData } from "@/Providers/UserDataProvider";

export default function TabLayout() {
  const { isSignedIn } = useAuth();
  const { userData } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (userData && !userData.completedTutorial) {
      router.replace("/(tutorial)/tutorial");
      return;
    }
  }, [isSignedIn, userData, router]);

  if (!isSignedIn || (userData && !userData.completedTutorial)) {
    return null;//Add loading spinner or smth
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#bddc62",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: [
          Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapscreen"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="location.fill" color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dev"
        options={{
          title: "Dev",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}