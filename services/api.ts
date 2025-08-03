import { UserData, CityStat, StreetWalk } from "@/types/user";
import { Settings, Theme, Language } from "@/types/settings";

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_CITYSTAT_API_URL || "http://localhost:3000/api";
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("USER_NOT_FOUND");
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // User API methods
  async fetchUser(token: string, retries = 3): Promise<UserData> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.makeRequest<UserData>("/api/user", {
          method: "GET",
          token,
        });
      } catch (err) {
        const isLastAttempt = attempt === retries;
        
        if (isLastAttempt) {
          throw err;
        }

        // Exponential backoff
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
      }
    }
    
    throw new Error("Unexpected fetch failure");
  }

  async createUser(userData: Partial<UserData>, token: string): Promise<UserData> {
    return this.makeRequest<UserData>("/api/user", {
      method: "POST",
      token,
      body: JSON.stringify(userData),
    });
  }

  async updateUser(updates: Partial<UserData>, token: string): Promise<UserData> {
    return this.makeRequest<UserData>("/api/user", {
      method: "PUT",
      token,
      body: JSON.stringify(updates),
    });
  }

  // Settings API methods
  async updateSettings(userId: string, settings: Partial<Settings>, token: string): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/user/${userId}/settings`, {
      method: "PUT",
      token,
      body: JSON.stringify(settings),
    });
  }

  // City Stats API methods
  async updateCityStats(userId: string, cityStats: Partial<CityStat>, token: string): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/users/${userId}/city-stats`, {
      method: "PUT",
      token,
      body: JSON.stringify(cityStats),
    });
  }

  async addStreetWalk(userId: string, streetWalk: Omit<StreetWalk, "id" | "cityStatId">, token: string): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/users/${userId}/street-walks`, {
      method: "POST",
      token,
      body: JSON.stringify(streetWalk),
    });
  }

  // Friends API methods
  async addFriend(userId: string, friendId: string, token: string): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/users/${userId}/friends`, {
      method: "POST",
      token,
      body: JSON.stringify({ friendId }),
    });
  }

  async removeFriend(userId: string, friendId: string, token: string): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/users/${userId}/friends/${friendId}`, {
      method: "DELETE",
      token,
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();