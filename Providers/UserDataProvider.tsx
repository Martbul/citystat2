import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { CityStat, Role, Status, StreetWalk, UserData } from "@/types/user";
import { Language, Settings, Theme } from "@/types/settings";

interface UserDataContextType {
  // Core data
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;

  // General user methods
  updateUser: (
    updates: Partial<
      Omit<
        UserData,
        "id" | "createdAt" | "updatedAt" | "cityStats" | "settings"
      >
    >
  ) => Promise<void>;
  refreshUserData: () => Promise<void>;

  // Tutorial methods
  completedTutorial: boolean;
  setCompletedTutorial: (completed: boolean) => Promise<void>;

  // Settings methods
  theme: Theme;
  language: Language;
  updateTheme: (theme: Theme) => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
  updateSettings: (
    settings: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>
  ) => Promise<void>;

  // Status methods
  status: Status;
  setStatus: (status: Status) => Promise<void>;

  // Friends methods
  friendIds: string[];
  addFriend: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;

  // City stats methods
  cityStats: CityStat | null;
  totalStreetsWalked: number;
  totalKilometers: number;
  cityCoveragePct: number;
  daysActive: number;
  longestStreakDays: number;
  streetWalks: StreetWalk[];
  updateCityStats: (
    cityStats: Partial<
      Omit<CityStat, "id" | "createdAt" | "updatedAt" | "streetWalks">
    >
  ) => Promise<void>;
  addStreetWalk: (
    streetWalk: Omit<StreetWalk, "id" | "cityStatId">
  ) => Promise<void>;
  incrementStreetsWalked: () => Promise<void>;
  addKilometers: (km: number) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

// Default user data structure
const defaultSettings: Omit<Settings, "id" | "createdAt" | "updatedAt"> = {
  theme: Theme.Light,
  language: Language.En,
};

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, isSignedIn } = useUser();
    const { getToken } = useAuth(); 
      const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log(user?.getSessions())

  const API_BASE_URL =
    process.env.EXPO_PUBLIC_CITYSTAT_API_URL || "http://localhost:3000/api";

  // Load user data when user signs in
  useEffect(() => {
    const loadUserData = async () => {
      if (!isSignedIn || !user?.id) {
        setUserData(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch existing user data
        let data: UserData;
        try {
          data = await fetchUserData();
        } catch (fetchError: any) {
          // If user doesn't exist in DB, create new user data
          if (fetchError.message === "USER_NOT_FOUND") {
            console.log("User not found in DB, creating new user data");
            data = await createUserData(user);
          } else {
            throw fetchError;
          }
        }

        setUserData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Error loading user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isSignedIn, user?.id]);

  // Clear user data when user signs out
  useEffect(() => {
    if (!isSignedIn) {
      setUserData(null);
      setError(null);
    }
  }, [isSignedIn]);


  const fetchUserData = async (): Promise<UserData> => {
      const token = await getToken();

    try {
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Clerk JWT token required
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("USER_NOT_FOUND");
        }
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching user data:", err);
      throw err;
    }
  };

  // Create user data in your database (for new users)
  const createUserData = async (clerkUser: any): Promise<UserData> => {
    try {
      const newUserData = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        imageUrl: clerkUser.imageUrl || null,
        phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber || null,
        role: Role.USER,
        completedTutorial: false,
        friendIds: [],
        note: "",
        status: Status.ACTIVE,
        settings: defaultSettings,
      };

      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify(newUserData),
      });

      if (!response.ok) {
        throw new Error("Failed to create user data");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error creating user data:", err);
      throw err;
    }
  };

  // Generic method to update user data
  const updateUserInDB = async (
    endpoint: string,
    data: any
  ): Promise<UserData> => {
          const token = await getToken();

    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update: ${endpoint}`);
    }

    return await response.json();
  };

  // Update user data
  const updateUser = async (
    updates: Partial<
      Omit<
        UserData,
        "id" | "createdAt" | "updatedAt" | "cityStats" | "settings"
      >
    >
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const updatedData = await updateUserInDB(`user`, updates);
      setUserData(updatedData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error updating user data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tutorial methods
  const setCompletedTutorial = async (completed: boolean): Promise<void> => {
    await updateUser({ completedTutorial: completed });
  };

  // Settings methods
  const updateSettings = async (
    settings: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const updatedData = await updateUserInDB(
        `/user/${user.id}/settings`,
        settings
      );
      setUserData(updatedData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error updating settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTheme = async (theme: Theme): Promise<void> => {
    await updateSettings({ theme });
  };

  const updateLanguage = async (language: Language): Promise<void> => {
    await updateSettings({ language });
  };

  // Status methods
  const setStatus = async (status: Status): Promise<void> => {
    await updateUser({ status });
  };

  // Friends methods
  const addFriend = async (friendId: string): Promise<void> => {
    if (!userData?.friendIds.includes(friendId)) {
      await updateUser({
        friendIds: [...(userData?.friendIds ?? []), friendId],
      });
    }
  };

  const removeFriend = async (friendId: string): Promise<void> => {
    await updateUser({
      friendIds: userData?.friendIds.filter((id) => id !== friendId) ?? [],
    });
  };

  // City stats methods
  const updateCityStats = async (
    cityStats: Partial<
      Omit<CityStat, "id" | "createdAt" | "updatedAt" | "streetWalks">
    >
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const updatedData = await updateUserInDB(
        `/users/${user.id}/city-stats`,
        cityStats
      );
      setUserData(updatedData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error updating city stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addStreetWalk = async (
    streetWalk: Omit<StreetWalk, "id" | "cityStatId">
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/users/${user.id}/street-walks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(streetWalk),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add street walk");
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error adding street walk:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementStreetsWalked = async (): Promise<void> => {
    if (!userData?.cityStats) return;

    await updateCityStats({
      totalStreetsWalked: userData.cityStats.totalStreetsWalked + 1,
    });
  };

  const addKilometers = async (km: number): Promise<void> => {
    if (!userData?.cityStats) return;

    await updateCityStats({
      totalKilometers: userData.cityStats.totalKilometers + km,
    });
  };

  const refreshUserData = async (): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const data = await fetchUserData();
      setUserData(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error refreshing user data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: UserDataContextType = {
    userData,
    isLoading,
    error,

    updateUser,
    refreshUserData,

    completedTutorial: userData?.completedTutorial ?? false,
    setCompletedTutorial,

    theme: userData?.settings?.theme ?? Theme.Light,
    language: userData?.settings?.language ?? Language.En,
    updateTheme,
    updateLanguage,
    updateSettings,

    status: userData?.status ?? Status.ACTIVE,
    setStatus,

    friendIds: userData?.friendIds ?? [],
    addFriend,
    removeFriend,

    cityStats: userData?.cityStats ?? null,
    totalStreetsWalked: userData?.cityStats?.totalStreetsWalked ?? 0,
    totalKilometers: userData?.cityStats?.totalKilometers ?? 0,
    cityCoveragePct: userData?.cityStats?.cityCoveragePct ?? 0,
    daysActive: userData?.cityStats?.daysActive ?? 0,
    longestStreakDays: userData?.cityStats?.longestStreakDays ?? 0,
    streetWalks: userData?.cityStats?.streetWalks ?? [],
    updateCityStats,
    addStreetWalk,
    incrementStreetsWalked,
    addKilometers,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
