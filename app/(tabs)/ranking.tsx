import { mockUserData } from "@/mockData/mocks";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RankingScreen() {
  const router = useRouter();

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

  return (
    <>
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
                    ? "bg-accent"
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
                    ? "bg-accent"
                    : "bg-lightSurface border border-lightMutedText"
                }`}
              >
                <Text
                  className={`font-anybodyBold ${
                    leaderboardTab === "global" ? "text-darkText" : "text-muted"
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
                  <Text className="text-accent font-anybodyBold text-lg">
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
        )}
      </View>
    </>
  );
}

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
