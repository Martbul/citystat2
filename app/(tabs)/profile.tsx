import PrimaryButton from "@/components/primaryButton";
import { useUserData } from "@/Providers/UserDataProvider";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { RelativePathString, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { userData, isLoading, refreshUserData } = useUserData();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log("refreshing user data");
    refreshUserData()
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserData?.();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserData]);

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-containerBg">
        <View className="flex-1 justify-center items-center">
          <Text className="text-textDarkGray text-lg">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-containerBg">
      <View className="flex flex-col h-screen bg-containerBg">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

        {/* Header with modern gradient background */}
        <View className="flex flex-row items-center justify-end gap-3 px-4 pt-8 pb-9 bg-gradient-to-br from-panelDark to-panelDarker">
          <TouchableOpacity
            className="flex justify-center items-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            onPress={() => router.push("/(settings)/settings")}
          >
            <Ionicons name="settings" size={28} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Profile Image with modern styling */}
        <View className="absolute top-20 left-4 z-10">
          <View className="relative">
            <View className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-lg border-4 border-white">
              <Image
                className="w-28 h-28 rounded-3xl"
                source={{ uri: userData?.imageUrl }}
              />
            </View>
           
          </View>
        </View>

        <ScrollView
          className="flex-1 px-4 pb-20"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#c8f751"]} // Android - using modern green
              tintColor="#c8f751" // iOS - using modern green
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Section */}
          <View className="mt-24">
            <Text className="text-textDark text-4xl font-bold mb-2">
              {userData?.firstName} {userData?.lastName}
            </Text>
            <View className="flex flex-row items-center gap-2 mb-4">
              <View className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center shadow-sm">
                <Feather name="hash" size={16} color="white" />
              </View>
              <Text className="text-textDarkGray text-xl font-medium">
                {userData?.userName}
              </Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <View className="mb-6">
            <PrimaryButton
              heading="Edit Profile"
              icon={<FontAwesome name="pencil" size={24} color="#111111" />}
              routingPath={"/(settings)/editProfile" as RelativePathString}
            />
          </View>

          {/* Member Since Card */}
          <View className="mb-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <Text className="text-textDark text-lg font-semibold mb-4">
              Member Since
            </Text>
            <View className="flex flex-row items-center">
              <View className="w-14 h-14 bg-containerBg rounded-2xl flex items-center justify-center mr-4 shadow-sm">
                <Image
                  className="w-12 h-12"
                  source={require("../../assets/images/logo_spash_screen.png")}
                />
              </View>
              <Text className="text-textDark text-lg font-medium">
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Date not available"}
              </Text>
            </View>
          </View>

          {/* Friends Section */}
          <TouchableOpacity 
            onPress={() => router.push("/(screens)/friends")}
            className="mb-6"
          >
            <View className="flex flex-row justify-between items-center bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <View className="flex flex-row items-center">
                <View className="w-12 h-12 bg-iconGreen/10 rounded-2xl flex items-center justify-center mr-4">
                  <Ionicons name="people" size={20} color="#10B981" />
                </View>
                <Text className="text-textDark text-lg font-semibold">
                  Your Friends
                </Text>
              </View>
              <View className="w-10 h-10 bg-containerBg rounded-2xl flex items-center justify-center">
                <AntDesign name="arrowright" size={20} color="#6B7280" />
              </View>
            </View>
          </TouchableOpacity>


          {/* //! addoptimistic updates */}
          <TouchableOpacity
            onPress={() => router.push("/(screens)/editNote")}
            className="mb-8"
          >
            <View className="flex flex-row items-center justify-between bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <View className="flex-1 flex flex-row items-center">
                <View className="w-12 h-12 bg-sessionBlue/10 rounded-2xl flex items-center justify-center mr-4">
                  <FontAwesome name="sticky-note-o" size={18} color="#3B82F6" />
                </View>
                <Text
                  className={`flex-1 text-lg font-medium ${
                    userData?.note ? "text-textBlack" : "text-textGray"
                  }`}
                  numberOfLines={2}
                >
                  {userData?.note ? userData.note : "Add a personal note (only visible to you)"}
                </Text>
              </View>
              <View className="w-10 h-10 bg-containerBg rounded-2xl flex items-center justify-center ml-3">
                <AntDesign name="arrowright" size={20} color="#6B7280" />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}