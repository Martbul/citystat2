import {
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { RelativePathString, useRouter } from "expo-router";
import { useUserData } from "@/Providers/UserDataProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "@/components/ui/primaryButton";
import { useState, useCallback } from "react";

export default function ProfileScreen() {
  const { userData, isLoading, refreshUserData } = useUserData();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

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
      <SafeAreaView>
        <View>
          <Text className="text-gray-100">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <View className="flex flex-col h-screen bg-lightBackground">
        <StatusBar barStyle="light-content" backgroundColor="#c9c9c9ff" />

        <View className="flex flex-row items-center justify-end gap-3 items-center px-4 pt-8 pb-9 bg-lightNeutralGray">
          {/* <TouchableOpacity  className="flex justify-center items-center w-10 h-10 bg-lightContainerBg rounded-full my-4">
            <FontAwesome5 name="store" size={18} color="white" />
          </TouchableOpacity> */}

          <TouchableOpacity
            className="flex justify-center items-center w-10 h-10 bg-lightContainerBg rounded-full"
            onPress={() => router.push("/(settings)/settings")}
          >
            <Ionicons name="settings" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="absolute top-20 left-4 z-10">
          <View className="relative">
            <View className="w-28 h-28 bg-lightSurface rounded-full flex items-center justify-center">
              <Image
                className="w-28 h-28"
                source={{ uri: userData?.imageUrl }}
              ></Image>
            </View>

            {/* 
         //TODO: v2 add the light
         <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-lightSecondaryAccent rounded-full border-2 border-lightSurface"></View> */}
          </View>
        </View>

        {/* 
      //TODO: v2 add the status
      <View className="absolute top-44 left-36 z-10">
        <TouchableOpacity className="bg-lightContainerBg px-3 py-2 rounded-full flex flex-row items-center gap-1">
          <Feather name="plus" size={16} color="white" />
          <Text className="text-white text-sm">Add Status</Text>
        </TouchableOpacity>
      </View> */}

        <ScrollView
          className="flex-1 px-4 pb-20"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#your-primary-color"]} // Android
              tintColor="#your-primary-color" // iOS
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-20">
            <Text className="text-lightPrimaryText text-3xl font-bold mb-1">
              {userData?.firstName} {userData?.lastName}
            </Text>
            <View className="flex flex-row items-center gap-1">
              <View className="w-6 h-6 bg-lightSecondaryAccent rounded  flex items-center justify-center">
                <Feather name="hash" size={16} color="white" />
              </View>
              <Text className="text-lightNeutralGray text-lg">
                {userData?.userName}
              </Text>
            </View>
          </View>

          <PrimaryButton
            heading="Edit Profile"
            icon={<FontAwesome name="pencil" size={24} color="#111111" />}
            routingPath={"/(settings)/editProfile" as RelativePathString}
          />

          <View className="mt-6 bg-lightSurface rounded-xl p-4 border border-lightMutedText">
            <Text className="text-lightNeutralGray text-lg font-medium mb-3">
              Member Since
            </Text>
            <View className="flex flex-row items-center">
              <View className="w-10 h-10 rounded flex items-center justify-center mr-3">
                <Image
                  className="w-16 h-16 text-lightPrimaryText text-sm"
                  source={require("../../assets/images/logo_spash_screen.png")}
                ></Image>
              </View>
              <Text className="text-lightPrimaryText text-lg">
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

          <TouchableOpacity onPress={() => router.push("/(screens)/friends")}>
            <View className="flex flex-row justify-between items-center mt-6 bg-lightSurface rounded-xl p-4 border border-lightMutedText">
              <Text className="text-lightNeutralGray text-lg font-medium">
                Your Friends
              </Text>
              <View className="flex items-center">
                <AntDesign name="arrowright" size={24} color="#111111" />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(screens)/editNote")}
            className="flex flex-row w-full mt-6 bg-lightSurface rounded-xl p-4 items-center justify-between mb-6 border border-lightMutedText"
          >
            <Text
              className={`text-lg ${
                userData?.note ? "text-neutral-800" : "text-lightNeutralGray"
              }`}
            >
              {userData?.note ? userData.note : "Note (only visible to you)"}
            </Text>

            <FontAwesome name="sticky-note-o" size={24} color="#111111" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
