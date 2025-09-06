export interface CustomRadarChartProps {
  data: any[];
  size: number;
}

export interface ChartDataItem {
  month: string;
  desktop: number;
  mobile: number;
}

export interface MainChartData {
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