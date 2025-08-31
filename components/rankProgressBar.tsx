import { Text, View } from "react-native";

  const heightClasses = {
    small: "h-2",
    medium: "h-3", 
    large: "h-4"
  };
  
  const colorClasses = {
    accent: "bg-accent",
    green: "bg-iconGreen",
    blue: "bg-sessionBlue",
    red: "bg-red-500"
  };


export const RankProgressBar = ({ 
  progress, 
  color = "accent", 
  height = "medium",
  showLabel = true,
  label
}: { 
  progress: number, 
  color?: "accent" | "green" | "blue" | "red",
  height?: "small" | "medium" | "large",
  showLabel?: boolean,
  label?: string
}) => {
  return (
    <View className="flex-1">
      {showLabel && (
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-textDark text-sm font-medium">{label}</Text>
          <Text className="text-textGray text-sm font-medium">{Math.round(progress)}%</Text>
        </View>
      )}
      <View className={`w-full ${heightClasses[height]} bg-gray-200 rounded-full overflow-hidden`}>
        <View 
          className={`${heightClasses[height]} ${colorClasses[color]} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </View>
    </View>
  );
};