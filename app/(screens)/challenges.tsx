import { MutedText, SectionSpacing, SectionTitle } from "@/components/dev";
import Header from "@/components/header";
import { AchievementBadge } from "@/components/rankAchivementBadge";
import { StatusBar, Text, View } from "react-native";
const achievements = [
  {
    id: "1",
    name: "First Steps",
    description: "Complete your first challenge",
    icon: "play-arrow",
    points: 100,
    unlocked: true,
  },
  {
    id: "2",
    name: "Streak Master",
    description: "Maintain a 7-day streak",
    icon: "local-fire-department",
    points: 250,
    unlocked: true,
  },
  {
    id: "3",
    name: "Top Performer",
    description: "Reach top 10 leaderboard",
    icon: "trophy",
    points: 500,
    unlocked: false,
  },
  {
    id: "4",
    name: "Perfectionist",
    description: "Score 100% on 5 challenges",
    icon: "star-rate",
    points: 300,
    unlocked: true,
  },
  {
    id: "5",
    name: "Social Butterfly",
    description: "Invite 10 friends",
    icon: "group",
    points: 200,
    unlocked: false,
  },
  {
    id: "6",
    name: "Milestone",
    description: "Reach 20,000 XP",
    icon: "emoji-events",
    points: 1000,
    unlocked: false,
  },
];
export default function Challenges() {
  return (
    <SectionSpacing>
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Challenges" />
      <View className="flex flex-row justify-between items-center mb-4">
        <MutedText>
          {achievements.filter((a) => a.unlocked).length} of{" "}
          {achievements.length} unlocked
        </MutedText>
        <Text className="text-accent font-semibold">
          {achievements
            .filter((a) => a.unlocked)
            .reduce((sum, a) => sum + a.points, 0)}{" "}
          Points earned
        </Text>
      </View>

      <View className="flex flex-row flex-wrap gap-3">
        {achievements.map((achievement) => (
          <View key={achievement.id} className="w-[48%]">
            <AchievementBadge
              achievement={achievement}
              unlocked={achievement.unlocked}
            />
          </View>
        ))}
      </View>
    </SectionSpacing>
  );
}
