import React from "react";
import { View, Text, FlatList, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/ui/header";

const COLORS = {
  lightBackground: "#ebebeb",
  lightSurface: "#fafafa",
  lightPrimaryText: "#111111",
  lightContainerBg: "#212121",
  lightNeutralGray: "#c9c9c9ff",
  lightMutedText: "#cecece",
  lightBlackText: "#333333ff",
  lightPrimaryAccent: "#bddc62",
  lightSecondaryAccent: "#c8f751",
};

const notifications = [
  { id: "1", title: "Welcome!", message: "Thanks for joining our app." },
  { id: "2", title: "Update Available", message: "Version 2.0 is now live!" },
  {
    id: "3",
    title: "Reminder",
    message: "Don’t forget to check today’s tasks.",
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: COLORS.lightBackground }}
    >
      <View className="px-4 py-6">
           <Header title="Notifications"/>
      

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              className="mb-3 p-4 rounded-2xl"
              style={{ backgroundColor: COLORS.lightSurface }}
            >
              <Text
                className="text-base font-semibold mb-1"
                style={{ color: COLORS.lightBlackText }}
              >
                {item.title}
              </Text>
              <Text
                className="text-sm"
                style={{ color: COLORS.lightMutedText }}
              >
                {item.message}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
