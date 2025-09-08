import { apiService } from "@/services/api";
import {
  Language,
  MessagesAllowance,
  Motion,
  RoleColors,
  Settings,
  StickersAnimation,
  TextSize,
  Theme,
} from "@/types/settings";
import {
  CityStat,
  Friend,
  Role,
  Status,
  UserData,
  UserDataContextType,
} from "@/types/user";
import { SaveVisitedStreetsRequest } from "@/types/world";
import { useAuth, useUser } from "@clerk/clerk-expo";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

// add the func for fetching uses location in the provider,
// get the users town to calulate this like percantage couverage and soo on
// add raning for his town, for his friends
// add ranking overall, overall percentage, most killomets, most streets


//! add checksin the db fr dulicates, in a single sesshion in the clients there may not be dublicates but then in the overlal visited strees there can dublicate ids

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
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
              imageUrl:
                user.imageUrl ||
                "https://48htuluf59.ufs.sh/f/1NvBfFppWcZeWF2WCCi3zDay6IgjQLVNYHEhKiCJ8OeGwTon",
              phoneNumber: user.phoneNumbers[0]?.phoneNumber || undefined,
              role: Role.USER,
              completedTutorial: false,
              aboutMe: undefined,
              disableAccount: false,
              deleteAccount: false,
              note: "",
              status: Status.ACTIVE,
            };

            fetchedUserData = await apiService.createUser(newUserData, token);
            console.log("New user created:", fetchedUserData);
          } else {
            console.log("errr: " +  error)
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

  const settings = useMemo(() => {
    //! possible error
    const apiSettings = userData?.Settings || userData?.settings;
    // const apiSettings = userData?.Settings
    return apiSettings
      ? { ...defaultSettings, ...apiSettings }
      : defaultSettings;
  }, [userData]);

  const updateUserDetails = useCallback(
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
        () => apiService.updateUserDetails(updates, token),
        (updatedData) => setUserData(updatedData)
      );
    },
    [user?.id, getToken, withLoadingAndError]
  );

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
  

    const saveLocationPermission = useCallback(
      async (hasPermission: boolean): Promise<any> => {
        if (!hasPermission || !user?.id) {
          return null;
        }

        try {
          setIsLoading(true);
          setError(null);

          const token = await getToken();
          if (!token) return null;

          const success = await apiService.saveLocationPermission(
            hasPermission,
            token
          );

          console.log("Saved location permissions", success);

          return success;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to save location permissions";
          setError(errorMessage);
          console.error("Error while saving location permissions:", err);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      [user?.id, getToken]
    );
  
  
    const getLocationPermission = useCallback(
      async (): Promise<any> => {
        if (!user?.id) {
          return null;
        }

        try {
          setIsLoading(true);
          setError(null);

          const token = await getToken();
          if (!token) return null;

          const success = await apiService.getLocationPermission(
            token
          );

          console.log("Got location permissions", success);

          return success;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to get location permissions";
          setError(errorMessage);
          console.error("Error while getting location permissions:", err);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      [user?.id, getToken]
    );
  
  
    const saveVisitedStreets = useCallback(
      async (visitedStreets: SaveVisitedStreetsRequest): Promise<any> => {
        if (!visitedStreets || !user?.id) {
          return null;
        }

        try {
          setIsLoading(true);
          setError(null);

          const token = await getToken();
          if (!token) return null;
                    console.log("-----------visitedStreets ", visitedStreets);


          const success = await apiService.saveVisitedStreets(
            visitedStreets,
            token
          );

          console.log("Saved visitedStreets ", success);

          return success;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to save visitedStreets";
          setError(errorMessage);
          console.error("Error while saving visitedStreets:", err);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      [user?.id, getToken]
    );
  

   const fetchVisitedStreets = useCallback(
     async (): Promise<any> => {
       if (!user?.id) {
         return null;
       }

       try {
         setIsLoading(true);
         setError(null);

         const token = await getToken();
         if (!token) return null;

         const success = await apiService.fetchVisitedStreets(token);

         console.log("fetchVisitedStreets", success);

         return success;
       } catch (err) {
         const errorMessage =
           err instanceof Error
             ? err.message
             : "Failed to fetch Visited Streets";
         setError(errorMessage);
         console.error("Error while fetching visited streets:", err); //! getting error here
         return null;
       } finally {
         setIsLoading(false);
       }
     },
     [user?.id, getToken]
   );
  
  
  
  const fetchUsersSameCity = useCallback(async (): Promise<any> => {
    if (!user?.id) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) return null;

      const success = await apiService.fetchUsersSameCity(token);

      console.log("fetchUsersSameCity", success);

      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch users in the same city";
      setError(errorMessage);
      console.error("Error while fetching users in the same city:", err); 
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getToken]);


  
  const fetchRank = useCallback(async (): Promise<any> => {
    if (!user?.id) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) return null;

      const success = await apiService.fetchRank(token);

      console.log("fetchRank", success);

      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch rank";
      setError(errorMessage);
      console.error("Error while fetching rank:", err); 
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getToken]);
  


  const fetchRankProgress = useCallback(async (): Promise<any> => {
    if (!user?.id) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) return null;

      const success = await apiService.fetchRankProgress(token);

      console.log("RankProgress", success);

      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch rank progress";
      setError(errorMessage);
      console.error("Error while fetching rank progress:", err); 
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getToken]);


  

  const fetchGlobalLeaderboard = useCallback(async (): Promise<any> => {
    if (!user?.id) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) return null;

      const success = await apiService.fetchLeaderboard(token);

      console.log("Global Leaderboard", success);

      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch global leaderboard";
      setError(errorMessage);
      console.error("Error while fetching global leaderboard:", err); 
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getToken]);
  


  

  const fetchLocalLeaderboard = useCallback(async (): Promise<any> => {
    if (!user?.id) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) return null;

      const success = await apiService.fetchLocalLeaderboard(token);

      console.log("Local Leaderboard", success);

      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch local leaderboard";
      setError(errorMessage);
      console.error("Error while fetching local leaderboard:", err); 
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getToken]);
  

   const get2MainStats = useCallback(async (): Promise<any> => {
     if (!user?.id) {
       return null;
     }

     try {
       setIsLoading(true);
       setError(null);

       const token = await getToken();
       if (!token) return null;

       const success = await apiService.get2MainStats(token);

       console.log("2 main stats ", success);

       return success;
     } catch (err) {
       const errorMessage =
         err instanceof Error
           ? err.message
           : "Failed to fetch 2 main stats";
       setError(errorMessage);
       console.error("Error while fetching 2 main stats: ", err);
       return null;
     } finally {
       setIsLoading(false);
     }
   }, [user?.id, getToken]);
  
  
  
  
   const getMainRadarChartData = useCallback(async (): Promise<any> => {
     if (!user?.id) {
       return null;
     }

     try {
       setIsLoading(true);
       setError(null);

       const token = await getToken();
       if (!token) return null;

       const success = await apiService.getMainRadarChartData(token);

       console.log("main chart data ", success);

       return success;
     } catch (err) {
       const errorMessage =
         err instanceof Error ? err.message : "Failed to fetch main chart data";
       setError(errorMessage);
       console.error("Error while fetching main chart data: ", err);
       return null;
     } finally {
       setIsLoading(false);
     }
   }, [user?.id, getToken]);
  
  
  
  // Derived values for backwards compatibility
  const derivedValues = useMemo(
    () => ({
      completedTutorial: userData?.completedTutorial ?? false,
      status: userData?.status ?? Status.ACTIVE,
      note: userData?.note ?? "",
      friends: userData?.friends ?? [],
      cityStats: userData?.cityStats ?? null,
      totalKilometers: userData?.cityStats?.totalKilometers ?? 0,
      cityCoveragePct: userData?.cityStats?.cityCoveragePct ?? 0,
      daysActive: userData?.cityStats?.daysActive ?? 0,
      longestStreakDays: userData?.cityStats?.longestStreakDays ?? 0,
    }),
    [userData]
  );

const contextValue: UserDataContextType = useMemo(
  () => ({
    // --- Core state ---
    userData,
    settings,
    isLoading,
    error,
    foundUsers,

    // --- Derived values ---
    completedTutorial: derivedValues.completedTutorial,
    status: derivedValues.status,
    note: derivedValues.note,
    friends: derivedValues.friends,
    cityStats: derivedValues.cityStats,
    totalKilometers: derivedValues.totalKilometers,
    cityCoveragePct: derivedValues.cityCoveragePct,
    daysActive: derivedValues.daysActive,
    longestStreakDays: derivedValues.longestStreakDays,

    // --- Core methods ---
    setUserData,
    refreshUserData,
    updateUserDetails,
    updateSettings,
    updateUserField,
    updateUserNote,

    // --- Friends ---
    getFriends,
    addFriendByUser,
    removeFriend,
    searchUsers,
    fetchOtherUserProfile,

    // --- City / Stats ---
    fetchVisitedStreets,
    saveVisitedStreets,
    get2MainStats,
    getMainRadarChartData,
    updateCityStats,
    fetchUsersSameCity,

    // --- Leaderboards & Rankings ---
    fetchLocalLeaderboard,
    fetchGlobalLeaderboard,
    fetchRank,
    fetchRankProgress,

    // --- Permissions ---
    getLocationPermission,
    saveLocationPermission,
  }),
  [
    userData,
    settings,
    isLoading,
    error,
    foundUsers,

    derivedValues,

    setUserData,
    refreshUserData,
    updateUserDetails,
    updateSettings,
    updateUserField,
    updateUserNote,

    getFriends,
    addFriendByUser,
    removeFriend,
    searchUsers,
    fetchOtherUserProfile,

    fetchVisitedStreets,
    saveVisitedStreets,
    get2MainStats,
    getMainRadarChartData,
    updateCityStats,
    fetchUsersSameCity,

    fetchLocalLeaderboard,
    fetchGlobalLeaderboard,
    fetchRank,
    fetchRankProgress,

    getLocationPermission,
    saveLocationPermission,
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
