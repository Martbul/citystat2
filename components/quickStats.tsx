import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function QuickStats() {
 
  return (
    <View className="mt-6">
      <View className="flex-row justify-between">
        <StatCard
          title="Total"
          value="847.3"
          subtitle="km"
          icon={<FontAwesome5 name="walking" size={18} color="#c8f751" />}
        />
        <StatCard
          title="Coverage"
          value="23.7%"
          subtitle="Sofia"
          icon={<MaterialIcons name="explore" size={20} color="#c8f751" />}
        />
      </View>
    </View>
  );
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
}) => (
  <View className="flex-1 min-w-[45%] max-w-[48%]">
    <View className="rounded-2xl p-4 bg-lightSurface border border-lightNeutralGray shadow-sm h-36">
      <View className="flex-col justify-between h-full">
        {/* Title + Icon */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lightMutedText font-anybody text-xs">
            {title}
          </Text>
          <View className="bg-lightContainerBg rounded-full p-2">{icon}</View>
        </View>

        {/* Value */}
        <Text className="text-lightBlackText font-anybodyBold text-2xl">
          {value}
        </Text>

        {/* Subtitle */}
        {subtitle ? (
          <Text className="text-lightMutedText text-[11px] mt-1 font-anybody">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  </View>
);
