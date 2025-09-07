export interface UpdateUserActiveHoursRequest {
  activeHours: number;
}

export interface SaveStreetVisitStatsRequest {
  streetStats: Array<{
    streetId: string;
    streetName: string;
    visitCount: number;
    firstVisit: number;
    lastVisit: number;
    totalTimeSpent: number;
    averageTimeSpent: number;
  }>;
}

export interface StreetVisitApiResponse {
  status: "success" | "error";
  message?: string;
  data?: any;
}


