import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";

import { SignOutButton } from "@/components/clerk/SignOutButton";
import { menuItems } from "@/data/sideMenuData";
import { useUserData } from "@/Providers/UserDataProvider";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import SideMenuPannel from "../sideMenuPanel";
import { PageTitle } from "../dev";

const { width: screenWidth } = Dimensions.get("window");

const SideMenuDrawer = ({
  isSideMenuDrawerOpen,
  slideAnim,
  overlayOpacity,
  closeDrawer,
}: {
  isSideMenuDrawerOpen: boolean;
  slideAnim: Animated.Value;
  overlayOpacity: Animated.Value;
  closeDrawer: () => void;
}) => {
  const { userData, isLoading } = useUserData();
  const router = useRouter();

  return (
    <>
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
        pointerEvents={isSideMenuDrawerOpen ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={closeDrawer}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
        pointerEvents={isSideMenuDrawerOpen ? "auto" : "none"}
      >
        <SafeAreaView className="flex-1 bg-lightSurface mt-1">
          <View className="relative flex-row items-center justify-center  p-4 py-6  border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity
              onPress={closeDrawer}
              className="absolute left-4"
              style={{ zIndex: 10 }}
            >
              <AntDesign name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <PageTitle>City Stat</PageTitle>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            className="p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <View className="flex-row items-center">
              {/* Avatar */}
              <View className="w-16 h-16 rounded-full bg-lightNeutralGray overflow-hidden items-center justify-center">
                {userData?.imageUrl ? (
                  <Image
                    source={{ uri: userData.imageUrl }}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <Feather name="user" size={28} color="#666" />
                )}
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-gray-900 dark:text-gray-500 font-anybodyBold text-lg">
                  {userData?.firstName} {userData?.lastName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-5 h-5 bg-accent rounded flex items-center justify-center">
                    <Feather name="hash" size={14} color="white" />
                  </View>
                  <Text className="ml-2 text-sm font-anybody text-muted">
                    {userData?.userName}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <View className="flex-1">
            <FlatList
              scrollEnabled={true}
              data={menuItems}
              keyExtractor={(item) => item.label}
              contentContainerStyle={{ padding: 12 }}
              renderItem={({ item }) => (
                <SideMenuPannel
                  label={item.label}
                  icon={item.icon()}
                  route={item.route}
                />
              )}
              ListFooterComponent={() => <SignOutButton />}
            />
          </View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

export default SideMenuDrawer;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#00000099",
    zIndex: 10,
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: screenWidth * 0.85, // 85% of screen width
    backgroundColor: "#ffffff",
    zIndex: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
