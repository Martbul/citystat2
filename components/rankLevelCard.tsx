import { Text, View } from "react-native";
import { Card, IconContainer, SpaceBetweenRow } from "./dev";
import { MaterialIcons } from "@expo/vector-icons";
import { RankProgressBar } from "./rankProgressBar";

export const RankLevelCard = ({ 
  currentLevel, 
  nextLevel, 
  currentPoints, 
  pointsToNextLevel 
}: { 
  currentLevel: string, 
  nextLevel: string, 
  currentPoints: number, 
  pointsToNextLevel: number 
}) => {
  // const progress = ((currentXP - currentLevel.minXP) / (nextLevelXP - currentLevel.minXP)) * 100;
  console.log("currrrr" + currentLevel)
  return (
    <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
      <View className="flex flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-textDark mb-1">
            {currentLevel}
          </Text>
          {/* <Text className="text-textGray text-sm">
            Level {currentLevel.level}
          </Text> */}
        </View>
        {/* <IconContainer size="large" color="accent">
          <MaterialIcons name={currentLevel.icon} size={28} color="white" />
        </IconContainer> */}
      </View>
      
      <View className="mb-4">
        {/* <RankProgressBar
          progress={progress}
          color="accent"
          label={`Progress to ${nextLevel.name}`}
        /> */}
      </View>
      
      <SpaceBetweenRow>
        <Text className="text-textDark font-medium">
          {currentPoints.toLocaleString()} / {pointsToNextLevel.toLocaleString()} POINTS
        </Text>
        <Text className="text-accent font-semibold">
          {(pointsToNextLevel - currentPoints).toLocaleString()} points to {nextLevel}
        </Text>
      </SpaceBetweenRow>
    </Card>
  );
};
