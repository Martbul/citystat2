import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
  Image,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Fontisto from "@expo/vector-icons/Fontisto";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSideMenusDrawer } from "@/Providers/SideMenuDrawerProvider";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserData } from "@/Providers/UserDataProvider";
import SideMenuDrawer from "@/components/drawers/SideMenuDrawer";
import { logEvent } from "@/utils/logger";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  const { isSideMenuDrawerOpen, setIsSideMenuDrawerOpen } =
    useSideMenusDrawer();
  const { isSignedIn, isLoaded, user } = useUser();
  const { userData, refreshUserData } = useUserData();
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("refreshing user data");
    refreshUserData();
  }, []);

  const openDrawer = () => {
    setIsSideMenuDrawerOpen(true);
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
        toValue: -screenWidth * 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSideMenuDrawerOpen(false);
    });
  };

  if (!isLoaded) {
    return null;
  }
  if (!isSignedIn) {
    return null;
  }

  if (isSignedIn) {
    // logEvent("User signed in", { userId: user.id });
    console.log("User is signed in: " + user.id);
    console.log("refreshing user data");
  }

  if (userData && userData.completedTutorial === false) {
    router.replace("/tutorial");
  }

  const sections = [
    { id: "header", type: "header" },
    { id: "tabs", type: "tabs" },
    { id: "content", type: "content" },
  ];

  const renderSection = ({ item }: { item: any }) => {
    if (item.type === "header") {
      return (
        <SafeAreaView >
          <StatusBar  backgroundColor="bg-lightNeutralGray" />
          <View className=" px-4 pb-9 rounded-b-2xl">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={openDrawer} className="mr-4 mt-1">
                <Entypo name="menu" size={26} color="#333333" />
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TouchableOpacity className="w-10 h-10 bg-lightContainerBg rounded-full justify-center items-center">
                  <Fontisto name="search" size={18} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-10 h-10 bg-lightContainerBg rounded-full justify-center items-center"
                  onPress={() => router.push("/(screens)/notifications")}
                >
                  <MaterialIcons
                    name="notifications-active"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-5">
              <View className="flex-row justify-between">
                <StatCard
                  title="Total"
                  value="847.3"
                  subtitle="km"
                  icon={
                    <FontAwesome5 name="walking" size={18} color="#c8f751" />
                  }
                />
                <StatCard
                  title="Coverage"
                  value="23.7%"
                  subtitle="Sofia"
                  icon={
                    <MaterialIcons name="explore" size={20} color="#c8f751" />
                  }
                />
                <StatCard
                  title="Active"
                  value="156"
                  subtitle="2025"
                  icon={<AntDesign name="calendar" size={20} color="#c8f751" />}
                />
              </View>
            </View>
          </View>

          {/* THIS IS THE VIEW THAT NEED TO */}
          <View className="flex flex-row justify-between items-center px-4">
            <View className="justify-center">
              <View className="mb-2">
                <MaterialCommunityIcons name="gold" size={24} color="black" />
                <Text>0 Gold</Text>
              </View>
              <View className=" mb-2">
                <FontAwesome5 name="gem" size={24} color="black" />
                <Text>0 Gems</Text>
              </View>
              <View>
                <FontAwesome5 name="old-republic" size={24} color="black" />
                <Text>0 Artifacts</Text>
              </View>

              <View>
                <MaterialCommunityIcons
                  name="crystal-ball"
                  size={24}
                  color="black"
                />
                <Text>0 Magic</Text>
              </View>
            </View>
            <View>
              <Image
                className="w-28 h-28"
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/langfr-250px-Ethereum-icon-purple.svg.png",
                }}
              ></Image>
            </View>

            <View>
              <View>
                <MaterialCommunityIcons name="sword" size={24} color="black" />
                <Text>0 Strenght</Text>
              </View>

              <View>
                <FontAwesome5 name="chess-king" size={24} color="black" />
                <Text>0 Influence</Text>
              </View>
              <View>
                <FontAwesome5 name="ethereum" size={24} color="black" />
                <Text>0 Runes</Text>
              </View>
              <View>
                <MaterialCommunityIcons
                  name="lightning-bolt-outline"
                  size={24}
                  color="black"
                />
                <Text>0 Energy</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-containerBg">
      {isSideMenuDrawerOpen && (
        <SideMenuDrawer
          isSideMenuDrawerOpen={isSideMenuDrawerOpen}
          slideAnim={slideAnim}
          overlayOpacity={overlayOpacity}
          closeDrawer={closeDrawer}
        />
      )}

      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: any;
}) => (
  <View className="w-[28%] h-32">
    <View className="flex-1 rounded-2xl p-4 bg-lightContainerBg border border-lightMutedText">
      <View className="justify-between h-full">
        <View className="flex-row justify-between items-center">
          <Text className="text-lightMutedText font-anybody text-xs">
            {title}
          </Text>
          {icon}
        </View>
        <Text className="text-white font-anybodyBold text-2xl mt-1">
          {value}
        </Text>
        {subtitle && (
          <Text className="text-lightMutedText text-[11px] mt-1 font-anybody">
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  </View>
);
