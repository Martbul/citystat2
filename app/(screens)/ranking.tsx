import {
  Card,
  PageContainer,
  SectionSpacing,
  SectionTitle,
} from "@/components/dev";
import Header from "@/components/header";
import { RankLevelCard } from "@/components/rankLevelCard";
import { RankProgressBar } from "@/components/rankProgressBar";
import { RankStatCard } from "@/components/rankStatCard";
import Spinner from "@/components/spinner";
import { useUserData } from "@/Providers/UserDataProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, View } from "react-native";

const stats = {
  totalXP: 15750,
  challengesCompleted: 127,
  averageScore: 87.3,
  streak: 12,
  timeSpent: "48h 23m",
  rank: 7,
};

interface rankProgres {
  currentLevel: string;
  currentLevelThreshold: number;
  currentPoints: number;
  nextLevel: string;
  nextLevelThreshold: number;
  pointsToNextLevel: number;
  progressPercentage: number;
}

export default function Ranking() {
  const router = useRouter();
  const {
    userData,
    isLoading,
    fetchRank,
    fetchRankProgress,
    fetchLeaderboard,
  } = useUserData();

  const [rank, setRank] = useState();
  const [rankProgress, setRankProgress] = useState<rankProgres | null>();
  const [leaderboard, setLeaderboard] = useState();

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

        setRank(rankRes);
        setRankProgress(rankProgressRes);
        setLeaderboard(leaderboardRes);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      }
    };
    fetchings();
  }, [userData]);

  if (isLoading || !rankProgress || !leaderboard) {
    return (
      <SafeAreaView className="flex-1 bg-containerBg">
        <View className="flex-1 justify-center items-center">
          <Spinner variant="orbital" />

          <Text className="text-textDarkGray text-lg">
            Loading user ranking...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <PageContainer>
      <StatusBar barStyle="light-content" backgroundColor="#fafafa" />

      <Header title="Rankings" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-2 gap-2">
          <SectionSpacing>
            <RankLevelCard
              currentLevel={rankProgress.currentLevel}
              nextLevel={rankProgress.nextLevel}
              currentPoints={rankProgress.currentPoints}
              pointsToNextLevel={rankProgress.pointsToNextLevel}
            />
          </SectionSpacing>

          <SectionSpacing>
            <SectionTitle>Your Statistics</SectionTitle>

            <View className="gap-4">
              <View className="flex flex-row gap-3">
                <RankStatCard
                  title="Total Points"
                  value={rankProgress.currentPoints}
                  icon="star"
                  color="accent"
                  //   trend={{ value: 12, isPositive: true }}
                />
                <RankStatCard
                  title="Global Rank"
                  value={`#${leaderboard?.currentUser.rank}`}
                  icon="leaderboard"
                  color="blue"
                  trend={{ value: 3, isPositive: true }}
                />
              </View>

              <View className="flex flex-row gap-3">
                <RankStatCard
                  title="Challenges"
                  value={stats.challengesCompleted}
                  icon="assignment-turned-in"
                  color="green"
                />
                <RankStatCard
                  title="Average Score"
                  value={`${stats.averageScore}%`}
                  icon="trending-up"
                  color="neutral"
                />
              </View>

              <View className="flex flex-row gap-3">
                <RankStatCard
                  title="Current Streak"
                  value={`${stats.streak} days`}
                  icon="local-fire-department"
                  color="red"
                />
                <RankStatCard
                  title="Time Spent"
                  value={stats.timeSpent}
                  icon="schedule"
                  color="neutral"
                />
              </View>
            </View>

            <Card className="mt-4">
              <SectionTitle className="mb-3">Weekly Performance</SectionTitle>
              <RankProgressBar
                progress={78}
                color="green"
                label="This Week vs Last Week"
              />
              <View className="mt-4 p-3 bg-iconGreen/5 rounded-xl">
                <Text className="text-iconGreen font-semibold text-center">
                  Great progress! You're 22% more active this week
                </Text>
              </View>
            </Card>
          </SectionSpacing>
        </View>
      </ScrollView>
    </PageContainer>
  );
}
