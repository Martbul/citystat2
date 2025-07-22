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
} from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";
import { settings } from "@/data/settingsData";
import { SignOutButton } from "../clerk/SignOutButton";

const { width: screenWidth } = Dimensions.get("window");

const SettingsDrawer = ({
  isDrawerOpen,
  slideAnim,
  overlayOpacity,
  closeDrawer,
}: {
  isDrawerOpen: boolean;
  slideAnim: Animated.Value;
  overlayOpacity: Animated.Value;
  closeDrawer: () => void;
}) => {
  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
        pointerEvents={isDrawerOpen ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={closeDrawer}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
        pointerEvents={isDrawerOpen ? "auto" : "none"}
      >
        <SafeAreaView className="flex-1 bg-lightBackground">
          {/* Header */}
          <View className="relative flex-row items-center p-4 py-6 mt-10 border-b border-gray-800">
            <TouchableOpacity
              onPress={closeDrawer}
              className="absolute left-4"
              style={{ zIndex: 10 }}
            >
              <AntDesign
                onPress={closeDrawer}
                name="arrowleft"
                size={28}
                color="#333333ff"
              />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-lightBlackText font-bold text-2xl">
              Settings
            </Text>
          </View>

          <View className="flex-1">
            {/* Settings List */}
            <FlatList
              scrollEnabled={true}
              data={settings}
              keyExtractor={(item) => item.label}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity className="flex-row items-center justify-between bg-lightSurface border-lightContainerBg rounded-xl px-4 py-4 mb-2">
                  <View className="flex-row items-center space-x-4">
                    {item.icon()}
                    <Text className="text-lightBlackText text-base">
                      {item.label}
                    </Text>
                  </View>
                  <AntDesign name="right" size={16} color="#999" />
                </TouchableOpacity>
              )}
              ListFooterComponent={() => (
                <TouchableOpacity className="flex-row items-center justify-between bg-lightSurface rounded-xl px-4 py-4 mb-2">
                  <SignOutButton />
                </TouchableOpacity>
              )}
            />
          </View>
          {/* Settings List */}
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

export default SettingsDrawer;

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
    width: screenWidth ,
    backgroundColor: "#000", // black background
    zIndex: 20,
    elevation: 5,
  },
});
