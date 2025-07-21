import {  Animated, Dimensions, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import SettingsDrawer from "@/components/screens/Settings";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useUser } from "@clerk/clerk-expo";

const { width: screenWidth } = Dimensions.get("window");

export default function ProfileScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  
  const { isSignedIn, user, isLoaded } = useUser();
  if (!isLoaded) {
    // Handle loading state
    return null;
  }
  if (!isSignedIn) {
    // Handle signed out state
    return null;
  }

    const openDrawer = () => {
      setIsDrawerOpen(true);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const closeDrawer = () => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsDrawerOpen(false);
      });
    };

  return (
    <View className="flex flex-col h-screen bg-gray-900 text-white">
      {isDrawerOpen && (
        <SettingsDrawer
          isDrawerOpen={isDrawerOpen}
          slideAnim={slideAnim}
          overlayOpacity={overlayOpacity}
          closeDrawer={closeDrawer}
        />
      )}
      {/* Header */}
      <View className="flex flex-row items-center justify-end gap-4 items-center px-4 pt-10 bg-gray-700">
        <TouchableOpacity className="flex justify-center items-center w-10 h-10 bg-gray-800 rounded-full my-4">
          <FontAwesome5 name="store" size={18} color="white" />{" "}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openDrawer}
          className="flex justify-center items-center w-10 h-10 bg-gray-800 rounded-full "
        >
          <Ionicons name="settings" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <View className="flex-1 overflow-y-auto px-4 pb-20">
        <View className="flex flex-row items-center space-x-3 pt-6">
          <View className="relative">
            <View className="w-28 h-28 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              MB
            </View>
            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></View>
          </View>
          <TouchableOpacity className="bg-gray-700 mt-20 px-2 py-2 rounded-full flex items-center text-sm">
            <Feather name="plus" size={16} color="white" /> Add Status
          </TouchableOpacity>
        </View>
        {/* Profile Info */}
        <View className="mt-6">
          <Text className="text-white text-3xl font-bold mb-1">
            {user.firstName} {user.lastName} {user.emailAddresses.toString()}
          </Text>
          <View className="flex flex-row">
            <Text className="text-gray-400 text-lg">{user.username}</Text>
            <View className="w-6 h-6 bg-teal-900 rounded ml-2 flex items-center justify-center">
              <Feather name="hash" size={16} color="white" />{" "}
            </View>
          </View>
        </View>
        {/* Edit Profile TouchableOpacity */}
        <TouchableOpacity
          onPress={openDrawer}
          className="w-full bg-indigo-600 mt-6 py-3 rounded-lg flex flex-row items-center justify-center gap-2 font-semibold"
        >
          <FontAwesome name="pencil" size={24} color="white" />
          <Text className="text-white">Edit Profile</Text>
        </TouchableOpacity>

        <View className="mt-6 bg-gray-800 rounded-xl p-4">
          <Text className="text-gray-400 text-lg font-medium mb-3">
            Member Since
          </Text>
          <View className="flex items-center">
            {/* //TODO : ADD YOUR LOGO*/}
            {/* <View className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center mr-3">
              <Text className="text-white text-sm">D</Text>
            </View> */}
            <Text className="text-white text-lg">29 Jan 2021</Text>
          </View>
        </View>

        <TouchableOpacity>
          <View className="flex flex-row justify-between items-center mt-6 bg-gray-800 rounded-xl p-4">
            <Text className="text-gray-400 text-lg font-medium">
              Your Friends
            </Text>

            <View className="flex items-center">
              <AntDesign name="arrowright" size={24} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex flex-row w-full mt-6 bg-gray-800 rounded-xl p-4  items-center justify-between mb-6">
          <Text className="text-gray-400 text-lg">
            Note (only visible to you)
          </Text>
          <FontAwesome name="sticky-note-o" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}