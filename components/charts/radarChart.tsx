import React from "react";
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
import { getGridPoints, getLabelPosition, getPolygonPoints } from "@/utils/charts/radarChart";

const chartData = [
  { month: "1-6", desktop: 186, mobile: 80 },
  { month: "7-11", desktop: 305, mobile: 200 },
  { month: "12-16", desktop: 237, mobile: 120 },
  { month: "17-21", desktop: 73, mobile: 190 },
  { month: "22-26", desktop: 209, mobile: 130 },
  { month: "27-31", desktop: 214, mobile: 140 },
];

interface CustomRadarChartProps {
  data: any[];
  size: number;
}

const CustomRadarChart: React.FC<CustomRadarChartProps> = ({ data, size }) => {
  const center = size / 2;
  const maxRadius = center - 50;
  const maxValue = Math.max(...data.flatMap((d) => [d.desktop, d.mobile]));

 const desktopPoints = getPolygonPoints(
   data.map((d) => d.desktop),
   center,
   maxRadius
   ,maxValue);
 const mobilePoints = getPolygonPoints(data.map((d) => d.mobile), center, maxRadius ,maxValue);

  return (
    <Svg width={size} height={size}>
      <G>
        {/* Grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
          <Polygon
            key={i}
            points={getGridPoints(scale, center, maxRadius, data)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {data.map((_, index) => {
          const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
          const x2 = center + Math.cos(angle) * maxRadius;
          const y2 = center + Math.sin(angle) * maxRadius;
          return (
            <Line
              key={index}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Desktop data polygon */}
        <Polygon
          points={desktopPoints.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="#1F2937"
          fillOpacity="0.3"
          stroke="#1F2937"
          strokeWidth="2"
        />

        {/* Mobile data polygon */}
        <Polygon
          points={mobilePoints.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="#c8f751"
          fillOpacity="0.3"
          stroke="#c8f751"
          strokeWidth="2"
        />

        {/* Data points */}
        {desktopPoints.map(([x, y], index) => (
          <Circle key={`desktop-${index}`} cx={x} cy={y} r="3" fill="#1F2937" />
        ))}
        {mobilePoints.map(([x, y], index) => (
          <Circle key={`mobile-${index}`} cx={x} cy={y} r="3" fill="#c8f751" />
        ))}

        {/* Month labels */}
        {data.map((item, index) => {
          const pos = getLabelPosition(index, center, maxRadius, data);
          return (
            <SvgText
              key={index}
              x={pos.x}
              y={pos.y + 4}
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
            <Text style={{ fontSize: 14, color: "#333" }}>Last Month</Text>
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
            <Text style={{ fontSize: 14, color: "#333" }}>Now</Text>
          </View>
        </View>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-4">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-sm leading-none font-medium">
            📈 Trending up by 5.2% this month
          </Text>
        </View>
        <View className="flex flex-row items-center gap-2">
          <Text className="text-sm text-muted-foreground leading-none">
            January - June 2024
          </Text>
        </View>
      </CardFooter>
    </Card>
  );
}