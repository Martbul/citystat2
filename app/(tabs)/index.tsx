import React, { useRef, useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  FlatList,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Fontisto from "@expo/vector-icons/Fontisto";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import { cn } from "@/utils/cn";
import { useSideMenusDrawer } from "@/Providers/SideMenuDrawerProvider";
import SideMenuDrawer from "@/components/ui/drawers/SideMenuDrawer";
import { useUser } from "@clerk/clerk-expo";
import { mockUserData } from "@/mockData/mocks";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";


const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  const { isSideMenuDrawerOpen, setIsSideMenuDrawerOpen } =
    useSideMenusDrawer();
  const { isSignedIn, isLoaded } = useUser();
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [selectedTab, setSelectedTab] = useState<string>("General");
  const [leaderboardTab, setLeaderbardTab] = useState<"friends" | "global">(
    "friends"
  );

  const mockData = {
    friends: [
      { id: "1", name: "Alice", score: 1200 },
      { id: "2", name: "Bob", score: 1100 },
      { id: "3", name: "Carol", score: 980 },
    ],
    global: [
      { id: "1", name: "PlayerOne", score: 2200 },
      { id: "2", name: "GamerDude", score: 1980 },
      { id: "3", name: "ProMax", score: 1750 },
      { id: "4", name: "didpsdf", score: 190 },
      { id: "5", name: "dfds", score: 17 },
    ],
  };

  const data = mockData[leaderboardTab];

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

  const sections = [
    { id: "header", type: "header" },
    { id: "tabs", type: "tabs" },
    { id: "content", type: "content" },
  ];

  const renderSection = ({ item }:{item:any}) => {
    if (item.type === "header") {
      return (
        <View className="bg-lightNeutralGray px-4 pt-12 pb-9 rounded-b-2xl">
          {/* Header Top */}
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
                icon={<FontAwesome5 name="walking" size={18} color="#c8f751" />}
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
      );
    }

    if (item.type === "tabs") {
      return (
        <View className="bg-lightSurface">
          <View className="flex-row gap-2 justify-evenly items-center p-4">
            <TouchableOpacity onPress={() => setSelectedTab("General")}>
              <Text
                className={`${
                  selectedTab === "General" ? "font-bold" : "font-medium"
                } text-lightBlackText text-base`}
              >
                General
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedTab("Leaderboard")}>
              <Text
                className={`${
                  selectedTab === "Leaderboard" ? "font-bold" : "font-medium"
                } text-lightBlackText text-base`}
              >
                Leaderboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedTab("Other")}>
              <Text
                className={`${
                  selectedTab === "Other" ? "font-bold" : "font-medium"
                } text-lightBlackText text-base`}
              >
                Other
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.type === "content") {
      return (
        <View className="bg-lightSurface px-5 py-4 flex-1">
          {selectedTab === "General" && (
            <View>
              <Text>GENERAL</Text>
            </View>
          )}

          {selectedTab === "Leaderboard" && (
            <View className="flex-1">
              <View className="flex-row justify-center space-x-4 mb-4">
                <TouchableOpacity
                  onPress={() => setLeaderbardTab("friends")}
                  className={`px-4 py-2 rounded-full ${
                    leaderboardTab === "friends"
                      ? "bg-lightSecondaryAccent"
                      : "bg-lightSurface border border-lightMutedText"
                  }`}
                >
                  <Text
                    className={`font-anybodyBold ${
                      leaderboardTab === "friends"
                        ? "text-darkText"
                        : "text-muted"
                    }`}
                  >
                    Friends
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setLeaderbardTab("global")}
                  className={`px-4 py-2 rounded-full ${
                    leaderboardTab === "global"
                      ? "bg-lightSecondaryAccent"
                      : "bg-lightSurface border border-lightMutedText"
                  }`}
                >
                  <Text
                    className={`font-anybodyBold ${
                      leaderboardTab === "global"
                        ? "text-darkText"
                        : "text-muted"
                    }`}
                  >
                    Global
                  </Text>
                </TouchableOpacity>
              </View>

              {data.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push("/(screens)/userProfile")}
                >
                  <View className="flex-row justify-between items-center px-4 py-3 bg-surface rounded-xl mb-2">
                    <Text className="text-lightBlackText font-anybodyBold text-lg">
                      #{index + 1} {item.name}
                    </Text>
                    <Text className="text-lightSecondaryAccent font-anybodyBold text-lg">
                      {item.score}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedTab === "Other" && (
            <View>
              <View style={styles.fullWidthStatCard}>
                <View
                  style={[
                    styles.fullWidthGradient,
                    { backgroundColor: "#29B6F6" },
                  ]}
                >
                  <View style={styles.fullWidthContent}>
                    <View style={styles.fullWidthLeft}>
                      <Text style={styles.fullWidthTitle}>
                        Streets Explored
                      </Text>
                      <Text style={styles.fullWidthValue}>
                        {mockUserData.streetsWalkedThisYear}
                      </Text>
                      <Text style={styles.fullWidthSubtitle}>
                        in {mockUserData.city}
                      </Text>
                    </View>
                    <View style={styles.fullWidthRight}>
                      <Text style={styles.fullWidthSecondary}>
                        Avg. Daily: {mockUserData.averageDaily} km
                      </Text>
                      <Text style={styles.fullWidthSecondary}>
                        Favorite: {mockUserData.favoriteDistrict}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className={cn("flex-1 bg-bddc62")}>
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

const StatCard = ({
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

const styles = StyleSheet.create({
  fullWidthStatCard: {
    marginBottom: 16,
  },
  fullWidthGradient: {
    borderRadius: 16,
    padding: 20,
  },
  fullWidthContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fullWidthLeft: {
    flex: 1,
  },
  fullWidthRight: {
    alignItems: "flex-end",
  },
  fullWidthTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  fullWidthValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  fullWidthSubtitle: {
    color: "#ffffff",
    fontSize: 14,
    opacity: 0.8,
  },
  fullWidthSecondary: {
    color: "#ffffff",
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 2,
  },
});
