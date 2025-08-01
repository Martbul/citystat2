import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";

import { SignOutButton } from "@/components/clerk/SignOutButton";
import { menuItems } from "@/data/sideMenuData";
import { useUserData } from "@/Providers/UserDataProvider";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Panel from "../panel";

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

  const handleMenuItemPress = (route: string) => {
    // TODO: Add navigation logic here
    console.log("Navigate to:", route);
    closeDrawer();
  };

  return (
    <>
      {/* Overlay */}
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
        <SafeAreaView className="flex-1 bg-lightSurface">
          <View className="relative flex-row items-center p-4 py-6  border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity
              onPress={closeDrawer}
              className="absolute left-4"
              style={{ zIndex: 10 }}
            >
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-gray-900  font-anybodyBold text-xl">
              CityStat
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            className="p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <View className="flex-row items-center ">
              <View className="flex items-center justify-center bg-lightNeutralGray rounded-full w-16 h-16">
                <Image
                  className="w-14 h-14"
                  source={{ uri: userData?.imageUrl }}
                ></Image>
              </View>

              <View className="ml-3">
                <Text className="text-gray-900 font-anybodyBold text-lg">
                  {userData?.firstName} {userData?.lastName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-5 h-5 bg-lightSecondaryAccent rounded  flex items-center justify-center">
                    <Feather name="hash" size={16} color="white" />
                  </View>
                  <Text className="text-muted ml-1 text-sm font-anybody">
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
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <Panel
                border={true}
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
