import React, { useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
  RefreshControl,
  Text,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import Fontisto from "@expo/vector-icons/Fontisto";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserData } from "@/Providers/UserDataProvider";
import SideMenuDrawer from "@/components/drawers/SideMenuDrawer";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import {
  CardTitle,
  ClickableCard,
  HeaderButton,
  IconContainer,
  RowLayout,
  SectionSpacing,
} from "@/components/dev";
import { ChartRadar } from "@/components/charts/radarChart";
import { SuggestedExplorersSection } from "@/components/suggestedUsersSection";
import { DashboardMenu } from "@/components/dashboardMenu";
import QuickStats from "@/components/quickStats";
import { useMenusDrawer } from "@/Providers/MenuDrawerProvider";
import { UserSearcherDrawer } from "@/components/drawers/userSearcherDrawer";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  const {
    isSideMenuDrawerOpen,
    isTopSearchDrawerOpen,
    setIsSideMenuDrawerOpen,
    setIsTopSearchDrawerOpen,
  } = useMenusDrawer();
  const { isSignedIn, isLoaded, user } = useUser();
  const { userData, refreshUserData } = useUserData();
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    console.log("refreshing user data");
    refreshUserData();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log("Pull to refresh triggered");
      await refreshUserData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const openSideDrawer = () => {
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

  const closeSideDrawer = () => {
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

  const openTopDrawer = () => {
    setIsTopSearchDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeTopDrawer = () => {
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
      setIsTopSearchDrawerOpen(false);
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

  // if (!userData ) {
  //   router.replace("/(auth)/sign-in");
  //   return null;
  // }

  const sections = [
    { id: "header", type: "header" },
    { id: "tabs", type: "tabs" },
    { id: "content", type: "content" },
  ];

  const renderSection = ({ item }: { item: any }) => {
    if (item.type === "header") {
      return (
        <SafeAreaView>
          <StatusBar backgroundColor="#fafafa" barStyle="dark-content" />
          <View className="mx-4 mt-3 rounded-b-2xl gap-4">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={openSideDrawer} className="mr-4 mt-1">
                <Entypo name="menu" size={26} color="#333333" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row gap-3">
                <HeaderButton onPress={openTopDrawer}>
                  <Fontisto name="search" size={22} color="#1F2937" />
                </HeaderButton>

                {/* //! for v2 */}
                {/* <HeaderButton
                  onPress={() => router.push("/(screens)/challenges")}
                >
                  <FontAwesome6 name="star" size={22} color="black" />
                </HeaderButton> */}
                {/* <HeaderButton
                  onPress={() => router.push("/(screens)/notifications")}
                >
                  <Ionicons name="notifications" size={24} color="#1F2937" />
                </HeaderButton> */}
              </TouchableOpacity>
            </View>

            <QuickStats />

            <DashboardMenu />

            <ChartRadar />

            <SuggestedExplorersSection />

            <SectionSpacing className="mb-1">
              <ClickableCard onPress={() => console.log("suuu")}>
                <RowLayout>
                  <IconContainer color="accent">
                    <AntDesign name="user" size={24} color="#c8f751" />
                  </IconContainer>
                  <CardTitle className="ml-4">See somthing importatn</CardTitle>
                </RowLayout>
              </ClickableCard>
            </SectionSpacing>
          </View>
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
          closeDrawer={closeSideDrawer}
        />
      )}

      {isTopSearchDrawerOpen && (
        <UserSearcherDrawer
          isTopSearchDrawerOpen={isTopSearchDrawerOpen}
          slideAnim={slideAnim}
          overlayOpacity={overlayOpacity}
          closeDrawer={closeTopDrawer}
        />
      )}

      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#c8f751"]}
            tintColor="#c8f751"
          />
        }
      />
    </SafeAreaView>
  );
}
