import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  AntDesign,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
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
import Header from "@/components/header";

const { width: screenWidth } = Dimensions.get("window");

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

// Animated Progress Bar Component
const AnimatedProgressBar = ({
  progress,
  color = "#10B981",
  height = 8,
  label,
  value,
}: {
  progress: number;
  color?: string;
  height?: number;
  label: string;
  value: string;
}) => {
  return (
    <View className="mb-4">
      <SpaceBetweenRow className="mb-2">
        <BodyText className="font-medium">{label}</BodyText>
        <BodyText className="font-bold">{value}</BodyText>
      </SpaceBetweenRow>
      <View
        className="bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <View
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

// Weekly Activity Heatmap
const WeeklyHeatmap = ({ data }: { data: number[][] }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensityColor = (value: number) => {
    if (value === 0) return "#F3F4F6";
    if (value <= 0.25) return "#DBEAFE";
    if (value <= 0.5) return "#93C5FD";
    if (value <= 0.75) return "#3B82F6";
    return "#1D4ED8";
  };

  return (
    <Card>
      <CardTitle className="mb-4">Activity Heatmap (Last 7 Days)</CardTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Hour labels */}
          <View className="flex-row mb-2">
            <View style={{ width: 30 }} />
            {[0, 6, 12, 18].map((hour) => (
              <View key={hour} style={{ width: 50 }} className="items-center">
                <MutedText className="text-xs">{hour}:00</MutedText>
              </View>
            ))}
          </View>

          {/* Heatmap grid */}
          {days.map((day, dayIndex) => (
            <View key={day} className="flex-row items-center mb-1">
              <View style={{ width: 30 }}>
                <MutedText className="text-xs">{day}</MutedText>
              </View>
              <View className="flex-row">
                {hours.map((hour) => (
                  <View
                    key={`${dayIndex}-${hour}`}
                    className="rounded-sm mr-0.5"
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: getIntensityColor(
                        data[dayIndex]?.[hour] || 0
                      ),
                    }}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Legend */}
          <View className="flex-row items-center mt-3">
            <MutedText className="text-xs mr-2">Less</MutedText>
            {[0, 0.25, 0.5, 0.75, 1].map((value, index) => (
              <View
                key={index}
                className="rounded-sm mr-1"
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: getIntensityColor(value),
                }}
              />
            ))}
            <MutedText className="text-xs ml-2">More</MutedText>
          </View>
        </View>
      </ScrollView>
    </Card>
  );
};

// Circular Progress Component
const CircularProgress = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "#10B981",
  label,
  value,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  value: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }} className="relative">
        <View
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: "#F3F4F6",
          }}
        />
        <View
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: color,
            transform: [{ rotate: `${(progress / 100) * 360}deg` }],
            opacity: 0.2,
          }}
        />
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-2xl font-bold text-gray-900">{value}</Text>
          <MutedText className="text-xs">{label}</MutedText>
        </View>
      </View>
      <View
        className="mt-2 bg-gray-200 rounded-full"
        style={{ width: size * 0.8, height: 4 }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

// Mini Line Chart Component
const MiniLineChart = ({
  data,
  color = "#10B981",
  height = 60,
}: {
  data: number[];
  color?: string;
  height?: number;
}) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = ((max - value) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View style={{ height }} className="bg-gray-50 rounded-lg overflow-hidden">
      <View className="absolute inset-0">
        {/* Simple line representation using flex */}
        <View className="flex-row items-end h-full px-1">
          {data.map((value, index) => (
            <View
              key={index}
              className="flex-1 mx-0.5"
              style={{
                height: `${((value - min) / range) * 100}%`,
                backgroundColor: color,
                minHeight: 2,
                opacity: 0.7,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

// Radial Progress Component
const RadialProgress = ({
  segments,
  size = 100,
}: {
  segments: { label: string; value: number; color: string; max: number }[];
  size?: number;
}) => {
  return (
    <View className="items-center">
      <View style={{ width: size, height: size }} className="relative">
        {segments.map((segment, index) => {
          const progress = (segment.value / segment.max) * 100;
          const radius = size / 2 - 10 - index * 8;
          return (
            <View
              key={index}
              className="absolute inset-0 items-center justify-center"
            >
              <View
                className="rounded-full border-4"
                style={{
                  width: radius * 2,
                  height: radius * 2,
                  borderColor: "#F3F4F6",
                }}
              />
              <View
                className="absolute rounded-full border-4"
                style={{
                  width: radius * 2,
                  height: radius * 2,
                  borderColor: segment.color,
                  borderRightColor: "#F3F4F6",
                  borderBottomColor: "#F3F4F6",
                  transform: [{ rotate: `${(progress / 100) * 360}deg` }],
                }}
              />
            </View>
          );
        })}
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-lg font-bold text-gray-900">Goals</Text>
        </View>
      </View>
      <View className="mt-3">
        {segments.map((segment, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between mb-1"
          >
            <RowLayout>
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: segment.color }}
              />
              <MutedText className="text-xs">{segment.label}</MutedText>
            </RowLayout>
            <MutedText className="text-xs">
              {segment.value}/{segment.max}
            </MutedText>
          </View>
        ))}
      </View>
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
  showMiniChart = false,
  chartData,
}: {
  title: string;
  value: string;
  unit: string;
  trend?: { value: string; isPositive: boolean };
  icon: React.ReactNode;
  color?: "accent" | "green" | "blue" | "neutral" | "red";
  showMiniChart?: boolean;
  chartData?: number[];
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
      <RowLayout className="justify-between mb-2">
        <MutedText className="text-sm">{title}</MutedText>
        <MutedText className="text-sm">{unit}</MutedText>
      </RowLayout>
      {showMiniChart && chartData && (
        <MiniLineChart data={chartData} color="#10B981" height={40} />
      )}
    </Card>
  );
};

// Weekly Goal Progress Ring
const WeeklyGoalRing = ({
  currentSteps,
  goalSteps,
}: {
  currentSteps: number;
  goalSteps: number;
}) => {
  const progress = Math.min((currentSteps / goalSteps) * 100, 100);
  const isCompleted = currentSteps >= goalSteps;

  return (
    <View className="items-center">
      <View className="relative" style={{ width: 80, height: 80 }}>
        {/* Background ring */}
        <View
          className="absolute inset-0 rounded-full border-8 border-gray-200"
          style={{ transform: [{ rotate: "-90deg" }] }}
        />
        {/* Progress ring */}
        <View
          className={`absolute inset-0 rounded-full border-8 ${
            isCompleted ? "border-green-500" : "border-blue-500"
          }`}
          style={{
            transform: [{ rotate: "-90deg" }],
            borderTopColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftWidth: progress > 50 ? 8 : 0,
            borderTopWidth: progress > 75 ? 8 : 0,
            borderRightWidth: progress > 25 ? 8 : 0,
          }}
        />
        {/* Center content */}
        <View className="absolute inset-0 items-center justify-center">
          {isCompleted ? (
            <Ionicons name="checkmark" size={24} color="#10B981" />
          ) : (
            <Text className="text-lg font-bold text-gray-900">
              {Math.round(progress)}%
            </Text>
          )}
        </View>
      </View>
      <MutedText className="text-xs mt-2 text-center">
        {currentSteps.toLocaleString()} / {goalSteps.toLocaleString()}
      </MutedText>
    </View>
  );
};

// Comparison Bars Component
const ComparisonBars = ({
  data,
}: {
  data: { label: string; current: number; previous: number; color: string }[];
}) => {
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.current, item.previous])
  );

  return (
    <Card>
      <CardTitle className="mb-4">This vs Last Period</CardTitle>
      <View className="space-y-4">
        {data.map((item, index) => (
          <View key={index}>
            <BodyText className="font-medium mb-2">{item.label}</BodyText>
            <View className="space-y-2">
              {/* Current period */}
              <View>
                <View className="flex-row justify-between mb-1">
                  <MutedText className="text-xs">Current</MutedText>
                  <MutedText className="text-xs">{item.current}</MutedText>
                </View>
                <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${(item.current / maxValue) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </View>
              </View>
              {/* Previous period */}
              <View>
                <View className="flex-row justify-between mb-1">
                  <MutedText className="text-xs">Previous</MutedText>
                  <MutedText className="text-xs">{item.previous}</MutedText>
                </View>
                <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full opacity-60"
                    style={{
                      width: `${(item.previous / maxValue) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

// Daily Steps Chart
const DailyStepsChart = ({ data }: { data: number[] }) => {
  const maxSteps = Math.max(...data);
  const avgSteps = Math.round(data.reduce((a, b) => a + b, 0) / data.length);

  return (
    <Card>
      <SpaceBetweenRow className="mb-4">
        <CardTitle>Daily Steps (Last 7 Days)</CardTitle>
        <View className="items-end">
          <Text className="text-sm font-bold text-gray-900">
            {avgSteps.toLocaleString()}
          </Text>
          <MutedText className="text-xs">avg/day</MutedText>
        </View>
      </SpaceBetweenRow>

      <View className="flex-row items-end justify-between h-32 mb-2">
        {data.map((steps, index) => {
          const height = (steps / maxSteps) * 100;
          const isToday = index === data.length - 1;
          return (
            <View key={index} className="items-center flex-1">
              <View
                className={`w-6 rounded-t-lg ${
                  isToday ? "bg-blue-500" : "bg-gray-300"
                }`}
                style={{ height: `${height}%`, minHeight: 8 }}
              />
              <MutedText className="text-xs mt-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
              </MutedText>
            </View>
          );
        })}
      </View>

      {/* Average line indicator */}
      <View className="border-t border-dashed border-gray-300 pt-2">
        <RowLayout className="justify-center">
          <View className="w-4 h-0.5 bg-gray-400 mr-2" />
          <MutedText className="text-xs">
            Average: {avgSteps.toLocaleString()} steps
          </MutedText>
        </RowLayout>
      </View>
    </Card>
  );
};

// Street Exploration Donut Chart
const StreetExplorationDonut = ({
  explored,
  total,
}: {
  explored: number;
  total: number;
}) => {
  const progress = (explored / total) * 100;
  const remaining = total - explored;

  return (
    <Card>
      <CardTitle className="mb-4">Street Exploration Progress</CardTitle>
      <View className="items-center">
        <View className="relative" style={{ width: 120, height: 120 }}>
          {/* Background circle */}
          <View
            className="absolute inset-0 rounded-full border-8 border-gray-200"
            style={{ borderWidth: 16 }}
          />
          {/* Progress arc */}
          <View
            className="absolute inset-0 rounded-full border-8 border-blue-500"
            style={{
              borderWidth: 16,
              borderTopColor: progress > 12.5 ? "#3B82F6" : "transparent",
              borderRightColor: progress > 37.5 ? "#3B82F6" : "transparent",
              borderBottomColor: progress > 62.5 ? "#3B82F6" : "transparent",
              borderLeftColor: progress > 87.5 ? "#3B82F6" : "transparent",
              transform: [{ rotate: "-90deg" }],
            }}
          />
          {/* Center content */}
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-xl font-bold text-gray-900">{explored}</Text>
            <MutedText className="text-xs">of {total}</MutedText>
          </View>
        </View>

        <View className="mt-4 w-full">
          <SpaceBetweenRow className="mb-2">
            <RowLayout>
              <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
              <MutedText className="text-sm">Explored</MutedText>
            </RowLayout>
            <BodyText className="font-bold">{explored}</BodyText>
          </SpaceBetweenRow>
          <SpaceBetweenRow>
            <RowLayout>
              <View className="w-3 h-3 rounded-full bg-gray-200 mr-2" />
              <MutedText className="text-sm">Remaining</MutedText>
            </RowLayout>
            <BodyText className="font-bold">{remaining}</BodyText>
          </SpaceBetweenRow>
        </View>
      </View>
    </Card>
  );
};

// Achievement badge component
const AchievementBadge = ({
  title,
  description,
  isUnlocked,
  icon,
  progress,
}: {
  title: string;
  description: string;
  isUnlocked: boolean;
  icon: React.ReactNode;
  progress?: number;
}) => {
  return (
    <View
      className={`p-4 rounded-2xl border ${
        isUnlocked
          ? "bg-yellow-50 border-yellow-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <View className="flex-row items-center mb-3">
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

      {!isUnlocked && progress !== undefined && (
        <View className="mt-2">
          <SpaceBetweenRow className="mb-1">
            <MutedText className="text-xs">Progress</MutedText>
            <MutedText className="text-xs">{progress}%</MutedText>
          </SpaceBetweenRow>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

// Main Statistics Screen Component
const StatisticsScreen: React.FC = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("Month");

  // Sample data for various charts
  const weeklyStepsData = [8420, 12350, 6780, 15200, 9870, 11450, 13200];
  const heatmapData = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => Math.random())
  );

  const comparisonData = [
    {
      label: "Daily Steps",
      current: 8500,
      previous: 7200,
      color: "#10B981",
    },
    {
      label: "Streets Explored",
      current: 12,
      previous: 8,
      color: "#3B82F6",
    },
    {
      label: "Distance (km)",
      current: 65,
      previous: 52,
      color: "#F59E0B",
    },
  ];

  const goalSegments = [
    { label: "Steps", value: 8500, max: 10000, color: "#10B981" },
    { label: "Streets", value: 12, max: 15, color: "#3B82F6" },
    { label: "Distance", value: 65, max: 80, color: "#F59E0B" },
  ];

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
      progress: 72,
    },
    {
      title: "Consistency King",
      description: "Maintain a 30-day streak",
      isUnlocked: false,
      icon: <Feather name="calendar" size={20} color="#6B7280" />,
      progress: 43,
    },
  ];

  return (
    <PageContainer>
      <StatusBar barStyle="light-content" backgroundColor="#fafafa" />

      <Header title="Stats" />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <SectionSpacing className="mt-6">
          <TimePeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </SectionSpacing>

        {/* Key Metrics Row 1 with Mini Charts */}
        <SectionSpacing>
          <View className="flex-row">
            <StatsCard
              title="Total Steps"
              value={currentStats.totalSteps}
              unit="steps"
              trend={{ value: "12%", isPositive: true }}
              icon={<Feather name="activity" size={16} color="white" />}
              color="green"
              showMiniChart={true}
              chartData={weeklyStepsData}
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

        {/* Daily Steps Chart */}
        <SectionSpacing>
          <DailyStepsChart data={weeklyStepsData} />
        </SectionSpacing>

        {/* Goals and Progress Section */}
        <SectionSpacing>
          <View className="flex-row">
            <View className="flex-1 mr-2">
              <Card>
                <CardTitle className="mb-4">Weekly Goal</CardTitle>
                <View className="items-center">
                  <WeeklyGoalRing currentSteps={68420} goalSteps={70000} />
                  <MutedText className="text-xs mt-2 text-center">
                    1,580 steps to go!
                  </MutedText>
                </View>
              </Card>
            </View>
            <View className="flex-1 ml-2">
              <Card>
                <CardTitle className="mb-4">Goals Overview</CardTitle>
                <RadialProgress segments={goalSegments} size={120} />
              </Card>
            </View>
          </View>
        </SectionSpacing>

        {/* Progress Bars Section */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Monthly Progress</CardTitle>
            <View className="space-y-4">
              <AnimatedProgressBar
                progress={85}
                color="#10B981"
                label="Step Goal"
                value="85%"
              />
              <AnimatedProgressBar
                progress={67}
                color="#3B82F6"
                label="Distance Goal"
                value="67%"
              />
              <AnimatedProgressBar
                progress={92}
                color="#F59E0B"
                label="Exploration Goal"
                value="92%"
              />
              <AnimatedProgressBar
                progress={34}
                color="#EF4444"
                label="Consistency Goal"
                value="34%"
              />
            </View>
          </Card>
        </SectionSpacing>

        {/* Comparison Bars */}
        <SectionSpacing>
          <ComparisonBars data={comparisonData} />
        </SectionSpacing>

        {/* Activity Heatmap */}
        <SectionSpacing>
          <WeeklyHeatmap data={heatmapData} />
        </SectionSpacing>

        {/* Street Exploration Donut */}
        <SectionSpacing>
          <StreetExplorationDonut explored={127} total={450} />
        </SectionSpacing>

        {/* Peak Performance Stats */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Peak Performance</CardTitle>
            <View className="space-y-4">
              <View className="flex-row justify-between items-center p-3 bg-green-50 rounded-xl">
                <RowLayout>
                  <IconContainer size="small" color="green">
                    <Ionicons name="trophy" size={16} color="#10B981" />
                  </IconContainer>
                  <View className="ml-3">
                    <BodyText className="font-bold">Best Day</BodyText>
                    <MutedText className="text-xs">
                      Most steps in a day
                    </MutedText>
                  </View>
                </RowLayout>
                <View className="items-end">
                  <Text className="text-lg font-bold text-green-700">
                    15,230
                  </Text>
                  <MutedText className="text-xs">Dec 15</MutedText>
                </View>
              </View>

              <View className="flex-row justify-between items-center p-3 bg-blue-50 rounded-xl">
                <RowLayout>
                  <IconContainer size="small" color="blue">
                    <Ionicons name="map" size={16} color="#3B82F6" />
                  </IconContainer>
                  <View className="ml-3">
                    <BodyText className="font-bold">
                      Exploration Record
                    </BodyText>
                    <MutedText className="text-xs">
                      Most streets in a day
                    </MutedText>
                  </View>
                </RowLayout>
                <View className="items-end">
                  <Text className="text-lg font-bold text-blue-700">28</Text>
                  <MutedText className="text-xs">Nov 22</MutedText>
                </View>
              </View>

              <View className="flex-row justify-between items-center p-3 bg-yellow-50 rounded-xl">
                <RowLayout>
                  <IconContainer size="small" color="accent">
                    <MaterialIcons
                      name="straighten"
                      size={16}
                      color="#F59E0B"
                    />
                  </IconContainer>
                  <View className="ml-3">
                    <BodyText className="font-bold">Longest Journey</BodyText>
                    <MutedText className="text-xs">
                      Single session distance
                    </MutedText>
                  </View>
                </RowLayout>
                <View className="items-end">
                  <Text className="text-lg font-bold text-yellow-700">
                    12.4 km
                  </Text>
                  <MutedText className="text-xs">Oct 8</MutedText>
                </View>
              </View>
            </View>
          </Card>
        </SectionSpacing>

        {/* Circular Progress Metrics */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Current Targets</CardTitle>
            <View className="flex-row justify-around">
              <CircularProgress
                progress={78}
                color="#10B981"
                label="steps"
                value="7.8k"
                size={90}
              />
              <CircularProgress
                progress={45}
                color="#3B82F6"
                label="streets"
                value="9/20"
                size={90}
              />
              <CircularProgress
                progress={92}
                color="#F59E0B"
                label="distance"
                value="18.4km"
                size={90}
              />
            </View>
          </Card>
        </SectionSpacing>

        {/* Detailed Stats with Enhanced Visuals */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Detailed Statistics</CardTitle>
            <View className="space-y-4">
              <View className="p-3 bg-gray-50 rounded-xl">
                <SpaceBetweenRow className="mb-2">
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
                <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "75%" }}
                  />
                </View>
              </View>

              <View className="p-3 bg-gray-50 rounded-xl">
                <SpaceBetweenRow className="mb-2">
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
                <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "60%" }}
                  />
                </View>
              </View>

              <View className="p-3 bg-gray-50 rounded-xl">
                <SpaceBetweenRow className="mb-2">
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
                <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: "82%" }}
                  />
                </View>
              </View>
            </View>
          </Card>
        </SectionSpacing>

        {/* Weekly Streaks Visualization */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Weekly Activity Streaks</CardTitle>
            <View className="flex-row justify-between mb-4">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, index) => {
                  const isActive = [true, true, false, true, true, true, false][
                    index
                  ];
                  const intensity = [0.8, 0.6, 0, 0.9, 0.7, 0.5, 0][index];
                  return (
                    <View key={day} className="items-center">
                      <View
                        className={`w-8 h-8 rounded-lg mb-2 ${
                          isActive ? "bg-green-500" : "bg-gray-200"
                        }`}
                        style={{
                          opacity: isActive ? intensity : 0.3,
                        }}
                      />
                      <MutedText className="text-xs">{day}</MutedText>
                    </View>
                  );
                }
              )}
            </View>
            <View className="bg-gray-50 p-3 rounded-xl">
              <SpaceBetweenRow>
                <BodyText className="font-medium">Current Streak</BodyText>
                <View className="flex-row items-center">
                  <Ionicons name="flame" size={16} color="#F59E0B" />
                  <Text className="text-lg font-bold text-orange-600 ml-1">
                    5 days
                  </Text>
                </View>
              </SpaceBetweenRow>
            </View>
          </Card>
        </SectionSpacing>

        {/* Time Distribution Pie Chart Visual */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Time Distribution</CardTitle>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="space-y-3">
                  {[
                    {
                      label: "Morning",
                      percentage: 35,
                      color: "#10B981",
                      time: "6-12 AM",
                    },
                    {
                      label: "Afternoon",
                      percentage: 45,
                      color: "#3B82F6",
                      time: "12-6 PM",
                    },
                    {
                      label: "Evening",
                      percentage: 20,
                      color: "#F59E0B",
                      time: "6-10 PM",
                    },
                  ].map((item, index) => (
                    <View key={index}>
                      <SpaceBetweenRow className="mb-1">
                        <RowLayout>
                          <View
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          />
                          <BodyText className="text-sm font-medium">
                            {item.label}
                          </BodyText>
                        </RowLayout>
                        <View className="items-end">
                          <Text className="text-sm font-bold">
                            {item.percentage}%
                          </Text>
                          <MutedText className="text-xs">{item.time}</MutedText>
                        </View>
                      </SpaceBetweenRow>
                      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              <View className="ml-4">
                <CircularProgress
                  progress={85}
                  color="#8B5CF6"
                  label="active"
                  value="85%"
                  size={100}
                />
              </View>
            </View>
          </Card>
        </SectionSpacing>

        {/* Achievements Section with Progress */}
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
                  progress={achievement.progress}
                />
              ))}
            </View>
          </Card>
        </SectionSpacing>

        {/* Personal Records */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Personal Records</CardTitle>
            <View className="grid grid-cols-2 gap-3">
              <View className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                <IconContainer size="small" color="neutral" className="mb-2">
                  <Ionicons name="flash" size={16} color="#8B5CF6" />
                </IconContainer>
                <Text className="text-lg font-bold text-purple-700">
                  15,230
                </Text>
                <MutedText className="text-xs">Max Steps/Day</MutedText>
              </View>

              <View className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl">
                <IconContainer size="small" color="neutral" className="mb-2">
                  <Ionicons name="time" size={16} color="#EC4899" />
                </IconContainer>
                <Text className="text-lg font-bold text-pink-700">4.2h</Text>
                <MutedText className="text-xs">Longest Session</MutedText>
              </View>

              <View className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl">
                <IconContainer size="small" color="neutral" className="mb-2">
                  <Ionicons name="speedometer" size={16} color="#6366F1" />
                </IconContainer>
                <Text className="text-lg font-bold text-indigo-700">8.2</Text>
                <MutedText className="text-xs">Max km/h</MutedText>
              </View>

              <View className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl">
                <IconContainer size="small" color="neutral" className="mb-2">
                  <Ionicons name="calendar" size={16} color="#14B8A6" />
                </IconContainer>
                <Text className="text-lg font-bold text-teal-700">28</Text>
                <MutedText className="text-xs">Day Streak</MutedText>
              </View>
            </View>
          </Card>
        </SectionSpacing>

        {/* Monthly Comparison Chart */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Monthly Comparison</CardTitle>
            <View className="space-y-3">
              {[
                { month: "Jan", steps: 145000, color: "#10B981" },
                { month: "Feb", steps: 167000, color: "#3B82F6" },
                { month: "Mar", steps: 134000, color: "#F59E0B" },
                { month: "Apr", steps: 189000, color: "#EF4444" },
                { month: "May", steps: 198000, color: "#8B5CF6" },
              ].map((item, index) => {
                const maxSteps = 200000;
                const width = (item.steps / maxSteps) * 100;
                return (
                  <View key={index}>
                    <SpaceBetweenRow className="mb-1">
                      <BodyText className="font-medium">{item.month}</BodyText>
                      <BodyText className="font-bold">
                        {(item.steps / 1000).toFixed(0)}k
                      </BodyText>
                    </SpaceBetweenRow>
                    <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${width}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
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

              <TouchableOpacity className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl">
                <RowLayout>
                  <IconContainer size="small" color="accent">
                    <Ionicons name="stats-chart" size={16} color="#F59E0B" />
                  </IconContainer>
                  <BodyText className="ml-3">Generate Report</BodyText>
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
