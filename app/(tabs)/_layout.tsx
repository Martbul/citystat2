import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/IconSymbol";
import Spinner from "@/components/spinner";
import TabBarBackground from "@/components/TabBarBackground";
import { useUserData } from "@/Providers/UserDataProvider";
import { useAuth } from "@clerk/clerk-expo";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { userData, isLoading } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn && !isLoading && isLoaded) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (userData && !userData.completedTutorial) {
      router.replace("/(tutorial)/tutorial");
      return;
    }
  }, [isSignedIn, userData, router]);

  if (!isSignedIn || (userData && !userData.completedTutorial)) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner variant="orbital" size="xl" />
      </View>
    );
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
        name="world"
        options={{
          title: "World",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="public.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ranking"
        options={{
          title: "Ranking",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="trophy.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="dev"
        options={{
          title: "dev",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="hammer.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
