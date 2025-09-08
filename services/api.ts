import { Settings } from "@/types/settings";
import {
  SaveStreetVisitStatsRequest,
  StreetVisitApiResponse,
  UpdateUserActiveHoursRequest,
} from "@/types/streetVisitStats";
import {
  SaveStationarySessionsRequest,
  SaveTimeSpentLocationsRequest,
  TimeSpentAnalyticsResponse,
  TimeSpentLocationResponse,
} from "@/types/timeSpentTraker";
import { CityStat, Friend, UserData } from "@/types/user";
import { SaveVisitedStreetsRequest } from "@/types/world";

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.EXPO_PUBLIC_CITYSTAT_API_URL || "http://localhost:3000/api";
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { token?: string }
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    };
    // console.log("Tocken " + token);

    console.log(`Making request to: ${this.baseUrl}${endpoint}`);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      let errorText: string;
      try {
        errorText = await response.text();
      } catch (readError) {
        errorText = `HTTP ${response.status} ${response.statusText}`;
      }

      console.log(`Error response: ${errorText}`);

      if (response.status === 404) {
        throw new Error("USER_NOT_FOUND");
      }

      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    try {
      const data = await response.json();
      console.log(`Success response:`, data);
      return data;
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError);
      throw new Error("Invalid JSON response from server");
    }
  }

  async fetchUser(token: string, retries = 3): Promise<UserData> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Fetch user attempt ${attempt + 1}/${retries + 1}`);

        return await this.makeRequest<UserData>("/api/user", {
          method: "GET",
          token,
        });
      } catch (err) {
        const isLastAttempt = attempt === retries;

        console.warn(`Attempt ${attempt + 1} failed:`, err);

        if (isLastAttempt) {
          throw err;
        }

        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    throw new Error("Unexpected fetch failure");
  }

  async fetchUserSettings(token: string): Promise<Settings> {
    console.log(`Fetch user settings`);

    return this.makeRequest<Settings>("/api/settings", {
      method: "GET",
      token,
    });
  }

  async createUser(
    userData: Partial<UserData>,
    token: string
  ): Promise<UserData> {
    console.log("Creating user with data:", userData);

    return this.makeRequest<UserData>("/api/user", {
      method: "POST",
      token,
      body: JSON.stringify(userData),
    });
  }

  async updateUserDetails(
    updates: Partial<UserData>,
    token: string
  ): Promise<UserData> {
    return this.makeRequest<UserData>("/api/user/details", {
      method: "PUT",
      token,
      body: JSON.stringify(updates),
    });
  }

  async updateUserProfile(updates: any, token: string): Promise<UserData> {
    console.log("In updateUserProfile, updates: " + updates);
    console.log("to url: ... api/user, with PUT");
    return this.makeRequest<UserData>("/api/settings", {
      method: "PUT",
      token,
      body: JSON.stringify(updates),
    });
  }

  async updateUserSettings(updates: any, token: string): Promise<any> {
    console.log("In updateUserSettings, updates: " + updates);
    console.log("to url: ... api/user, with PUT");
    return this.makeRequest<any>("/api/user/settings", {
      method: "PUT",
      token,
      body: JSON.stringify(updates),
    });
  }

  // Generic field update method
  async updateUserField(
    field: string,
    value: any,
    token: string
  ): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/settings/${field}`, {
      method: "PUT",
      token,
      body: JSON.stringify({ [field]: value }),
    });
  }

  async updateUserNote(value: any, token: string): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/user/note`, {
      method: "PUT",
      token,
      body: JSON.stringify({ newNote: value }),
    });
  }

  // City Stats API methods
  async updateCityStats(
    userId: string,
    cityStats: Partial<CityStat>,
    token: string
  ): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/users/${userId}/city-stats`, {
      method: "PUT",
      token,
      body: JSON.stringify(cityStats),
    });
  }

  // Friends API methods
  async addFriend(
    userId: string,
    friendId: string,
    token: string
  ): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/users/${userId}/friends`, {
      method: "POST",
      token,
      body: JSON.stringify({ friendId }),
    });
  }

  async removeFriend(
    userId: string,
    friendId: string,
    token: string
  ): Promise<UserData> {
    return this.makeRequest<UserData>(
      `/api/users/${userId}/friends/${friendId}`,
      {
        method: "DELETE",
        token,
      }
    );
  }

  async searchUsers(searchQuery: string, token: string): Promise<UserData[]> {
    const response = await this.makeRequest<{ users: UserData[] }>(
      `/api/users/search?username=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        token,
      }
    );

    return response.users || [];
  }

  async addFriendByUser(
    friendId: string,
    token: string
  ): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/api/friends/add`, {
      method: "POST",
      token,
      body: JSON.stringify({
        friendId: friendId,
      }),
    });
  }

  async getFriends(token: string): Promise<Friend[]> {
    const response = await this.makeRequest<{ friends: Friend[] }>(
      `/api/friends/list`,
      {
        method: "GET",
        token,
      }
    );
    return response.friends;
  }

  async fetchOtherUserProfile(
    otherUserId: string,
    token: string
  ): Promise<any> {
    return this.makeRequest<any>(`/api/friends/profile`, {
      method: "POST",
      token,
      body: JSON.stringify({ otherUserId }),
    });
  }

  async saveLocationPermission(
    hasPermission: boolean,
    token: string
  ): Promise<any> {
    return this.makeRequest<any>(`/api/visitor/locationPermission`, {
      method: "POST",
      token,
      body: JSON.stringify({ hasLocationPermission: hasPermission }),
    });
  }

  async getLocationPermission(token: string): Promise<any> {
    return this.makeRequest<any>(`/api/visitor/locationPermission`, {
      method: "GET",
      token,
    });
  }

  async saveVisitedStreets(
    visitedStreets: SaveVisitedStreetsRequest,
    token: string
  ): Promise<any> {
    return this.makeRequest<any>(`/api/visitor/streets`, {
      method: "POST",
      token,
      body: JSON.stringify({
        sessionId: visitedStreets.sessionId,
        visitedStreets: visitedStreets.visitedStreets,
      }),
    });
  }

  async fetchVisitedStreets(token: string): Promise<any> {
    return this.makeRequest<any>(`/api/visitor/streets`, {
      method: "GET",
      token,
    });
  }

  async fetchUsersSameCity(token: string): Promise<any> {
    return this.makeRequest<any>(`/api/users/sameCity`, {
      method: "GET",
      token,
    });
  }

  async fetchRank(token: string): Promise<any> {
    return this.makeRequest<any>(`/api/rank`, {
      method: "GET",
      token,
    });
  }

  async fetchRankProgress(token: string): Promise<any> {
    return this.makeRequest<any>(`/api/rank/progress`, {
      method: "GET",
      token,
    });
  }

  async fetchLeaderboard(token: string): Promise<any> {
    return this.makeRequest<any>(`/api/rank/leaderboard`, {
      method: "GET",
      token,
    });
  }

  async fetchLocalLeaderboard(token: string): Promise<any> {
    return this.makeRequest<any>(`/api/rank/leaderboard/local`, {
      method: "GET",
      token,
    });
  }

  async get2MainStats(token: string): Promise<any> {
    return this.makeRequest<any>(`/api/analytics/main2stats`, {
      method: "GET",
      token,
    });
  }

  async getMainRadarChartData(token: string): Promise<any> {
    return this.makeRequest<any>(`/api/analytics/mainRadarChartData`, {
      method: "GET",
      token,
    });
  }


  


  public async updateUserActiveHours(
    request: UpdateUserActiveHoursRequest,
    token: string
  ): Promise<StreetVisitApiResponse> {
    return this.makeRequest<any>(`/api/users/activeHours`, {
      method: "PUT",
      token,
      body: JSON.stringify(request),
    });
  }

  async getStreetVisitStats(token: string): Promise<StreetVisitApiResponse> {
    return this.makeRequest<any>(`/api/streets/visitStats`, {
      method: "GET",
      token,
    });
  }

  async saveStreetVisitStats(
    request: SaveStreetVisitStatsRequest,
    token: string
  ): Promise<StreetVisitApiResponse> {
    return this.makeRequest<any>(`/api/streets/visitStats`, {
      method: "POST",
      token,
      body: JSON.stringify(request),
    });
  }

  async saveTimeSpentLocations(
    request: SaveTimeSpentLocationsRequest,
    token: string
  ): Promise<{ savedLocations?: number; message?: string }> {
    return this.makeRequest<any>(`/api/timeSpent/locations`, {
      method: "POST",
      token,
      body: JSON.stringify(request),
    });
  }

  // Save stationary sessions to database
  async saveStationarySessions(
    request: SaveStationarySessionsRequest,
    token: string
  ): Promise<{ savedSessions?: number; message?: string }> {
    return this.makeRequest<any>(`/api/timeSpent/sessions`, {
      method: "POST",
      token,
      body: JSON.stringify(request),
    });
  }

  // Get user's time spent locations
  async getTimeSpentLocations(
    token: string,
    options?: {
      limit?: number;
      sortBy?: "totalTime" | "visitCount" | "recent";
      minTimeSpent?: number; // minimum seconds
    }
  ): Promise<TimeSpentLocationResponse[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.sortBy) params.append("sortBy", options.sortBy);
    if (options?.minTimeSpent)
      params.append("minTimeSpent", options.minTimeSpent.toString());

    return this.makeRequest<any>(
      `/api/timeSpent/locations${params.toString()}`,
      {
        method: "GET",
        token,
      }
    );
  }

  // Get time spent analytics
  async getTimeSpentAnalytics(
    token: string,
    options?: {
      startDate?: string; // ISO date string
      endDate?: string; // ISO date string
      includeHourlyPattern?: boolean;
      includeWeeklyPattern?: boolean;
    }
  ): Promise<TimeSpentAnalyticsResponse | null> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);
    if (options?.includeHourlyPattern)
      params.append("includeHourlyPattern", "true");
    if (options?.includeWeeklyPattern)
      params.append("includeWeeklyPattern", "true");

    return this.makeRequest<any>(
      `/api/analytics/timeSpent${params.toString()}`,
      {
        method: "GET",
        token,
      }
    );
  }

  // Update location details (name, category, etc.)
  async updateTimeSpentLocation(
    locationId: string,
    updates: {
      placeName?: string;
      address?: string;
      placeType?: string;
    },
    token: string
  ): Promise<{ message?: string }> {
    return this.makeRequest<any>(`/api/timeSpent/locations${locationId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(updates),
    });
  }

  // Get nearby time spent locations (for finding existing locations when creating new ones)
  async getNearbyTimeSpentLocations(
    latitude: number,
    longitude: number,
    radiusMeters: number,
    token: string
  ): Promise<TimeSpentLocationResponse[]> {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radiusMeters.toString(),
    });

    return this.makeRequest<any>(
      `/api/timeSpent/locations/nearby${params.toString()}`,
      {
        method: "GET",
        token,
      }
    );
  }
}

export const apiService = new ApiService();
