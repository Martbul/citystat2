import {
  CardTitle,
  ClickableCard,
  IconContainer,
  MutedText,
  PageContainer,
  PageTitle,
  RowLayout,
  SectionSpacing,
} from "@/components/dev";
import { RankBadge } from "@/components/rankBadge";
import { LeaderboardItem } from "@/components/rankingLeaderboard";
import { useUserData } from "@/Providers/UserDataProvider";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RankingScreen() {
  const { userData, isLoading, fetchGlobalLeaderboard, fetchLocalLeaderboard } =
    useUserData();

  const [globalLeaderboard, setGlobalLeaderboard] = useState();
  const [localLeaderboard, setLocalLeaderboard] = useState();
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<
    "Global" | "Local"
  >("Global");

  useEffect(() => {
    const fetchings = async () => {
      try {
        const [globalLeaderboardRes, localLeaderboardRes] = await Promise.all([
          fetchGlobalLeaderboard(),
          fetchLocalLeaderboard(),
        ]);
        console.log("Global Leaderboard:", globalLeaderboardRes);
        console.log("Local Leaderboard:", localLeaderboardRes);

        setGlobalLeaderboard(globalLeaderboardRes.leaderboard);
        setLocalLeaderboard(localLeaderboardRes.leaderboard);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      }
    };
    fetchings();
  }, [userData]);

  const handleLeaderboardSelection = () => {
    if (selectedLeaderboard === "Global") {
      setSelectedLeaderboard("Local");
    } else if (selectedLeaderboard === "Local") {
      setSelectedLeaderboard("Global");
    }
  };

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
        <PageTitle>{selectedLeaderboard} Leaderboard</PageTitle>
        <RowLayout className="flex flex-row justify-between">
          <View className="flex flex-row">
            <RankBadge rank={9} size="small" />
            <MutedText className="ml-2">Current rank</MutedText>
          </View>
          <View>
            <SectionSpacing >
              <ClickableCard arrowBoxClassName="w-7 h-7 mr-1" arrowSize={16} className="p-0" onPress={handleLeaderboardSelection}>
                <RowLayout className="py-2 px-5">
                  <CardTitle className="text-sm">
                    {selectedLeaderboard === "Global" && "Local Leaderboard"}
                    {selectedLeaderboard === "Local" && "Global Leaderboard"}
                  </CardTitle>
                </RowLayout>
              </ClickableCard>
            </SectionSpacing>
            
          </View>
        </RowLayout>
      </SectionSpacing>

      {globalLeaderboard && selectedLeaderboard === "Global" && (
        <ScrollView>
          {globalLeaderboard.map((user, index) => (
            <LeaderboardItem
              key={user.userId}
              user={user}
              rank={index + 1}
              isCurrentUser={user.userId === userData?.id}
            />
          ))}
        </ScrollView>
      )}

      {localLeaderboard && selectedLeaderboard === "Local" && (
        <ScrollView>
          {localLeaderboard.map((user, index) => (
            <LeaderboardItem
              key={user.userId}
              user={user}
              rank={index + 1}
              isCurrentUser={user.userId === userData?.id}
            />
          ))}
        </ScrollView>
      )}
    </PageContainer>
  );
}
