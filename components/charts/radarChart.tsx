import React, { useEffect, useState } from "react";

import { View, Text } from "react-native";
import Svg, {
  Polygon,
  Circle,
  Text as SvgText,
  Line,
  G,
} from "react-native-svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getGridPoints,
  getLabelPosition,
  getPolygonPoints,
} from "@/utils/charts/radarChart";
import { useUserData } from "@/Providers/UserDataProvider";

interface CustomRadarChartProps {
  data: any[];
  size: number;
}

interface ChartDataItem {
  month: string;
  desktop: number;
  mobile: number;
}

interface MainChartData {
  currentMonth: {
    total: number;
    monthName: string;
    intervals: Record<string, number>;
  };
  previousMonth: {
    total: number;
    monthName: string;
    intervals: Record<string, number>;
  };
}

// Helper function to ensure valid numbers
const ensureValidNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

// Helper function to validate polygon points
const validatePolygonPoints = (points: number[][]): string => {
  return points
    .map(([x, y]) => `${ensureValidNumber(x)},${ensureValidNumber(y)}`)
    .join(" ");
};

const CustomRadarChart: React.FC<CustomRadarChartProps> = ({ data, size }) => {
  const center = size / 2;
  const maxRadius = center - 50;
  
  // Ensure all data values are valid numbers
  const sanitizedData = data.map(item => ({
    ...item,
    desktop: ensureValidNumber(item.desktop),
    mobile: ensureValidNumber(item.mobile)
  }));
  
  // Calculate maxValue with fallback
  const allValues = sanitizedData.flatMap((d) => [d.desktop, d.mobile]);
  const maxValue = Math.max(...allValues, 1); // Ensure maxValue is at least 1

  const desktopPoints = getPolygonPoints(
    sanitizedData.map((d) => d.desktop),
    center,
    maxRadius,
    maxValue
  );
  
  const mobilePoints = getPolygonPoints(
    sanitizedData.map((d) => d.mobile),
    center,
    maxRadius,
    maxValue
  );

  // Validate that points are valid before rendering
  const validDesktopPoints = Array.isArray(desktopPoints) && desktopPoints.length > 0;
  const validMobilePoints = Array.isArray(mobilePoints) && mobilePoints.length > 0;

  return (
    <Svg width={size} height={size}>
      <G>
        {/* Grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
          <Polygon
            key={i}
            points={getGridPoints(scale, center, maxRadius, sanitizedData)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {sanitizedData.map((_, index) => {
          const angle = (index * 2 * Math.PI) / sanitizedData.length - Math.PI / 2;
          const x2 = center + Math.cos(angle) * maxRadius;
          const y2 = center + Math.sin(angle) * maxRadius;
          return (
            <Line
              key={index}
              x1={center}
              y1={center}
              x2={ensureValidNumber(x2)}
              y2={ensureValidNumber(y2)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Desktop data polygon */}
        {validDesktopPoints && (
          <Polygon
            points={validatePolygonPoints(desktopPoints)}
            fill="#1F2937"
            fillOpacity="0.3"
            stroke="#1F2937"
            strokeWidth="2"
          />
        )}

        {/* Mobile data polygon */}
        {validMobilePoints && (
          <Polygon
            points={validatePolygonPoints(mobilePoints)}
            fill="#c8f751"
            fillOpacity="0.3"
            stroke="#c8f751"
            strokeWidth="2"
          />
        )}

        {/* Data points */}
        {validDesktopPoints &&
          desktopPoints.map(([x, y], index) => (
            <Circle
              key={`desktop-${index}`}
              cx={ensureValidNumber(x)}
              cy={ensureValidNumber(y)}
              r="3"
              fill="#1F2937"
            />
          ))}
        {validMobilePoints &&
          mobilePoints.map(([x, y], index) => (
            <Circle
              key={`mobile-${index}`}
              cx={ensureValidNumber(x)}
              cy={ensureValidNumber(y)}
              r="3"
              fill="#c8f751"
            />
          ))}

        {/* Month labels */}
        {sanitizedData.map((item, index) => {
          const pos = getLabelPosition(index, center, maxRadius, sanitizedData);
          return (
            <SvgText
              key={index}
              x={ensureValidNumber(pos.x)}
              y={ensureValidNumber(pos.y) + 4}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              {item.month.substring(0, 5)}
            </SvgText>
          );
        })}
      </G>
    </Svg>
  );
};

export function ChartRadar() {
  const { userData, isLoading, getMainRadarChartData } = useUserData();
  const [mainChartData, setMainChartData] = useState<MainChartData | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  // Transform API data to chart format
  const transformDataForChart = (apiData: MainChartData | null): ChartDataItem[] => {
    if (!apiData || !apiData.currentMonth || !apiData.previousMonth) {
      return [];
    }

    const intervals = ["1-6", "7-11", "12-16", "17-21", "22-26", "27-31"];

    return intervals.map((interval) => ({
      month: interval,
      desktop: ensureValidNumber(apiData.previousMonth.intervals[interval]), // Previous month data
      mobile: ensureValidNumber(apiData.currentMonth.intervals[interval]), // Current month data
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mainChartData = await getMainRadarChartData();
        console.log("main chart data:", mainChartData);

        setMainChartData(mainChartData);

        // Transform the data for the chart
        const transformedData = transformDataForChart(mainChartData);
        setChartData(transformedData);
      } catch (error) {
        console.error("Error fetching main chart data:", error);
        // Set fallback empty data
        setChartData([
          { month: "1-6", desktop: 0, mobile: 0 },
          { month: "7-11", desktop: 0, mobile: 0 },
          { month: "12-16", desktop: 0, mobile: 0 },
          { month: "17-21", desktop: 0, mobile: 0 },
          { month: "22-26", desktop: 0, mobile: 0 },
          { month: "27-31", desktop: 0, mobile: 0 },
        ]);
      }
    };

    fetchData();
  }, [userData]);

  // Calculate trend percentage
  const calculateTrend = () => {
    if (!mainChartData) return { percentage: "0", direction: "up" as const };

    const currentTotal = ensureValidNumber(mainChartData.currentMonth?.total);
    const previousTotal = ensureValidNumber(mainChartData.previousMonth?.total);

    if (previousTotal === 0) {
      return currentTotal > 0
        ? { percentage: "100", direction: "up" as const }
        : { percentage: "0", direction: "up" as const };
    }

    const percentage = ((currentTotal - previousTotal) / previousTotal) * 100;
    return {
      percentage: Math.abs(percentage).toFixed(1),
      direction: (percentage >= 0 ? "up" : "down"),
    };
  };

  const trend = calculateTrend();

  // Show loading state
  if (isLoading || chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="items-center">
          <CardTitle>Street Coverage Distribution</CardTitle>
          <CardDescription>
            Distribution of street coverage over the past month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 280,
            }}
          >
            <Text>Loading chart data...</Text>
          </View>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Street Coverage Distribution</CardTitle>
        <CardDescription>
          Distribution of street coverage over the past month
        </CardDescription>
      </CardHeader>

      <CardContent>
        <View style={{ alignItems: "center" }}>
          <CustomRadarChart data={chartData} size={280} />
        </View>

        {/* Legend */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 24,
            marginTop: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#1F2937",
                borderRadius: 6,
              }}
            />
            <Text style={{ fontSize: 14, color: "#333" }}>
              {mainChartData?.previousMonth?.monthName || "Previous Month"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#c8f751",
                borderRadius: 6,
              }}
            />
            <Text style={{ fontSize: 14, color: "#333" }}>
              {mainChartData?.currentMonth?.monthName || "Current Month"}
            </Text>
          </View>
        </View>
      </CardContent>

      <CardFooter className="flex-col gap-2 pt-4">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-sm leading-none font-medium">
            {trend.direction === "up" ? "📈" : "📉"} Trending {trend.direction}{" "}
            by {trend.percentage}% this month
          </Text>
        </View>
        <View className="flex flex-row items-center gap-2">
          <Text className="text-sm text-muted-foreground leading-none">
            Comparing {mainChartData?.previousMonth?.monthName} vs{" "}
            {mainChartData?.currentMonth?.monthName}
          </Text>
        </View>
      </CardFooter>
    </Card>
  );
}