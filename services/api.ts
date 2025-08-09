import { SaveVisitedStreetsRequest } from "@/app/(tabs)/mapscreen";
import { Settings } from "@/types/settings";
import { CityStat, Friend, StreetWalk, UserData } from "@/types/user";

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

    console.log(`Making request to: ${this.baseUrl}${endpoint}`);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    console.log(`Response status: ${response.status}`);

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

  async addStreetWalk(
    userId: string,
    streetWalk: Omit<StreetWalk, "id" | "cityStatId">,
    token: string
  ): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/users/${userId}/street-walks`, {
      method: "POST",
      token,
      body: JSON.stringify(streetWalk),
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

  async saveVisitedStreets(visitedStreets: SaveVisitedStreetsRequest,token: string): Promise<any> {
    return this.makeRequest<any>(`/api/visitor/streets`, {
      method: "POST",
      token,
    });
  }
}

export const apiService = new ApiService();
