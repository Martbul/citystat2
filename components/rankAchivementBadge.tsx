import { View } from "react-native";
import { IconContainer } from "./dev";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "react-native";

export const AchievementBadge = ({ 
  achievement, 
  unlocked = false 
}: { 
  achievement: any, 
  unlocked?: boolean 
}) => (
  <View className={`p-4 rounded-2xl border-2 ${
    unlocked ? 'bg-white border-iconGreen/30' : 'bg-gray-50 border-gray-200'
  }`}>
    <IconContainer
      size="large" 
      color={unlocked ? "green" : "neutral"}
      className={`mb-3 ${!unlocked && 'opacity-50'}`}
    >
      <MaterialIcons 
        name={achievement.icon} 
        size={24} 
        color={unlocked ? "#10B981" : "#6B7280"} 
      />
    </IconContainer>
    <Text className={`text-sm font-semibold mb-1 ${
      unlocked ? 'text-textDark' : 'text-textGray'
    }`}>
      {achievement.name}
    </Text>
    <Text className="text-xs text-textGray leading-4">
      {achievement.description}
    </Text>
    {unlocked && (
      <View className="mt-2">
        <Text className="text-xs text-iconGreen font-medium">
          +{achievement.points} XP
        </Text>
      </View>
    )}
  </View>
);