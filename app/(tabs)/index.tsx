import { Image } from "expo-image";
import { Platform, StyleSheet, Text, View } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

//achivements
//stats
//tsks
//friends stats
//leaderboard
//quests

// export default function HomeScreen() {
//   const { isSignedIn } = useAuth();

//   if (!isSignedIn) {
//     return <Redirect href={"/(tutorial)/tutorial"} />;
//   }
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
//       headerImage={
//         <Image
//           source={require("@/assets/images/partial-react-logo.png")}
//           style={styles.reactLogo}
//         />
//       }
//     >
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Welcome!</ThemedText>
//         <HelloWave />
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 1: Try it</ThemedText>
//         <ThemedText>
//           Edit{" "}
//           <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
//           to see changes. Press{" "}
//           <ThemedText type="defaultSemiBold">
//             {Platform.select({
//               ios: "cmd + d",
//               android: "cmd + m",
//               web: "F12",
//             })}
//           </ThemedText>{" "}
//           to open developer tools.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 2: Explore</ThemedText>
//         <ThemedText>
//           {`Tap the Explore tab to learn more about what's included in this starter app.`}
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
//         <ThemedText>
//           {`When you're ready, run `}
//           <ThemedText type="defaultSemiBold">
//             npm run reset-project
//           </ThemedText>{" "}
//           to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
//           directory. This will move the current{" "}
//           <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
//           <ThemedText type="defaultSemiBold">app-example</ThemedText>.
//         </ThemedText>
//       </ThemedView>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: "absolute",
//   },
// });
import React, { useState } from "react";
import {
 
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";

const { width } = Dimensions.get("window");

// Mock user data
const mockUserData = {
  name: "Alex Petrov",
  city: "Sofia, Bulgaria",
  totalKilometers: 847.3,
  cityPercentageCovered: 23.7,
  daysActive: 156,
  longestActiveStreak: 21,
  streetsWalkedThisYear: 284,
  currentStreak: 7,
  averageDaily: 5.4,
  favoriteDistrict: "Center",
};

// Mock friends data
const mockFriendsData = [
  {
    id: 1,
    name: "Maria Ivanova",
    kilometers: 923.1,
    city: "Sofia",
    avatar: "👩‍🦰",
  },
  {
    id: 2,
    name: "Georgi Stoyanov",
    kilometers: 756.8,
    city: "Sofia",
    avatar: "👨‍💼",
  },
  {
    id: 3,
    name: "Elena Dimitrova",
    kilometers: 645.2,
    city: "Plovdiv",
    avatar: "👩‍🎨",
  },
  {
    id: 4,
    name: "Nikola Petrov",
    kilometers: 589.4,
    city: "Varna",
    avatar: "👨‍🎓",
  },
];

// Mock world leaderboard data
const mockWorldLeaderboard = [
  {
    id: 1,
    name: "Tokyo Walker",
    kilometers: 2847.6,
    city: "Tokyo",
    country: "Japan",
    rank: 1,
  },
  {
    id: 2,
    name: "NYC Explorer",
    kilometers: 2634.3,
    city: "New York",
    country: "USA",
    rank: 2,
  },
  {
    id: 3,
    name: "London Strider",
    kilometers: 2456.8,
    city: "London",
    country: "UK",
    rank: 3,
  },
  {
    id: 4,
    name: "Berlin Wanderer",
    kilometers: 2234.5,
    city: "Berlin",
    country: "Germany",
    rank: 4,
  },
  {
    id: 5,
    name: "Paris Promenader",
    kilometers: 2156.7,
    city: "Paris",
    country: "France",
    rank: 5,
  },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("friends");

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    backgroundColor,
    textColor = "#FFFFFF",
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statCardGradient, { backgroundColor }]}>
        <View style={styles.statCardContent}>
          <View style={styles.statCardHeader}>
            <Text style={[styles.statCardTitle, { color: textColor }]}>
              {title}
            </Text>
            {icon}
          </View>
          <Text style={[styles.statCardValue, { color: textColor }]}>
            {value}
          </Text>
          {subtitle && (
            <Text style={[styles.statCardSubtitle, { color: textColor }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const FriendCard = ({ friend }) => (
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
        <MaterialIcons name="arrow-forward-ios" size={16} color="#29B6F6" />
      </View>
    </TouchableOpacity>
  );

  const LeaderboardCard = ({ entry }) => (
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{mockUserData.name}</Text>
              <View style={styles.locationContainer}>
                <Entypo name="location-pin" size={16} color="#E0E7FF" />
                <Text style={styles.userLocation}>{mockUserData.city}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <MaterialIcons name="account-circle" size={40} color="#E0E7FF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Distance"
              value={`${mockUserData.totalKilometers} km`}
              subtitle="This year"
              icon={<FontAwesome5 name="walking" size={20} color="#FFFFFF" />}
              backgroundColor="#26C6DA"
            />
            <StatCard
              title="City Coverage"
              value={`${mockUserData.cityPercentageCovered}%`}
              subtitle="of Sofia explored"
              icon={<MaterialIcons name="explore" size={20} color="#FFFFFF" />}
              backgroundColor="#4DD0E1"
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Days Active"
              value={mockUserData.daysActive}
              subtitle="This year"
              icon={<AntDesign name="calendar" size={20} color="#FFFFFF" />}
              backgroundColor="#42A5F5"
            />
            <StatCard
              title="Longest Streak"
              value={`${mockUserData.longestActiveStreak} days`}
              subtitle={`Current: ${mockUserData.currentStreak} days`}
              icon={
                <MaterialIcons
                  name="local-fire-department"
                  size={20}
                  color="#FFFFFF"
                />
              }
              backgroundColor="#4FC3F7"
            />
          </View>

          <View style={styles.fullWidthStatCard}>
            <View
              style={[styles.fullWidthGradient, { backgroundColor: "#29B6F6" }]}
            >
              <View style={styles.fullWidthContent}>
                <View style={styles.fullWidthLeft}>
                  <Text style={styles.fullWidthTitle}>Streets Explored</Text>
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

        {/* Social Section */}
        <View style={styles.socialContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "friends" && styles.activeTab]}
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

          {activeTab === "friends" ? (
            <View style={styles.friendsContainer}>
              <Text style={styles.sectionTitle}>Friends Activity</Text>
              {mockFriendsData.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </View>
          ) : (
            <View style={styles.leaderboardContainer}>
              <Text style={styles.sectionTitle}>Top Global Walkers</Text>
              {mockWorldLeaderboard.map((entry) => (
                <LeaderboardCard key={entry.id} entry={entry} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  statCardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.9,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statCardSubtitle: {
    fontSize: 12,
    opacity: 0.8,
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