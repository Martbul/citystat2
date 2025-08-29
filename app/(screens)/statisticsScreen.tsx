import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  Ionicons,
  AntDesign,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Import your existing components
import {
  PageContainer,
  GradientHeader,
  HeaderButton,
  Card,
  IconContainer,
  PageTitle,
  CardTitle,
  BodyText,
  MutedText,
  RowLayout,
  SectionSpacing,
  SpaceBetweenRow,
} from "@/components/dev";

// Time period selector component
const TimePeriodSelector = ({
  selectedPeriod,
  onPeriodChange,
}: {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}) => {
  const periods = ["Week", "Month", "Year", "All Time"];

  return (
    <View className="flex-row bg-gray-100 rounded-2xl p-1 mb-6">
      {periods.map((period) => (
        <TouchableOpacity
          key={period}
          onPress={() => onPeriodChange(period)}
          className={`flex-1 py-2 px-3 rounded-xl ${
            selectedPeriod === period ? "bg-white shadow-sm" : ""
          }`}
        >
          <Text
            className={`text-center font-semibold text-sm ${
              selectedPeriod === period ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {period}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Stats card component for key metrics
const StatsCard = ({
  title,
  value,
  unit,
  trend,
  icon,
  color = "accent",
}: {
  title: string;
  value: string;
  unit: string;
  trend?: { value: string; isPositive: boolean };
  icon: React.ReactNode;
  color?: "accent" | "green" | "blue" | "neutral" | "red";
}) => {
  return (
    <Card className="flex-1 mx-1">
      <RowLayout className="justify-between mb-3">
        <IconContainer size="small" color={color}>
          {icon}
        </IconContainer>
        {trend && (
          <View
            className={`px-2 py-1 rounded-full ${
              trend.isPositive ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                trend.isPositive ? "text-green-700" : "text-red-700"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}
            </Text>
          </View>
        )}
      </RowLayout>
      <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
      <RowLayout className="justify-between">
        <MutedText className="text-sm">{title}</MutedText>
        <MutedText className="text-sm">{unit}</MutedText>
      </RowLayout>
    </Card>
  );
};

// Achievement badge component
const AchievementBadge = ({
  title,
  description,
  isUnlocked,
  icon,
}: {
  title: string;
  description: string;
  isUnlocked: boolean;
  icon: React.ReactNode;
}) => {
  return (
    <View
      className={`flex-row items-center p-4 rounded-2xl border ${
        isUnlocked
          ? "bg-yellow-50 border-yellow-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <IconContainer
        size="medium"
        color={isUnlocked ? "accent" : "neutral"}
        className={isUnlocked ? "" : "opacity-40"}
      >
        {icon}
      </IconContainer>
      <View className="ml-4 flex-1">
        <CardTitle className={`mb-1 ${!isUnlocked ? "opacity-40" : ""}`}>
          {title}
        </CardTitle>
        <MutedText className={!isUnlocked ? "opacity-40" : ""}>
          {description}
        </MutedText>
      </View>
      {isUnlocked && (
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      )}
    </View>
  );
};

// Main Statistics Screen Component
const StatisticsScreen: React.FC = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("Month");

  // Sample statistics data
  const getStatsForPeriod = (period: string) => {
    const baseStats = {
      Week: {
        totalSteps: "45,230",
        streetsExplored: "23",
        distanceTraveled: "32.4",
        activeTime: "8.5",
        averageDaily: "6,461",
        newAreas: "5",
      },
      Month: {
        totalSteps: "198,430",
        streetsExplored: "127",
        distanceTraveled: "156.8",
        activeTime: "42.3",
        averageDaily: "6,401",
        newAreas: "18",
      },
      Year: {
        totalSteps: "2,187,543",
        streetsExplored: "1,432",
        distanceTraveled: "1,845.2",
        activeTime: "487.5",
        averageDaily: "5,993",
        newAreas: "203",
      },
      "All Time": {
        totalSteps: "4,234,891",
        streetsExplored: "2,856",
        distanceTraveled: "3,521.7",
        activeTime: "892.1",
        averageDaily: "6,123",
        newAreas: "387",
      },
    };

    return baseStats[period as keyof typeof baseStats] || baseStats.Month;
  };

  const currentStats = getStatsForPeriod(selectedPeriod);

  const achievements = [
    {
      title: "First Steps",
      description: "Complete your first street exploration",
      isUnlocked: true,
      icon: <Feather name="map-pin" size={20} color="white" />,
    },
    {
      title: "Street Walker",
      description: "Explore 100 different streets",
      isUnlocked: true,
      icon: <Ionicons name="walk" size={20} color="white" />,
    },
    {
      title: "Distance Master",
      description: "Travel 1,000 km total",
      isUnlocked: true,
      icon: <MaterialIcons name="straighten" size={20} color="white" />,
    },
    {
      title: "Area Explorer",
      description: "Discover 50 new areas",
      isUnlocked: false,
      icon: <Ionicons name="compass" size={20} color="#6B7280" />,
    },
    {
      title: "Consistency King",
      description: "Maintain a 30-day streak",
      isUnlocked: false,
      icon: <Feather name="calendar" size={20} color="#6B7280" />,
    },
  ];

  return (
    <PageContainer>
      <GradientHeader>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-1 ml-4">
          <Text className="text-white text-2xl font-bold">Statistics</Text>
          <MutedText className="text-white/70">
            Your exploration insights
          </MutedText>
        </View>

        <HeaderButton onPress={() => console.log("Share stats")}>
          <Ionicons name="share" size={24} color="white" />
        </HeaderButton>
      </GradientHeader>

      <ScrollView className="flex-1 px-4">
        <SectionSpacing className="mt-6">
          <TimePeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </SectionSpacing>

        {/* Key Metrics Row 1 */}
        <SectionSpacing>
          <View className="flex-row">
            <StatsCard
              title="Total Steps"
              value={currentStats.totalSteps}
              unit="steps"
              trend={{ value: "12%", isPositive: true }}
              icon={<Feather name="activity" size={16} color="white" />}
              color="green"
            />
            <StatsCard
              title="Streets"
              value={currentStats.streetsExplored}
              unit="explored"
              trend={{ value: "8", isPositive: true }}
              icon={<Ionicons name="map" size={16} color="white" />}
              color="blue"
            />
          </View>
        </SectionSpacing>

        {/* Key Metrics Row 2 */}
        <SectionSpacing>
          <View className="flex-row">
            <StatsCard
              title="Distance"
              value={currentStats.distanceTraveled}
              unit="km"
              trend={{ value: "15%", isPositive: true }}
              icon={<MaterialIcons name="straighten" size={16} color="white" />}
              color="accent"
            />
            <StatsCard
              title="Active Time"
              value={currentStats.activeTime}
              unit="hours"
              trend={{ value: "3%", isPositive: false }}
              icon={<Ionicons name="time" size={16} color="white" />}
              color="neutral"
            />
          </View>
        </SectionSpacing>

        {/* Detailed Stats */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Detailed Statistics</CardTitle>
            <View className="space-y-4">
              <SpaceBetweenRow>
                <RowLayout>
                  <IconContainer size="small" color="green">
                    <Ionicons name="trending-up" size={16} color="#10B981" />
                  </IconContainer>
                  <BodyText className="ml-3">Daily Average</BodyText>
                </RowLayout>
                <BodyText className="font-bold">
                  {currentStats.averageDaily} steps
                </BodyText>
              </SpaceBetweenRow>

              <SpaceBetweenRow>
                <RowLayout>
                  <IconContainer size="small" color="blue">
                    <Feather name="map-pin" size={16} color="#3B82F6" />
                  </IconContainer>
                  <BodyText className="ml-3">New Areas</BodyText>
                </RowLayout>
                <BodyText className="font-bold">
                  {currentStats.newAreas} discovered
                </BodyText>
              </SpaceBetweenRow>

              <SpaceBetweenRow>
                <RowLayout>
                  <IconContainer size="small" color="accent">
                    <Ionicons name="speedometer" size={16} color="#F59E0B" />
                  </IconContainer>
                  <BodyText className="ml-3">Exploration Rate</BodyText>
                </RowLayout>
                <BodyText className="font-bold">
                  {selectedPeriod === "Week"
                    ? "3.3"
                    : selectedPeriod === "Month"
                      ? "4.1"
                      : selectedPeriod === "Year"
                        ? "3.9"
                        : "4.2"}{" "}
                  streets/day
                </BodyText>
              </SpaceBetweenRow>
            </View>
          </Card>
        </SectionSpacing>

        {/* Progress Chart Placeholder */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Progress Over Time</CardTitle>
            <View className="h-32 bg-gray-100 rounded-2xl flex items-center justify-center">
              <RowLayout>
                <Ionicons name="bar-chart" size={24} color="#6B7280" />
                <MutedText className="ml-2">
                  Chart visualization would go here
                </MutedText>
              </RowLayout>
            </View>
          </Card>
        </SectionSpacing>

        {/* Achievements Section */}
        <SectionSpacing>
          <Card>
            <SpaceBetweenRow className="mb-4">
              <CardTitle>Achievements</CardTitle>
              <RowLayout>
                <Text className="text-sm font-semibold text-green-600 mr-2">
                  3/5
                </Text>
                <Ionicons name="trophy" size={20} color="#F59E0B" />
              </RowLayout>
            </SpaceBetweenRow>

            <View className="space-y-3">
              {achievements.map((achievement, index) => (
                <AchievementBadge
                  key={index}
                  title={achievement.title}
                  description={achievement.description}
                  isUnlocked={achievement.isUnlocked}
                  icon={achievement.icon}
                />
              ))}
            </View>
          </Card>
        </SectionSpacing>

        {/* Export Options */}
        <SectionSpacing className="mb-8">
          <Card>
            <CardTitle className="mb-4">Export Data</CardTitle>
            <View className="space-y-2">
              <TouchableOpacity className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl">
                <RowLayout>
                  <IconContainer size="small" color="blue">
                    <Ionicons name="download" size={16} color="#3B82F6" />
                  </IconContainer>
                  <BodyText className="ml-3">Export as CSV</BodyText>
                </RowLayout>
                <AntDesign name="right" size={16} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl">
                <RowLayout>
                  <IconContainer size="small" color="green">
                    <Ionicons name="share" size={16} color="#10B981" />
                  </IconContainer>
                  <BodyText className="ml-3">Share Summary</BodyText>
                </RowLayout>
                <AntDesign name="right" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </Card>
        </SectionSpacing>
      </ScrollView>
    </PageContainer>
  );
};

export default StatisticsScreen;
