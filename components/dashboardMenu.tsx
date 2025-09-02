import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { RelativePathString, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export const DashboardMenu = () => {
  const router = useRouter();

  const navigateToPath = (navigationPath: RelativePathString) => {
    console.log("navigating to path:", navigationPath);
    router.push(navigationPath);
  };

  const DashboardCard = (props: {
    label: string;
    icon: React.ReactNode;
    navigationPath: RelativePathString;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => navigateToPath(props.navigationPath)}
        className="bg-lightSurface px-4 py-2 rounded-2xl border border-lightNeutralGray shadow-sm h-16 items-center justify-center min-w-[45%] max-w-[48%]"
      >
        <View className="flex flex-row items-center gap-2">
          <View className="rounded-full p-2 bg-transparent">{props.icon}</View>
          <Text className="font-anybody text-lightBlackText">
            {props.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex justify-center items-center gap-2">
      <View className="flex flex-row gap-2">
        <DashboardCard
          label="Stats"
          icon={<Ionicons name="stats-chart" size={24} color="black" />}
          navigationPath={"/(screens)/statisticsScreen" as RelativePathString}
        />
        <DashboardCard
          label="Global"
          icon={<Ionicons name="globe-outline" size={24} color="black" />}
          navigationPath={"/(screens)/global" as RelativePathString}
        />
      </View>
      <View className="flex flex-row gap-2">
        <DashboardCard
          label="Friends"
          icon={<FontAwesome5 name="user-friends" size={24} color="black" />}
          navigationPath={"/(screens)/friends" as RelativePathString}
        />
        <DashboardCard
          label="Calendar"
          icon={<Feather name="calendar" size={24} color="black" />}
          navigationPath={"/(screens)/calendar" as RelativePathString}
        />
      </View>
    </View>
  );
};
