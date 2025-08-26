import React, { createContext, useContext, useMemo } from "react";
import { View, Text, ViewProps, TextProps } from "react-native";
import { cn } from "@/utils/cn";

// Chart configuration types
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

// Chart context for sharing config
type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = createContext<ChartContextProps | null>(null);

// Hook to use chart context
export function useChart() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

// Main chart container component
export function ChartContainer({
  className,
  children,
  config,
  ...props
}: ViewProps & {
  config: ChartConfig;
  className?: string;
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <View
        className={cn(
          "flex justify-center items-center bg-white rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </View>
    </ChartContext.Provider>
  );
}

// Tooltip component for displaying data on hover/touch
export function ChartTooltip({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  labelFormatter,
  formatter,
  ...props
}: ViewProps & {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line" | "dashed";
  labelFormatter?: (label: any) => React.ReactNode;
  formatter?: (value: any, name: any) => React.ReactNode;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <View
      className={cn(
        "bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg min-w-32",
        className
      )}
      {...props}
    >
      {!hideLabel && label && (
        <Text className="text-sm font-medium text-gray-900 mb-2">
          {labelFormatter ? labelFormatter(label) : label}
        </Text>
      )}
      <View className="space-y-1">
        {payload.map((item, index) => (
          <View key={index} className="flex flex-row items-center gap-2">
            {!hideIndicator && (
              <View
                className={cn(
                  "rounded-sm",
                  {
                    "w-3 h-3": indicator === "dot",
                    "w-4 h-1": indicator === "line",
                    "w-4 h-0 border border-dashed": indicator === "dashed",
                  }
                )}
                style={{
                  backgroundColor: indicator !== "dashed" ? item.color : "transparent",
                  borderColor: indicator === "dashed" ? item.color : "transparent",
                }}
              />
            )}
            <View className="flex flex-row justify-between flex-1">
              <Text className="text-sm text-gray-600">
                {item.name}
              </Text>
              <Text className="text-sm font-medium text-gray-900 ml-4">
                {formatter ? formatter(item.value, item.name) : item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Tooltip content component (wrapper for easier usage)
export function ChartTooltipContent(props: React.ComponentProps<typeof ChartTooltip>) {
  return <ChartTooltip {...props} />;
}

// Legend component for displaying chart series info
export function ChartLegend({
  payload,
  className,
  hideIcon = false,
  verticalAlign = "bottom",
  orientation = "horizontal",
  ...props
}: ViewProps & {
  payload?: Array<{
    value?: string;
    color?: string;
    dataKey?: string;
  }>;
  className?: string;
  hideIcon?: boolean;
  verticalAlign?: "top" | "bottom";
  orientation?: "horizontal" | "vertical";
}) {
  if (!payload?.length) {
    return null;
  }

  return (
    <View
      className={cn(
        "flex items-center justify-center gap-4",
        {
          "pb-3": verticalAlign === "top",
          "pt-3": verticalAlign === "bottom",
          "flex-row": orientation === "horizontal",
          "flex-col": orientation === "vertical",
        },
        className
      )}
      {...props}
    >
      {payload.map((item, index) => (
        <View key={index} className="flex flex-row items-center gap-2">
          {!hideIcon && (
            <View
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
          )}
          <Text className="text-sm text-gray-600">{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

// Legend content component (wrapper for easier usage)
export function ChartLegendContent(props: React.ComponentProps<typeof ChartLegend>) {
  const { config } = useChart();
  
  return <ChartLegend {...props} />;
}

// Helper function to get color from config
export function getChartColor(key: string, config: ChartConfig): string {
  return config[key]?.color || "#8b5cf6";
}

// Helper function to format chart data
export function formatChartValue(value: number | string, type: "number" | "currency" | "percentage" = "number"): string {
  if (typeof value === "string") return value;
  
  switch (type) {
    case "currency":
      return `$${value.toLocaleString()}`;
    case "percentage":
      return `${value}%`;
    default:
      return value.toLocaleString();
  }
}

// Chart grid component for background lines
export function ChartGrid({
  className,
  horizontal = true,
  vertical = false,
  strokeColor = "#e5e7eb",
  ...props
}: ViewProps & {
  className?: string;
  horizontal?: boolean;
  vertical?: boolean;
  strokeColor?: string;
}) {
  return (
    <View
      className={cn("absolute inset-0 pointer-events-none", className)}
      {...props}
    >
      {/* This would be implemented with SVG lines in a real chart */}
      {/* For now, it's a placeholder for the grid concept */}
    </View>
  );
}

// Example usage component showing how to use these components
export const ChartExample = () => {
  const chartConfig: ChartConfig = {
    desktop: {
      label: "Desktop",
      color: "#8b5cf6",
    },
    mobile: {
      label: "Mobile",
      color: "#06b6d4",
    },
  };

  const sampleTooltipPayload = [
    { name: "Desktop", value: 400, color: "#8b5cf6" },
    { name: "Mobile", value: 300, color: "#06b6d4" },
  ];

  const sampleLegendPayload = [
    { value: "Desktop", color: "#8b5cf6" },
    { value: "Mobile", color: "#06b6d4" },
  ];

  return (
    <ChartContainer config={chartConfig} className="p-4">
      <View className="w-full">
        <Text className="text-lg font-bold mb-4">Chart Example</Text>
        
        {/* Example tooltip */}
        <View className="mb-4">
          <Text className="text-sm font-medium mb-2">Tooltip Example:</Text>
          <ChartTooltip
            active={true}
            payload={sampleTooltipPayload}
            label="January 2024"
          />
        </View>

        {/* Example legend */}
        <View className="mb-4">
          <Text className="text-sm font-medium mb-2">Legend Example:</Text>
          <ChartLegend payload={sampleLegendPayload} />
        </View>

        {/* Chart area placeholder */}
        <View className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
          <Text className="text-gray-500">Chart visualization would go here</Text>
        </View>
      </View>
    </ChartContainer>
  );
};