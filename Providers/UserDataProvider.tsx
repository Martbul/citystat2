import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { apiService } from "@/services/api";
import {
  UserData,
  UserDataContextType,
  Role,
  Status,
  CityStat,
  StreetWalk,
  Friend,
} from "@/types/user";
import {
  Theme,
  Language,
  Settings,
  TextSize,
  MessagesAllowance,
  RoleColors,
  StickersAnimation,
  Motion,
} from "@/types/settings";
import { Alert } from "react-native";

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

const defaultSettings: Omit<
  Settings,
  "id" | "userId" | "createdAt" | "updatedAt"
> = {
  theme: Theme.SYSTEM,
  language: Language.En,
  enabledLocationTracking: false,
  allowCityStatDataUsage: true,
  allowDataPersonalizationUsage: true,
  allowInAppRewards: true,
  allowDataAnaliticsAndPerformance: true,
  textSize: TextSize.MEDIUM,
  zoomLevel: "100",
  fontStyle: "default",
  messagesAllowance: MessagesAllowance.ALLMSG,
  showRoleColors: RoleColors.NEXTTONAME,
  motion: Motion.DONTPLAYGIFWHENPOSSIBLESHOW,
  stickersAnimation: StickersAnimation.ALWAYS,
  enableInAppNotifications: true,
  enableSoundEffects: true,
  enableVibration: true,
};

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  // Core state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundUsers, setFoundUsers] = useState<UserData[] | []>([]);

  const loadingRef = useRef(false);

  // Helper function to handle API calls with loading/error states
  const withLoadingAndError = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      onSuccess?: (data: T) => void
    ): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await apiCall();

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("API Error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const loadUserData = async () => {
      if (!isSignedIn || !user?.id || loadingRef.current) {
        if (!isSignedIn) {
          setUserData(null);
          setError(null);
        }
        return;
      }

      try {
        loadingRef.current = true;
        setIsLoading(true);
        setError(null);

        console.log("Loading user data for:", user.id);

        const token = await getToken();
        if (!token) {
          console.log("No token available");
          return;
        }

        let fetchedUserData: UserData;

        try {
          // Try to fetch existing user
          fetchedUserData = await apiService.fetchUser(token);
          console.log("User found:", fetchedUserData.id);
        } catch (error: any) {
          // If user doesn't exist, create new one
          if (error.message === "USER_NOT_FOUND") {
            console.log("User not found, creating new user");

            const newUserData = {
              id: user.id,
              email: user.emailAddresses[0]?.emailAddress || "",
              firstName: user.firstName || null,
              lastName: user.lastName || null,
              imageUrl:
                user.imageUrl ||
                "https://48htuluf59.ufs.sh/f/1NvBfFppWcZeWF2WCCi3zDay6IgjQLVNYHEhKiCJ8OeGwTon",
              phoneNumber: user.phoneNumbers[0]?.phoneNumber || null,
              role: Role.USER,
              completedTutorial: false,
              aboutMe: null,
              disableAccount: false,
              deleteAccount: false,
              note: "",
              status: Status.ACTIVE,
            };

            fetchedUserData = await apiService.createUser(newUserData, token);
            console.log("New user created:", fetchedUserData);
          } else {
            throw error;
          }
        }

        setUserData(fetchedUserData);
        console.log("User data loaded successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Error loading user data:", err);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    loadUserData();
  }, [isSignedIn, user?.id]);

  // Clear data on sign out
  useEffect(() => {
    if (!isSignedIn) {
      setUserData(null);
      setError(null);
    }
  }, [isSignedIn]);

  // Get settings - handle both "Settings" and "settings" from API
  const settings = useMemo(() => {
    const apiSettings = userData?.Settings || userData?.settings;
    return apiSettings
      ? { ...defaultSettings, ...apiSettings }
      : defaultSettings;
  }, [userData]);

  // API methods that use the service layer
  const updateUser = useCallback(
    async (
      updates: Partial<
        Omit<
          UserData,
          "id" | "createdAt" | "updatedAt" | "cityStats" | "settings"
        >
      >
    ): Promise<void> => {
      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(
        () => apiService.updateUser(updates, token),
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

  // Single settings update method - handles all settings updates
  const updateSettings = useCallback(
    async (
      settingsUpdates: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>
    ): Promise<void> => {
      console.log("updating settings (in provider)");
      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(
        () =>
          apiService.updateUserSettings({ settings: settingsUpdates }, token),
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

  const refreshUserData = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    const token = await getToken();
    if (!token) return;

    await withLoadingAndError(
      () => apiService.fetchUser(token),
      (data) => setUserData(data)
    );
  }, [user?.id, getToken, withLoadingAndError]);

  // Update the addFriend method in your UserDataProvider
  const addFriendByUser = useCallback(
    async (friendUser: UserData): Promise<boolean> => {
      if (!user?.id || !userData) return false;

      if (friendUser.id === userData.id) {
        Alert.alert("Error", "You cannot add yourself as a friend");
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) return false;

        await apiService.addFriendByUser(friendUser.id, token);

        Alert.alert("Success", `Added ${friendUser.userName} as a friend!`);

        // Update the foundUsers to mark this user as a friend
        setFoundUsers((prev) =>
          prev.map((user) =>
            user.id === friendUser.id ? { ...user, isFriend: true } : user
          )
        );

        // Optionally refresh user data to update friends list
        await refreshUserData();

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add friend";
        setError(errorMessage);
        Alert.alert("Error", errorMessage);
        console.error("Error adding friend:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, userData, getToken, refreshUserData]
  );

  const removeFriend = useCallback(
    async (friendId: string): Promise<void> => {
      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(
        () => apiService.removeFriend(user.id, friendId, token),
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

  const updateCityStats = useCallback(
    async (
      cityStats: Partial<
        Omit<
          CityStat,
          "id" | "createdAt" | "updatedAt" | "streetWalks" | "userId"
        >
      >
    ): Promise<void> => {
      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(
        () => apiService.updateCityStats(user.id, cityStats, token),
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

  const addStreetWalk = useCallback(
    async (
      streetWalk: Omit<StreetWalk, "id" | "cityStatId">
    ): Promise<void> => {
      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(
        () => apiService.addStreetWalk(user.id, streetWalk, token),
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

  const updateUserField = useCallback(
    async (field: string, value: any): Promise<void> => {
      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(
        () => apiService.updateUserField(field, value, token),
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

  const updateUserNote = useCallback(
    async (note: string): Promise<void> => {
      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(
        () => apiService.updateUserNote(note, token),
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

  const searchUsers = useCallback(
    async (searchQuery: string): Promise<void> => {
      if (!searchQuery.trim()) {
        Alert.alert("Error", "Please enter a username to search");
        return;
      }

      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      // Clear previous results when starting a new search
      setFoundUsers([]);

      await withLoadingAndError(
        () => apiService.searchUsers(searchQuery, token),
        (foundUsers) => setFoundUsers(foundUsers)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

  const getFriends = useCallback(async (): Promise<Friend[]> => {
    if (!user?.id) return [];

    const token = await getToken();
    if (!token) return [];

    try {
      setIsLoading(true);
      setError(null);

      const friends = await apiService.getFriends(token);

      return friends;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Getting friends failed";
      setError(errorMessage);
      console.error("Getting friends error:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getToken]);

  const fetchOtherUserProfile = useCallback(
  async (otherUserId: string): Promise<any> => {
    if (!otherUserId || !user?.id) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) return null;

      const profileData = await apiService.fetchOtherUserProfile(otherUserId, token);
      
      console.log("Friends profile:", profileData);
      
      return profileData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch otherUserId profile";
      setError(errorMessage);
      console.error("Error otherUserId friend profile:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  },
  [user?.id, getToken]
);

  // Derived values for backwards compatibility
  const derivedValues = useMemo(
    () => ({
      completedTutorial: userData?.completedTutorial ?? false,
      status: userData?.status ?? Status.ACTIVE,
      note: userData?.note ?? "",
      friends: userData?.friends ?? [],
      cityStats: userData?.cityStats ?? null,
      totalStreetsWalked: userData?.cityStats?.totalStreetsWalked ?? 0,
      totalKilometers: userData?.cityStats?.totalKilometers ?? 0,
      cityCoveragePct: userData?.cityStats?.cityCoveragePct ?? 0,
      daysActive: userData?.cityStats?.daysActive ?? 0,
      longestStreakDays: userData?.cityStats?.longestStreakDays ?? 0,
      streetWalks: userData?.cityStats?.streetWalks ?? [],
    }),
    [userData]
  );

  // Context value - much cleaner now
  const contextValue: UserDataContextType = useMemo(
    () => ({
      userData,
      setUserData,
      isLoading,
      error,
      settings, // Single settings object
      addFriendByUser, // Add this new method
      getFriends,
      fetchOtherUserProfile,

      // Core methods
      updateUser,
      updateSettings, // Single settings update method
      updateUserField,
      updateUserNote,
      refreshUserData,

      // Legacy derived values (for backwards compatibility)
      completedTutorial: derivedValues.completedTutorial,
      status: derivedValues.status,
      note: derivedValues.note,
      friends: derivedValues.friends,
      cityStats: derivedValues.cityStats,
      totalStreetsWalked: derivedValues.totalStreetsWalked,
      totalKilometers: derivedValues.totalKilometers,
      cityCoveragePct: derivedValues.cityCoveragePct,
      daysActive: derivedValues.daysActive,
      longestStreakDays: derivedValues.longestStreakDays,
      streetWalks: derivedValues.streetWalks,

      // Friends & City stats
      removeFriend,
      updateCityStats,
      addStreetWalk,
      searchUsers,
      foundUsers,
    }),
    [
      userData,
      setUserData,
      getFriends,
      isLoading,
      error,
      fetchOtherUserProfile,
      addFriendByUser, 
      settings,
      updateUser,
      updateSettings,
      updateUserField,
      updateUserNote,
      refreshUserData,
      derivedValues,

      removeFriend,
      updateCityStats,
      addStreetWalk,
      searchUsers,
      foundUsers,
    ]
  );

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
