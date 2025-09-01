import { Image, Text, View } from "react-native";
import { RowLayout } from "./dev";
import { RankBadge } from "./rankBadge";
import { Feather, Ionicons } from "@expo/vector-icons";

export const LeaderboardItem = ({
  user,
  rank,
  isCurrentUser = false,
}: {
  user: any;
  rank: number;
  isCurrentUser?: boolean;
}) => (
  <View
    className={`flex flex-row items-center justify-between p-4 mb-3 rounded-2xl ${
      isCurrentUser
        ? "bg-accent/10 border-2 border-accent/30"
        : "bg-white border border-gray-100"
    }`}
  >
    <RowLayout className="flex-1">
      <RankBadge rank={rank} />
      <View className="w-12 h-12 rounded-full bg-gray-300 ml-4 mr-3 overflow-hidden">
        {user.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full bg-containerBg flex items-center justify-center">
            <Ionicons name="person" size={20} color="#6B7280" />
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className={`text-base font-semibold  text-textDark`}>
          {user.firstName} {user.lastName}
        </Text>


        <View className="flex flex-row items-center gap-1">
          <View className="w-5 h-5 bg-accent rounded-xl flex items-center justify-center shadow-sm">
            <Feather name="hash" size={10} color="white" />
          </View>

          <Text className={`text-sm font-semibold text-textDark`}>
            {user.userName}
          </Text>
        </View>

        <Text className="text-textGray text-sm">{user.level}</Text>
      </View>
    </RowLayout>

    <View className="items-end">
      <Text
        className={`text-lg font-bold ${isCurrentUser ? "text-accent" : "text-textDark"}`}
      >
        {user.points.toLocaleString()}
      </Text>
      <Text className="text-textGray text-sm">points</Text>
    </View>
  </View>
);
