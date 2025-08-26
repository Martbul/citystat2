import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const CHART_WIDTH = screenWidth - 60;
const CHART_HEIGHT = 250;
const PADDING = 40;

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

export const AreaTwoLinerChart = () => {
  const [timeRange, setTimeRange] = useState("90d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  // Calculate scales
  const maxValue = Math.max(
    ...filteredData.map(d => Math.max(d.desktop + d.mobile, d.desktop, d.mobile))
  );
  const minValue = 0;

  const xScale = (index) => (index / (filteredData.length - 1)) * (CHART_WIDTH - PADDING * 2) + PADDING;
  const yScale = (value) => CHART_HEIGHT - PADDING - ((value - minValue) / (maxValue - minValue)) * (CHART_HEIGHT - PADDING * 2);

  // Generate paths for areas
  const generateAreaPath = (data, key, isStacked = false) => {
    let path = `M ${xScale(0)} ${yScale(isStacked ? data[0][key] + data[0].mobile : data[0][key])}`;
    
    data.forEach((item, index) => {
      const value = isStacked ? item[key] + item.mobile : item[key];
      path += ` L ${xScale(index)} ${yScale(value)}`;
    });
    
    // Close the path to create area
    if (isStacked) {
      for (let i = data.length - 1; i >= 0; i--) {
        path += ` L ${xScale(i)} ${yScale(data[i].mobile)}`;
      }
    } else {
      path += ` L ${xScale(data.length - 1)} ${yScale(0)}`;
      path += ` L ${xScale(0)} ${yScale(0)}`;
    }
    path += ' Z';
    
    return path;
  };

  const mobileAreaPath = generateAreaPath(filteredData, 'mobile');
  const desktopAreaPath = generateAreaPath(filteredData, 'desktop', true);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const timeRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
  ];

  return (
    <View className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">Area Chart - Interactive</Text>
          {/* <Text className="text-sm text-gray-600 mt-1">
            Showing total visitors for the selected period
          </Text> */}
        </View>
        
        {/* Time Range Selector */}
        <View className="flex bg-gray-100 rounded-lg p-1">
          {timeRangeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setTimeRange(option.value)}
              className={`px-3 py-2 rounded-md ${
                timeRange === option.value ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Text className={`text-xs ${
                timeRange === option.value ? 'text-gray-900 font-medium' : 'text-gray-600'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart */}
      <View className="p-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ width: Math.max(CHART_WIDTH, filteredData.length * 20) }}>
            <Svg width={Math.max(CHART_WIDTH, filteredData.length * 20)} height={CHART_HEIGHT}>
              <Defs>
                <LinearGradient id="mobileGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#1F2937" stopOpacity={0.8} />
                  <Stop offset="100%" stopColor="#1F2937" stopOpacity={0.1} />
                </LinearGradient>
                <LinearGradient id="desktopGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#c8f751" stopOpacity={0.8} />
                  <Stop offset="100%" stopColor="#c8f751" stopOpacity={0.1} />
                </LinearGradient>
              </Defs>

              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <Line
                  key={`grid-${index}`}
                  x1={PADDING}
                  y1={yScale(maxValue * ratio)}
                  x2={Math.max(CHART_WIDTH, filteredData.length * 20) - PADDING}
                  y2={yScale(maxValue * ratio)}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              ))}

              {/* Mobile area */}
              <Path
                d={mobileAreaPath}
                fill="url(#mobileGradient)"
                stroke="#3b82f6"
                strokeWidth={2}
              />

              {/* Desktop area */}
              <Path
                d={desktopAreaPath}
                fill="url(#desktopGradient)"
                stroke="#10b981"
                strokeWidth={2}
              />

              {/* Data points */}
              {filteredData.map((item, index) => (
                <React.Fragment key={`points-${index}`}>
                  <Circle
                    cx={xScale(index)}
                    cy={yScale(item.mobile)}
                    r={3}
                    fill="#3b82f6"
                  />
                  <Circle
                    cx={xScale(index)}
                    cy={yScale(item.desktop + item.mobile)}
                    r={3}
                    fill="#10b981"
                  />
                </React.Fragment>
              ))}

              {/* X-axis labels */}
              {filteredData.map((item, index) => {
                if (index % Math.ceil(filteredData.length / 6) === 0) {
                  return (
                    <SvgText
                      key={`label-${index}`}
                      x={xScale(index)}
                      y={CHART_HEIGHT - 10}
                      fontSize={10}
                      fill="#6b7280"
                      textAnchor="middle"
                    >
                      {formatDate(item.date)}
                    </SvgText>
                  );
                }
                return null;
              })}

              {/* Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <SvgText
                  key={`y-label-${index}`}
                  x={PADDING - 10}
                  y={yScale(maxValue * ratio) + 4}
                  fontSize={10}
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {Math.round(maxValue * ratio)}
                </SvgText>
              ))}
            </Svg>
          </View>
        </ScrollView>

        {/* Legend */}
        <View className="flex-row justify-center items-center mt-4 space-x-6">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-blue-500 rounded-sm mr-2" />
            <Text className="text-sm text-gray-600">Mobile</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-green-500 rounded-sm mr-2" />
            <Text className="text-sm text-gray-600">Desktop</Text>
          </View>
        </View>
      </View>
    </View>
  );
};