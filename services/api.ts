// services/api.ts
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

    console.log(`Making request to: ${this.baseUrl}${endpoint}`);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      // Read response text once and reuse it
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

    // Read response JSON once
    try {
      const data = await response.json();
      console.log(`Success response:`, data);
      return data;
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError);
      throw new Error("Invalid JSON response from server");
    }
  }

  // User API methods
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

        // Exponential backoff
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    
    throw new Error("Unexpected fetch failure");
  }

  async createUser(userData: Partial<UserData>, token: string): Promise<UserData> {
    console.log("Creating user with data:", userData);
    
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

  // Generic field update method
  async updateUserField(field: string, value: any, token: string): Promise<UserData> {
    return this.makeRequest<UserData>(`/api/settings/${field}`, {
      method: "PUT",
      token,
      body: JSON.stringify({ [field]: value }),
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

export const apiService = new ApiService();
