import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { onBackPress } from "@/utils/navigation";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

// Mock workout data for the chart
const workoutData = [
  { week: "May 5", hours: 4 },
  { week: "May 12", hours: 4.5 },
  { week: "May 19", hours: 3 },
  { week: "May 26", hours: 4.5 },
  { week: "Jun 2", hours: 6 },
  { week: "Jun 9", hours: 4.5 },
  { week: "Jun 16", hours: 6 },
  { week: "Jun 23", hours: 3.5 },
  { week: "Jun 30", hours: 3.5 },
  { week: "Jul 7", hours: 5.5 },
  { week: "Jul 14", hours: 8 },
  { week: "Jul 21", hours: 5.5 },
];

export default function FitnessProfileScreen() {
  const API_BASE_URL = process.env.EXPO_PUBLIC_CITYSTAT_API_URL;

  const { friendId } = useLocalSearchParams();
   const { getToken } = useAuth();
   const [friendProfileData, setFriendProfileData] = useState<any>(null);

  // Use the userId to fetch the friend's data
  useEffect(() => {
    if (friendId) {
      // Fetch friend's profile data using the userId
      fetchFriendProfile(friendId);
    }
  }, [friendId]);

  const fetchFriendProfile = async (friendId) => {
    const token = await getToken();

    const response = await fetch(`${API_BASE_URL}/api/friends/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
       },
      body: JSON.stringify({ friendId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch friends: ${response.status}`);
    }

    const responseData = await response.json();

 
    console.log("Friends prodile:", responseData);
    setFriendProfileData(responseData);
  };

  const StatCard = ({ icon, title }) => (
    <TouchableOpacity className="bg-darkSurface rounded-2xl p-6 flex-1 mx-1 items-center">
      <Ionicons name={icon} size={24} color="#ffffff" className="mb-2" />
      <Text className="text-darkText text-base font-anybody">{title}</Text>
    </TouchableOpacity>
  );

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data }) => {
    const maxValue = Math.max(...data.map((item) => item.hours));

    return (
      <View className="bg-darkSurface rounded-2xl p-4 mb-6">
        <View className="flex-row items-end justify-between h-40">
          {data.map((item, index) => (
            <View key={index} className="flex-1 items-center">
              <View
                className="bg-blue-600 rounded-t-sm mx-1"
                style={{
                  height: `${(item.hours / maxValue) * 100}%`,
                  minHeight: 8,
                }}
              />
              <Text
                className="text-white text-xs mt-2 rotate-45"
                numberOfLines={1}
              >
                {item.week.split(" ")[1] || item.week}
              </Text>
            </View>
          ))}
        </View>
        <View className="flex-row justify-between mt-4">
          <Text className="text-muted text-xs">0 hrs</Text>
          <Text className="text-muted text-xs">3 hrs</Text>
          <Text className="text-muted text-xs">6 hrs</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      <View className="relative flex-row items-center p-4 mt-2 border-b border-lightNeutralGray">
        <TouchableOpacity className="absolute left-4" style={{ zIndex: 10 }}>
          <AntDesign
            onPress={onBackPress}
            name="arrowleft"
            size={28}
            color="#333333ff"
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lightBlackText font-bold text-2xl">
          martbul
        </Text>
      </View>
      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="px-4 pb-6">
          <View className="flex-row items-center mb-6 gap-3">
            <View className="w-24 h-24 bg-lightPrimaryAccent rounded-full flex items-center justify-center">
              <Text className="text-lightPrimaryText text-xl font-bold">
                MB
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row">
                <View className="items-center mr-8">
                  <Text className="text-darkText text-lg font-anybodyBold">
                    225
                  </Text>
                  <Text className="text-muted text-sm font-anybody">
                    Total km
                  </Text>
                </View>
                <View className="items-center mr-8">
                  <Text className="text-darkText text-lg font-anybodyBold">
                    3
                  </Text>
                  <Text className="text-muted text-sm font-anybody">
                    % Coverage
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-darkText text-lg font-anybodyBold">
                    4
                  </Text>
                  <Text className="text-muted text-sm font-anybody">2025</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Workout Summary */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-darkText text-lg font-anybody">
              <Text className="font-anybodyBold">8 hours</Text> last week
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-blue-600 text-base font-anybody mr-1">
                Last 3 months
              </Text>
              <Ionicons name="chevron-down" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          <SimpleBarChart data={workoutData} />

          <Text className="text-muted text-lg font-anybody mb-4">
            Dashboard
          </Text>

          {/* Stats Grid */}
          <View className="flex-row mb-4">
            <StatCard icon="stats-chart" title="Statistics" />
            <StatCard icon="barbell" title="Exercises" />
          </View>

          <View className="flex-row mb-6">
            <StatCard icon="body" title="Measures" />
            <StatCard icon="calendar" title="Calendar" />
          </View>

          {/* Workouts Section */}
          <Text className="text-muted text-lg font-anybody mb-4">Workouts</Text>

          <View className="bg-darkSurface rounded-2xl p-4 flex-row items-center">
            <View className="bg-darkBackground rounded-xl w-12 h-12 items-center justify-center mr-4">
              <Text className="text-darkText text-lg font-anybodyBold">MB</Text>
            </View>
            <View className="flex-1">
              <Text className="text-darkText text-base font-anybodyBold">
                martbul
              </Text>
              <Text className="text-muted text-sm font-anybody">
                Friday, Jul 25, 2025
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#888888" />
            </TouchableOpacity>
          </View>

          <View className="mt-4 mb-2">
            <Text className="text-darkText text-lg font-anybodyBold">Legs</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
