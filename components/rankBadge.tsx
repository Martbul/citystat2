import { Text, View } from "react-native";

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500";
    if (rank === 2) return "bg-gray-400";
    if (rank === 3) return "bg-amber-600";
    if (rank <= 10) return "bg-accent";
    return "bg-containerBg border border-gray-300";
  };
  

export const RankBadge = ({ rank, size = "medium" }: { rank: number, size?: "small" | "medium" | "large" }) => {
  const sizeClasses = {
    small: "w-8 h-8 text-sm",
    medium: "w-10 h-10 text-base",
    large: "w-12 h-12 text-lg"
  };

  return (
    <View className={`${sizeClasses[size]} ${getRankColor(rank)} rounded-full flex items-center justify-center`}>
      <Text className={`font-bold ${rank <= 3 ? 'text-white' : rank <= 10 ? 'text-white' : 'text-textDark'}`}>
        #{rank}
      </Text>
    </View>
  );
};
