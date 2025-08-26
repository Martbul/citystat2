import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
  Image,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Fontisto from "@expo/vector-icons/Fontisto";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSideMenusDrawer } from "@/Providers/SideMenuDrawerProvider";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserData } from "@/Providers/UserDataProvider";
import SideMenuDrawer from "@/components/drawers/SideMenuDrawer";
import { logEvent } from "@/utils/logger";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CardTitle,
  ClickableCard,
  HeaderButton,
  IconContainer,
  RowLayout,
  SectionSpacing,
} from "@/components/dev";
import { AreaTwoLinerChart } from "@/components/charts/areaTwoLiner";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  const { isSideMenuDrawerOpen, setIsSideMenuDrawerOpen } =
    useSideMenusDrawer();
  const { isSignedIn, isLoaded, user } = useUser();
  const { userData, refreshUserData } = useUserData();
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("refreshing user data");
    refreshUserData();
  }, []);

  const openDrawer = () => {
    setIsSideMenuDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -screenWidth * 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSideMenuDrawerOpen(false);
    });
  };

  if (!isLoaded) {
    console.log("not loaded yet");

    return null;
  }
  if (!isSignedIn) {
    console.log("not signed in");

    return null;
  }

  if (isSignedIn) {
    console.log("User is signed in: " + user.id);
  }

  if (userData && userData.completedTutorial === false) {
    router.replace("/tutorial");
  }

  const sections = [
    { id: "header", type: "header" },
    { id: "tabs", type: "tabs" },
    { id: "content", type: "content" },
  ];

  const renderSection = ({ item }: { item: any }) => {
    if (item.type === "header") {
      return (
        <SafeAreaView>
          <StatusBar backgroundColor="bg-lightContainerBg" />
          <View className="mx-3 px-4 mt-9 pb-10 rounded-b-2xl">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={openDrawer} className="mr-4 mt-1">
                <Entypo name="menu" size={26} color="#333333" />
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <HeaderButton onPress={() => console.log("Search pressed")}>
                  <Fontisto name="search" size={22} color="#1F2937" />
                </HeaderButton>

                <HeaderButton
                  onPress={() => router.push("/(screens)/notifications")}
                >
                  <Ionicons name="notifications" size={24} color="#1F2937" />
                </HeaderButton>
              </View>
            </View>

            <SectionSpacing className="my-3">
              <ClickableCard onPress={console.log("suuu")}>
                <RowLayout>
                  <IconContainer color="accent">
                    <AntDesign name="user" size={24} color="#c8f751" />
                  </IconContainer>
                  <CardTitle className="ml-4">See somthing importatn</CardTitle>
                </RowLayout>
              </ClickableCard>
            </SectionSpacing>

            <View className="mt-8">
              <View className="flex-row justify-between">
                <StatCard
                  title="Total"
                  value="847.3"
                  subtitle="km"
                  icon={
                    <FontAwesome5 name="walking" size={18} color="#c8f751" />
                  }
                />
                <StatCard
                  title="Coverage"
                  value="23.7%"
                  subtitle="Sofia"
                  icon={
                    <MaterialIcons name="explore" size={20} color="#c8f751" />
                  }
                />
              </View>
            </View>

           
                <AreaTwoLinerChart/>
            

            <View>
              <Dashboard />
            </View>
          </View>

          {/* 
          <View className="flex flex-row justify-between items-center px-4">
            <View className="justify-center">
              <View className="mb-2">
                <MaterialCommunityIcons name="gold" size={24} color="black" />
                <Text>0 Gold</Text>
              </View>
              <View className=" mb-2">
                <FontAwesome5 name="gem" size={24} color="black" />
                <Text>0 Gems</Text>
              </View>
              <View>
                <FontAwesome5 name="old-republic" size={24} color="black" />
                <Text>0 Artifacts</Text>
              </View>

              <View>
                <MaterialCommunityIcons
                  name="crystal-ball"
                  size={24}
                  color="black"
                />
                <Text>0 Magic</Text>
              </View>
            </View>
            <View>
              <Image
                className="w-28 h-28"
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/langfr-250px-Ethereum-icon-purple.svg.png",
                }}
              ></Image>
            </View>

            <View>
              <View>
                <MaterialCommunityIcons name="sword" size={24} color="black" />
                <Text>0 Strenght</Text>
              </View>

              <View>
                <FontAwesome5 name="chess-king" size={24} color="black" />
                <Text>0 Influence</Text>
              </View>
              <View>
                <FontAwesome5 name="ethereum" size={24} color="black" />
                <Text>0 Runes</Text>
              </View>
              <View>
                <MaterialCommunityIcons
                  name="lightning-bolt-outline"
                  size={24}
                  color="black"
                />
                <Text>0 Energy</Text>
              </View>
            </View>
          </View> */}
        </SafeAreaView>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-containerBg">
      {isSideMenuDrawerOpen && (
        <SideMenuDrawer
          isSideMenuDrawerOpen={isSideMenuDrawerOpen}
          slideAnim={slideAnim}
          overlayOpacity={overlayOpacity}
          closeDrawer={closeDrawer}
        />
      )}

      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}

export const StatCard = ({
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

const Dashboard = () => {
  return (
    <View className="flex justify-center items-center mt-4 gap-2">
      <View className="flex flex-row gap-2">
        <DashboardCard
          label="Stats"
          icon={<Ionicons name="stats-chart" size={24} color="black" />}
        />
        <DashboardCard
          label="Global"
          icon={<Ionicons name="globe-outline" size={24} color="black" />}
        />
      </View>
      <View className="flex flex-row gap-2">
        <DashboardCard
          label="Friends"
          icon={<FontAwesome5 name="user-friends" size={24} color="black" />}
        />
        <DashboardCard
          label="Calendar"
          icon={<Feather name="calendar" size={24} color="black" />}
        />
      </View>
    </View>
  );
};



const DashboardCard = (props: { label: string; icon: React.ReactNode }) => {
  return (
    <View className="bg-lightSurface px-4 py-2 rounded-2xl border border-lightNeutralGray shadow-sm h-16 items-center justify-center min-w-[45%] max-w-[48%]">
      <View className="flex flex-row items-center gap-2">
        <View className="rounded-full p-2 bg-transparent">{props.icon}</View>
        <Text className="font-anybody text-lightBlackText">{props.label}</Text>
      </View>
    </View>
  );
};