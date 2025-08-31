import {
  Card,
  GradientHeader,
  HeaderButton,
  MutedText,
  PageContainer,
  PageTitle,
  RowLayout,
  SectionSpacing,
  SectionTitle,
} from "@/components/dev";
import { AchievementBadge } from "@/components/rankAchivementBadge";
import { RankBadge } from "@/components/rankBadge";
import { LeaderboardItem } from "@/components/rankingLeaderboard";
import { RankLevelCard } from "@/components/rankLevelCard";
import { RankProgressBar } from "@/components/rankProgressBar";
import { RankStatCard } from "@/components/rankStatCard";
import { useUserData } from "@/Providers/UserDataProvider";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RankingScreen() {
  const router = useRouter();
  const {
    userData,
    isLoading,
    fetchRank,
    fetchRankProgress,
    fetchLeaderboard,
  } = useUserData();

  const [selectedTab, setSelectedTab] = useState<string>("General");

  const [leaderboard, setLeaderboard] = useState();

  const [leaderboardTab, setLeaderbardTab] = useState<"friends" | "global">(
    "friends"
  );

  useEffect(() => {
    const fetchings = async () => {
      try {
        const [rankRes, rankProgressRes, leaderboardRes] = await Promise.all([
          fetchRank(),
          fetchRankProgress(),
          fetchLeaderboard(),
        ]);
        console.log("Rank:", rankRes);
        console.log("Rank Progress:", rankProgressRes);
        console.log("Leaderboard:", leaderboardRes);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      }
    };
    fetchings();
  }, [userData]);

  const stats = {
    totalXP: 15750,
    challengesCompleted: 127,
    averageScore: 87.3,
    streak: 12,
    timeSpent: "48h 23m",
    rank: 7,
  };

  const currentUser = {
    id: "current",
    name: "You",
    level: "Gold Elite",
    title: "Rising Star",
    points: 15750,
    avatar: null,
    rank: 7,
  };

  const leaderboardData = [
    {
      id: "1",
      name: "Alex Chen",
      level: "Diamond",
      title: "Champion",
      points: 25890,
      avatar: null,
    },
    {
      id: "2",
      name: "Sarah Kim",
      level: "Diamond",
      title: "Master",
      points: 24100,
      avatar: null,
    },
    {
      id: "3",
      name: "Mike Johnson",
      level: "Platinum",
      title: "Expert",
      points: 22750,
      avatar: null,
    },
    {
      id: "4",
      name: "Emma Davis",
      level: "Platinum",
      title: "Pro",
      points: 20300,
      avatar: null,
    },
    {
      id: "5",
      name: "Chris Wilson",
      level: "Gold Elite",
      title: "Veteran",
      points: 18900,
      avatar: null,
    },
    {
      id: "6",
      name: "Lisa Brown",
      level: "Gold Elite",
      title: "Skilled",
      points: 16800,
      avatar: null,
    },
    currentUser,
    {
      id: "8",
      name: "Tom Garcia",
      level: "Gold",
      title: "Achiever",
      points: 14200,
      avatar: null,
    },
  ];


  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-containerBg">
        <View className="flex-1 justify-center items-center">
          <Text className="text-textDarkGray text-lg">
            Loading leaderboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <PageContainer className="px-6 pt-8">
      <SectionSpacing className="my-4">
        <PageTitle>Leaderboard</PageTitle>
        <RowLayout>
          <RankBadge rank={currentUser.rank} size="small" />
          <MutedText className="ml-2">Your current rank</MutedText>
        </RowLayout>
      </SectionSpacing>

      <ScrollView>
        {leaderboardData.map((user, index) => (
          <LeaderboardItem
            key={user.id}
            user={user}
            rank={index + 1}
            isCurrentUser={user.id === "current"}
          />
        ))}
      </ScrollView>

      
    </PageContainer>
  );
}
