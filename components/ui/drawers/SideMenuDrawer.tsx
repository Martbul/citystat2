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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Entypo from "@expo/vector-icons/Entypo";
import { SignOutButton } from "@/components/clerk/SignOutButton";
import { menuItems } from "@/data/sideMenuData";

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

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
        pointerEvents={isSideMenuDrawerOpen ? "auto" : "none"}
      >
        <SafeAreaView className="flex-1 bg-bddc62">
          {/* Header */}
          <View className="relative flex-row items-center p-4 py-6 mt-10 border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity
              onPress={closeDrawer}
              className="absolute left-4"
              style={{ zIndex: 10 }}
            >
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-text dark:text-darkText font-anybodyBold text-xl">
              Menu
            </Text>
          </View>

          {/* User Info Section */}
          <View className="p-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center">
              <MaterialIcons name="account-circle" size={48} color="#666" />
              <View className="ml-3">
                <Text className="text-text dark:text-darkText font-anybodyBold text-lg">
                  Alex Petrov
                </Text>
                <View className="flex-row items-center mt-1">
                  <Entypo name="location-pin" size={12} color="#666" />
                  <Text className="text-muted ml-1 text-sm font-anybody">
                    Sofia, Bulgaria
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-1">
            {/* Menu List */}
            <FlatList
              scrollEnabled={true}
              data={menuItems}
              keyExtractor={(item) => item.label}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center bg-white dark:bg-darkSurface rounded-xl px-4 py-4 mb-2 shadow-sm"
                  onPress={() => handleMenuItemPress(item.route)}
                >
                  <View className="flex-row items-center flex-1">
                    {item.icon()}
                    <Text className="text-text dark:text-darkText text-base font-anybody ml-4">
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
