import { Text, View } from "react-native";
import { IconContainer } from "./dev";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export const RankStatCard = ({ 
  title, 
  value, 
  icon, 
  color = "neutral",
  trend
}: { 
  title: string, 
  value: string | number, 
  icon: string, 
  color?: "neutral" | "green" | "blue" | "red" | "accent",
  trend?: { value: number, isPositive: boolean }
}) => (
  <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
    <View className="flex flex-row items-center justify-between mb-3">
      <IconContainer size="small" color={color}>
        <MaterialIcons name={icon} size={16} color={
          color === "neutral" ? "#6B7280" : 
          color === "green" ? "#10B981" :
          color === "blue" ? "#3B82F6" :
          color === "red" ? "#EF4444" :
          "white"
        } />
      </IconContainer>
      {trend && (
        <View className="flex flex-row items-center">
          <Ionicons
            name={trend.isPositive ? "trending-up" : "trending-down"} 
            size={12} 
            color={trend.isPositive ? "#10B981" : "#EF4444"} 
          />
          <Text className={`text-xs font-medium ml-1 ${
            trend.isPositive ? 'text-iconGreen' : 'text-red-500'
          }`}>
            {trend.value}%
          </Text>
        </View>
      )}
    </View>
    
    <Text className="text-2xl font-bold text-textDark mb-1">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Text>
    <Text className="text-textGray text-xs">
      {title}
    </Text>
  </View>
);
