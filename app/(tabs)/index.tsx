
import React, { useRef, useState } from "react";
import {
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Fontisto from "@expo/vector-icons/Fontisto";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import { cn } from "@/utils/cn";
import { useSettingsContext } from "@/Providers/SettingsProvider";
import { useSideMenusDrawer } from "@/Providers/SideMenuDrawerProvider";
import SideMenuDrawer from "@/components/ui/drawers/SideMenuDrawer";
import { useUser } from "@clerk/clerk-expo";
import { mockUserData } from "@/mockData/mocks";
import { Link } from "expo-router";
const { width: screenWidth } = Dimensions.get("window");
const { width } = Dimensions.get("window");


export default function HomeScreen() {
  const { isSideMenuDrawerOpen, setIsSideMenuDrawerOpen } = useSideMenusDrawer();
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("friends");
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [selectedTab, setSelectedTab] = useState<string>("General");

  const { settings, updateTheme } = useSettingsContext();
  const theme = settings?.theme ?? "light";
  console.log(theme);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log("Toggling theme to:", newTheme);
    updateTheme(newTheme);
  };



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
         toValue: -screenWidth * 0.80,
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

  //TODO: sett the theme swwithcing intop settings and make a db call to save it


 if (!isLoaded) {
   // Hand state
   return null;
 }
 if (!isSignedIn) {
   // Handle signed out state
   return null;
 }
  return (
    <SafeAreaView
      className={cn("flex-1", theme === "dark" ? "bg-bddc62" : "bg-background")}
    >
      {isSideMenuDrawerOpen && (
        <SideMenuDrawer
          isSideMenuDrawerOpen={isSideMenuDrawerOpen}
          slideAnim={slideAnim}
          overlayOpacity={overlayOpacity}
          closeDrawer={closeDrawer}
        />
      )}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="bg-lightNeutralGray px-5 pt-12 pb-9 rounded-2xl">
          {/* Header Top */}
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={openDrawer} className="mr-4 mt-1">
              <Entypo name="menu" size={26} color="#333333" />
            </TouchableOpacity>

            <View className="flex-row gap-2">
              <TouchableOpacity className="w-10 h-10 bg-lightContainerBg rounded-full justify-center items-center">
                <Fontisto name="search" size={18} color="white" />
              </TouchableOpacity>
            

                <Link href="/(screens)/notifications">
                    <View className="w-10 h-10 bg-lightContainerBg rounded-full justify-center items-center">

                  <MaterialIcons
                    name="notifications-active"
                    size={20}
                    color="white"
                  />
</View>

                </Link>
                
              
           

              <TouchableOpacity className="w-10 h-10 bg-lightContainerBg rounded-full justify-center items-center">
                <Feather name="user" size={20} color="white" />
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

        <View className="bg-lightSurface">
          <View className="flex ">
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

              <TouchableOpacity onPress={() => setSelectedTab("Friends")}>
                <Text
                  className={`${
                    selectedTab === "Friends" ? "font-bold" : "font-medium"
                  } text-lightBlackText text-base`}
                >
                  Friends
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
          <View className="px-5 py-4">
            {selectedTab === "General" && (
              <View>
                <Text>GENERAL</Text>
              </View>
            )}
            {selectedTab === "Friends" && (
              <View>
                <View className="flex-row bg-white dark:bg-darkSurface rounded-xl p-1 mb-5 shadow-sm">
                  <TouchableOpacity
                    className={cn(
                      "flex-1 py-3 rounded-lg items-center",
                      activeTab === "friends" ? "bg-accent" : ""
                    )}
                    onPress={() => setActiveTab("friends")}
                  >
                    <Text
                      className={cn(
                        "font-anybody text-sm",
                        activeTab === "friends" ? "text-white" : "text-muted"
                      )}
                    >
                      Friends
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={cn(
                      "flex-1 py-3 rounded-lg items-center",
                      activeTab === "leaderboard" ? "bg-accent" : ""
                    )}
                    onPress={() => setActiveTab("leaderboard")}
                  >
                    <Text
                      className={cn(
                        "font-anybody text-sm",
                        activeTab === "leaderboard"
                          ? "text-white"
                          : "text-muted"
                      )}
                    >
                      Global Leaderboard
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Content based on tab */}
                {activeTab === "friends" ? (
                  <View className="bg-white dark:bg-darkSurface p-5 rounded-xl shadow">
                    <Text className="font-anybodyBold text-lg text-text dark:text-darkText mb-4">
                      Friends Activity
                    </Text>
                    {/* map through friend cards here */}
                  </View>
                ) : (
                  <View className="bg-white dark:bg-darkSurface p-5 rounded-xl shadow">
                    <Text className="font-anybodyBold text-lg text-text dark:text-darkText mb-4">
                      Top Global Walkers
                    </Text>
                    {/* map through leaderboard cards here */}
                  </View>
                )}

                <View style={styles.socialContainer}>
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTab === "friends" && styles.activeTab,
                      ]}
                      onPress={() => setActiveTab("friends")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "friends" && styles.activeTabText,
                        ]}
                      >
                        Friends
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTab === "leaderboard" && styles.activeTab,
                      ]}
                      onPress={() => setActiveTab("leaderboard")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "leaderboard" && styles.activeTabText,
                        ]}
                      >
                        Global Leaderboard
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
        </View>
      </ScrollView>
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



 const FriendCard = ({ friend }:{friend:any}) => (
   <TouchableOpacity style={styles.friendCard}>
     <View style={styles.friendInfo}>
       <Text style={styles.friendAvatar}>{friend.avatar}</Text>
       <View style={styles.friendDetails}>
         <Text style={styles.friendName}>{friend.name}</Text>
         <Text style={styles.friendCity}>{friend.city}</Text>
       </View>
     </View>
     <View style={styles.friendStats}>
       <Text style={styles.friendKm}>{friend.kilometers} km</Text>
     </View>
   </TouchableOpacity>
 );


 

  const LeaderboardCard = ({ entry }:{entry:any}) => (
    <View style={styles.leaderboardCard}>
      <View style={styles.leaderboardRank}>
        <Text style={styles.rankNumber}>#{entry.rank}</Text>
      </View>
      <View style={styles.leaderboardInfo}>
        <Text style={styles.leaderboardName}>{entry.name}</Text>
        <Text style={styles.leaderboardLocation}>
          {entry.city}, {entry.country}
        </Text>
      </View>
      <Text style={styles.leaderboardKm}>{entry.kilometers} km</Text>
    </View>
  );



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 50,
    backgroundColor: "#29B6F6",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  welcomeText: {
    fontSize: 16,
    color: "#E0E7FF",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userLocation: {
    fontSize: 14,
    color: "#E0E7FF",
    marginLeft: 4,
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 30,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: (width - 52) / 2,
    height: 120,
  },

  statCardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
 

  
  
  fullWidthStatCard: {
    height: 100,
    marginTop: 8,
  },
  fullWidthGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fullWidthContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fullWidthLeft: {
    flex: 1,
  },
  fullWidthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 4,
  },
  fullWidthValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  fullWidthSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 4,
  },
  fullWidthRight: {
    alignItems: "flex-end",
  },
  fullWidthSecondary: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 4,
  },
  socialContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#29B6F6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  friendsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  friendAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  friendCity: {
    fontSize: 14,
    color: "#64748B",
  },
  friendStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendKm: {
    fontSize: 14,
    fontWeight: "600",
    color: "#29B6F6",
    marginRight: 8,
  },
  leaderboardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leaderboardCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  leaderboardRank: {
    width: 40,
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#26C6DA",
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  leaderboardLocation: {
    fontSize: 14,
    color: "#64748B",
  },
  leaderboardKm: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
});