import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useUserData } from "@/Providers/UserDataProvider";

export default function ProfileScreen() {
  const { isSignedIn } = useUser();
  const { userData, isLoading } = useUserData();
  const router = useRouter();

  if (isLoading) {
    // Handle loading state
    return null;
  }
  if (!isSignedIn) {
    // Handle signed out state
    return null;
  }

  
  return (
    <View className="flex flex-col h-screen bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#c9c9c9ff" />

      <View className="flex flex-row items-center justify-end gap-3 items-center px-4 pt-8 pb-9 bg-lightNeutralGray">
        <TouchableOpacity className="flex justify-center items-center w-10 h-10 bg-lightContainerBg rounded-full my-4">
          <FontAwesome5 name="store" size={18} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex justify-center items-center w-10 h-10 bg-lightContainerBg rounded-full"
          onPress={() => router.push("/(settings)/settings")}
        >
          <Ionicons name="settings" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View className="absolute top-20 left-4 z-10">
        <View className="relative">
          <View className="w-28 h-28 bg-lightPrimaryAccent rounded-full flex items-center justify-center">
            <Text className="text-lightPrimaryText text-xl font-bold">MB</Text>
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

      <View className="flex-1 overflow-y-auto px-4 pb-20">
        <View className="mt-20">
          <Text className="text-lightPrimaryText text-3xl font-bold mb-1">
            {userData?.firstName} {userData?.lastName}
          </Text>
          <View className="flex flex-row items-center">
            <Text className="text-lightNeutralGray text-lg">
              {userData?.userName}
            </Text>
            <View className="w-6 h-6 bg-lightSecondaryAccent rounded ml-2 flex items-center justify-center">
              <Feather name="hash" size={16} color="white" />
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="w-full bg-lightPrimaryAccent mt-6 py-3 rounded-lg flex flex-row items-center justify-center gap-2 font-semibold"
          onPress={() => router.push("/(settings)/editProfile")}
        >
          <FontAwesome name="pencil" size={24} color="#111111" />
          <Text className="text-lightPrimaryText font-semibold">
            Edit Profile
          </Text>
        </TouchableOpacity>

        <View className="mt-6 bg-lightSurface rounded-xl p-4 border border-lightMutedText">
          <Text className="text-lightNeutralGray text-lg font-medium mb-3">
            Member Since
          </Text>
          <View className="flex items-center">
            {/*//TODO : ADD YOUR LOGO*/}
            {/* <View className="w-6 h-6 bg-lightPrimaryAccent rounded flex items-center justify-center mr-3">
              <Text className="text-lightPrimaryText text-sm">D</Text>
            </View> */}
            <Text className="text-lightPrimaryText text-lg">29 Jan 2021</Text>
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
          <Text className="text-lightNeutralGray text-lg">
            {"Note (only visible to you)"}
          </Text>
          <FontAwesome name="sticky-note-o" size={24} color="#111111" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
