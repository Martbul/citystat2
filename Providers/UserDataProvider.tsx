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
} from "@/types/user";
import { Theme, Language, Settings, TextSize, MessagesAllowance, RoleColors, StickersAnimation, Motion } from "@/types/settings";

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

const defaultSettings: Omit<Settings, "id" | "userId" | "createdAt" | "updatedAt"> = {
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
        console.error("API ErroR:", err);
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
          console.log("us: " + fetchedUserData.settings)
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
              // Don't include settings here - let the backend handle defaults
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
  }, [isSignedIn, user?.id]); // REMOVED getToken from dependencies

  // Clear data on sign out
  useEffect(() => {
    if (!isSignedIn) {
      setUserData(null);
      setError(null);
    }
  }, [isSignedIn]);

   const settings = useMemo(() => {
    const apiSettings = userData?.Settings || userData?.settings;
    return apiSettings ? { ...defaultSettings, ...apiSettings } : defaultSettings;
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

  const updateSettings = useCallback(
    async (
      settings: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>
    ): Promise<void> => {
      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(
        () => apiService.updateUserProfile({ settings }, token), // Send as nested object
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

  const setCompletedTutorial = useCallback(
    async (completed: boolean): Promise<void> => {
      await updateUser({ completedTutorial: completed });
    },
    [updateUser]
  );

  const updateTheme = useCallback(
    async (theme: Theme): Promise<void> => {
      await updateSettings({ theme });
    },
    [updateSettings]
  );

  const updateLanguage = useCallback(
    async (language: Language): Promise<void> => {
      await updateSettings({ language });
    },
    [updateSettings]
  );

  const setStatus = useCallback(
    async (status: Status): Promise<void> => {
      await updateUser({ status });
    },
    [updateUser]
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

  const addFriend = useCallback(
    async (friendId: string): Promise<void> => {
      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(
        () => apiService.addFriend(user.id, friendId, token),
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, getToken, withLoadingAndError]
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

  const setNote = useCallback(
    async (note: string): Promise<void> => {
      await updateUser({ note });
    },
    [updateUser]
  );

  const updateAboutMe = useCallback(
    async (aboutMe: string): Promise<void> => {
      await updateUser({ aboutMe });
    },
    [updateUser]
  );

  const setDisableAccount = useCallback(
    async (disabled: boolean): Promise<void> => {
      await updateUser({ disableAccount: disabled });
    },
    [updateUser]
  );

  const setDeleteAccount = useCallback(
    async (deleted: boolean): Promise<void> => {
      await updateUser({ deleteAccount: deleted });
    },
    [updateUser]
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

  const incrementStreetsWalked = useCallback(async (): Promise<void> => {
    if (!userData?.cityStats) return;

    await updateCityStats({
      totalStreetsWalked: userData.cityStats.totalStreetsWalked + 1,
    });
  }, [userData?.cityStats, updateCityStats]);

  const addKilometers = useCallback(
    async (km: number): Promise<void> => {
      if (!userData?.cityStats) return;

      await updateCityStats({
        totalKilometers: userData.cityStats.totalKilometers + km,
      });
    },
    [userData?.cityStats, updateCityStats]
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
    [user?.id, withLoadingAndError]
  );

   const updateUserNoteField = useCallback(
    async ( value: any): Promise<void> => {
      if (!user?.id) return;

      const token = await getToken();
      if (!token) return;

      await withLoadingAndError(
        () => apiService.updateUserNote(value, token),
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, withLoadingAndError]
  );

  // Specific setting update methods
  const updateUsername = useCallback(
    async (username: string): Promise<void> => {
      await updateUserField("userName", username);
    },
    [updateUserField]
  );

  const updateFirstName = useCallback(
    async (firstName: string): Promise<void> => {
      await updateUserField("firstName", firstName);
    },
    [updateUserField]
  );

  const updateLastName = useCallback(
    async (lastName: string): Promise<void> => {
      await updateUserField("lastName", lastName);
    },
    [updateUserField]
  );

  const updateNote = useCallback(
    async (note: string): Promise<void> => {
      await updateUserNoteField(note);
    },
    [updateUserField]
  );

  // Settings-specific updates
  const updateTextSize = useCallback(
    async (textSize: TextSize): Promise<void> => {
      await updateSettings({ textSize });
    },
    [updateSettings]
  );

  const updateZoomLevel = useCallback(
    async (zoomLevel: string): Promise<void> => {
      await updateSettings({ zoomLevel });
    },
    [updateSettings]
  );

  const updateFontStyle = useCallback(
    async (fontStyle: string): Promise<void> => {
      await updateSettings({ fontStyle });
    },
    [updateSettings]
  );

  // Updated derived values to include note
  const derivedValues = useMemo(
    () => ({
      completedTutorial: userData?.completedTutorial ?? false,
      theme: userData?.settings?.theme ?? Theme.SYSTEM,
      language: userData?.settings?.language ?? Language.En,
      status: userData?.status ?? Status.ACTIVE,
      note: userData?.note ?? "", // Add this
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
  // Complete context value with all required properties
  const contextValue: UserDataContextType = useMemo(
    () => ({
      userData,
      setUserData,
      isLoading,
      error,

      // User operations
      updateUser,
      refreshUserData,

      // Tutorial
      completedTutorial: derivedValues.completedTutorial,
      setCompletedTutorial,

      // Settings
      theme: derivedValues.theme,
      language: derivedValues.language,
      updateTheme,
      updateLanguage,
      updateSettings,
          settings, // Just provide the settings object,

      // User status and profile
      status: derivedValues.status,
      setStatus,
      note: derivedValues.note,
      setNote,

      // Friends
      friends: derivedValues.friends,
      addFriend,
      removeFriend,

      // City stats
      cityStats: derivedValues.cityStats,
      totalStreetsWalked: derivedValues.totalStreetsWalked,
      totalKilometers: derivedValues.totalKilometers,
      cityCoveragePct: derivedValues.cityCoveragePct,
      daysActive: derivedValues.daysActive,
      longestStreakDays: derivedValues.longestStreakDays,
      streetWalks: derivedValues.streetWalks,
      updateCityStats,
      addStreetWalk,
      incrementStreetsWalked,
      addKilometers,

      // New user profile methods
      updateAboutMe,
      setDisableAccount,
      setDeleteAccount,

      updateUserField,
      updateUsername,
      updateFirstName,
      updateLastName,
      updateNote,
      updateTextSize,
      updateZoomLevel,
      updateFontStyle,
    }),
    [
      userData,
      setUserData,
      isLoading,
      error,
      derivedValues,
      updateUser,
      refreshUserData,
      setCompletedTutorial,
      updateTheme,
      updateLanguage,
      updateSettings,
    settings, // Just provide the settings object      setStatus,
      setNote,
      addFriend,
      removeFriend,
      updateCityStats,
      addStreetWalk,
      incrementStreetsWalked,
      addKilometers,
      updateAboutMe,
      setDisableAccount,
      setDeleteAccount,
      updateUserField,
      updateUsername,
      updateFirstName,
      updateLastName,
      updateAboutMe,
      updateNote,
      updateTextSize,
      updateZoomLevel,
      updateFontStyle,
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
