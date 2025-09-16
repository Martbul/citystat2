import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { LocationTrackingService } from "../services/LocationTrackingService";
import type {
  UserCoords,
  StreetData,
  VisitedStreet,
  StreetVisitData,
} from "@/types/world";
import { useAuth } from "@clerk/clerk-expo";
import { apiService } from "@/services/api";

interface LocationTrackingContextType {
  // Location state
  userLocation: UserCoords | null;
  currentStreetId: string | null;
  streetData: StreetData | null;
  visitedStreets: VisitedStreet[];
  allVisitedStreetIds: Set<string>;

  // Visit tracking
  getStreetVisitData: (streetId: string) => StreetVisitData | null;
  getAllStreetVisitData: () => Map<string, StreetVisitData>;
  getMostVisitedStreets: (
    limit?: number
  ) => Array<{ streetId: string; visitData: StreetVisitData }>;
  getStreetsByTimeSpent: (
    limit?: number
  ) => Array<{ streetId: string; visitData: StreetVisitData }>;

  // Active hours tracking
  totalActiveHours: number;
  currentSessionDuration: number;
  getDailyActiveTime: (date?: string) => number;
  getWeeklyActiveTime: () => number;
  getMonthlyActiveTime: () => number;

  // Control methods
  startTracking: (enableBackground: boolean) => Promise<void>;
  stopTracking: () => Promise<void>;
  isTracking: boolean;

  // Permission status
  hasBackgroundPermission: boolean;

  requestLocationPermission: (token: string | null) => Promise<boolean>;

  initializeData: () => Promise<void>;
  destroyService: (token?: string | null) => Promise<void>;

  requestFullLocationPermissions: () => Promise<{
    backgroundGranted: boolean;
    success: boolean;
  }>;
  checkExistingPermissions: () => Promise<{
    hasStoredPermission: boolean;
    hasSystemPermission: boolean;
    hasBackgroundPermission: boolean;
    needsPermissionRequest: boolean;
  }>;

  // Permission status

  // Enhanced initialization
  initializeForOnboarding: () => Promise<void>;
  completeLocationOnboarding: (granted: boolean) => Promise<void>;

  // Enhanced tracking
  startLocationTrackingEnhanced: () => Promise<void>;
  showPermissionPanel: boolean;
  setShowPermissionPanel: (show: boolean) => void;
}

const LocationTrackingContext =
  createContext<LocationTrackingContextType | null>(null);

interface LocationTrackingProviderProps {
  children: ReactNode;
}

export const LocationTrackingProvider: React.FC<
  LocationTrackingProviderProps
> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<UserCoords | null>(null);
  const [currentStreetId, setCurrentStreetId] = useState<string | null>(null);
  const [streetData, setStreetData] = useState<StreetData | null>(null);
  const [visitedStreets, setVisitedStreets] = useState<VisitedStreet[]>([]);
  const [allVisitedStreetIds, setAllVisitedStreetIds] = useState<Set<string>>(
    new Set()
  );
  const [isTracking, setIsTracking] = useState(false);
  const [totalActiveHours, setTotalActiveHours] = useState(0);
  const [currentSessionDuration, setCurrentSessionDuration] = useState(0);
  const [hasBackgroundPermission, setHasBackgroundPermission] = useState(false);
  const [showPermissionPanel, setShowPermissionPanel] = useState(false);
  const locationService = LocationTrackingService.getInstance();
  const { getToken } = useAuth();

  // Force re-render when street visit data changes
  const [, forceUpdate] = useState({});
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    const handlePermissionStatusUpdate = (hasPermission: boolean) => {
      console.log("Permission status updated:", hasPermission);
      setHasBackgroundPermission(hasPermission);
    };

    const handleLocationUpdate = (location: UserCoords) => {
      setUserLocation(location);
    };

    const handleStreetChange = (
      streetId: string | null,
      coords: UserCoords
    ) => {
      console.log("handling new street change:", streetId);
      setCurrentStreetId(streetId);

      // Refresh visited streets and street IDs
      setVisitedStreets(locationService.getVisitedStreets());
      setAllVisitedStreetIds(new Set(locationService.getAllVisitedStreetIds()));

      // Trigger re-render for components that depend on visit data
      triggerUpdate();
    };

    const handleVisitCountUpdate = (
      streetId: string,
      visitData: StreetVisitData
    ) => {
      console.log(`Visit count updated for street ${streetId}:`, visitData);

      // Update the visited street IDs set
      setAllVisitedStreetIds(new Set(locationService.getAllVisitedStreetIds()));

      // Force components to re-render with updated visit data
      triggerUpdate();
    };

    const handleActiveHoursUpdate = (activeHours: number) => {
      setTotalActiveHours(activeHours);
    };

   const handlePermissionRequestNeeded = () => {
     console.log("Permission request needed - showing permission panel");
     setShowPermissionPanel(true);
   };

    // Add listeners
    locationService.addLocationUpdateListener(handleLocationUpdate);
    locationService.addStreetChangeListener(handleStreetChange);
    locationService.addVisitCountUpdateListener(handleVisitCountUpdate);
    locationService.addActiveHoursUpdateListener(handleActiveHoursUpdate);
    locationService.addPermissionStatusListener(handlePermissionStatusUpdate);
    locationService.addPermissionRequestNeededListener(
      handlePermissionRequestNeeded
    );

    // Initialize state from service
    const initializeFromService = () => {
      setCurrentStreetId(locationService.getCurrentStreetId());
      setStreetData(locationService.getStreetData());
      setVisitedStreets(locationService.getVisitedStreets());
      setAllVisitedStreetIds(new Set(locationService.getAllVisitedStreetIds()));
      setTotalActiveHours(locationService.getTotalActiveHours());
      setIsTracking(locationService.isTracking());

      console.log("Initialized from service:");
      console.log("- Current street ID:", locationService.getCurrentStreetId());
      console.log(
        "- Visited streets count:",
        locationService.getVisitedStreets().length
      );
      console.log(
        "- All visited street IDs count:",
        locationService.getAllVisitedStreetIds().size
      );
      console.log(
        "- Street data features count:",
        locationService.getStreetData()?.features?.length || 0
      );
    };

    initializeFromService();

    // Update session duration every 30 seconds when tracking
    const sessionInterval = setInterval(() => {
      if (locationService.isTracking()) {
        setCurrentSessionDuration(locationService.getCurrentSessionDuration());
      }
    }, 30000);

    // Cleanup listeners on unmount
    return () => {
      locationService.removeLocationUpdateListener(handleLocationUpdate);
      locationService.removePermissionRequestNeededListener(
        handlePermissionRequestNeeded
      );

      locationService.removeStreetChangeListener(handleStreetChange);
      locationService.removeVisitCountUpdateListener(handleVisitCountUpdate);
      locationService.removeActiveHoursUpdateListener(handleActiveHoursUpdate);
      locationService.removePermissionStatusListener(
        handlePermissionStatusUpdate
      );
      clearInterval(sessionInterval);
    };
  }, [triggerUpdate]);

  const startTracking = useCallback(async (enableBackground: boolean) => {
    try {
      await locationService.startLocationTracking(enableBackground);
      setIsTracking(true);
      setHasBackgroundPermission(true);
      setCurrentSessionDuration(0);

      console.log("Tracking started successfully");
    } catch (error) {
      console.error("Failed to start tracking:", error);
      setHasBackgroundPermission(false);
      throw error;
    }
  }, []);

  const stopTracking = useCallback(async () => {
    try {
      const token = await getToken();
      await locationService.stopLocationTracking(token);
      setIsTracking(false);
      setCurrentSessionDuration(0);
    } catch (error) {
      console.error("Failed to stop tracking:", error);
      throw error;
    }

  }, [getToken]);


  

  const requestLocationPermission = async (
  ): Promise<boolean> => {
    try {
      const result =
        await locationService.requestBackgroundLocationPermissions();
      setHasBackgroundPermission(result.backgroundGranted);
      return result.backgroundGranted;
    } catch (error) {
      console.error("Permission denied:", error);
      setHasBackgroundPermission(false);
      return false;
    }
  };

  const destroyService = useCallback(
    async (token?: string | null) => {
      try {
        console.log("Provider: Destroying location service...");

        // Get token if not provided
        const serviceToken = token || (await getToken());

        // Destroy the service
        await locationService.destroy(serviceToken);

        // Reset provider state
        setUserLocation(null);
        setCurrentStreetId(null);
        setStreetData(null);
        setVisitedStreets([]);
        setAllVisitedStreetIds(new Set());
        setIsTracking(false);
        setTotalActiveHours(0);
        setCurrentSessionDuration(0);

        console.log("Provider: Service destroyed and state reset");
      } catch (error) {
        console.error("Provider: Error destroying service:", error);

        // Fallback cleanup without token
        try {
          await locationService.destroy();
        } catch (fallbackError) {
          console.error("Provider: Fallback cleanup failed:", fallbackError);
        }
      }
    },
    [getToken]
  );

  const getStreetVisitData = useCallback(
    (streetId: string): StreetVisitData | null => {
      return locationService.getStreetVisitData(streetId);
    },
    []
  );

  const requestFullLocationPermissions = useCallback(async () => {
    try {
      const result =
        await locationService.requestBackgroundLocationPermissions();

      setHasBackgroundPermission(result.backgroundGranted);
      setShowPermissionPanel(false)
      return result;
    } catch (error) {
      console.error("Failed to request full permissions:", error);
      setHasBackgroundPermission(false);
      return {
        backgroundGranted: false,
        success: false,
      };
    }
  }, [getToken]);

  const checkExistingPermissions = useCallback(async () => {
    try {
      const token = await getToken();
      const status = await locationService.checkExistingPermissions(token);

      // Update local state based on results
      setHasBackgroundPermission(
        status.hasSystemPermission && status.hasStoredPermission
      );
      setHasBackgroundPermission(status.hasBackgroundPermission);

      return status;
    } catch (error) {
      console.error("Failed to check existing permissions:", error);
      return {
        hasStoredPermission: false,
        hasSystemPermission: false,
        hasBackgroundPermission: false,
        needsPermissionRequest: true,
      };
    }
  }, [getToken]);

  // const initializeForOnboarding = useCallback(async () => {
  //   try {
  //     const token = await getToken();
  //     console.log("Initializing for onboarding with token:", !!token);

  //     // Load basic data without requiring permissions
  //     await locationService.loadPersistedData();

  //     // Check current permission status
  //     await checkExistingPermissions();

  //     // Don't start tracking - wait for onboarding completion
  //     console.log("Onboarding initialization completed");
  //   } catch (error) {
  //     console.error("Failed to initialize for onboarding:", error);
  //     throw error;
  //   }
  // }, [getToken, checkExistingPermissions]);

  // const completeLocationOnboarding = useCallback(async (granted: boolean) => {
  //   try {
  //     const token = await getToken();
  //     if(!token) return

  //     if (granted) {
  //       // Initialize full data and start tracking
  //       await locationService.initializeData(token);

  //       // Update onboarding status in database
  //       await apiService.saveLocationPermission(
  //          true, token);

  //       console.log("Location onboarding completed successfully");
  //     } else {

  //       console.log("User declined location permissions");
  //     }
  //   } catch (error) {
  //     console.error("Failed to complete location onboarding:", error);
  //     throw error;
  //   }
  // }, [getToken]);

  const startLocationTrackingEnhanced = useCallback(async () => {
    try {
      const token = await getToken();
      await locationService.startLocationTrackingEnhanced(token);
      setIsTracking(true);
      setCurrentSessionDuration(0);
      console.log("Enhanced tracking started successfully");
    } catch (error) {
      console.error("Failed to start enhanced tracking:", error);
      setIsTracking(false);
      throw error;
    }
  }, [getToken]);

  const initializeData = useCallback(async () => {
    try {
      const token = await getToken();
      console.log("Initializing data with token:", !!token);

      await locationService.checkAndinitializePermissions(token);
      await locationService.initializeData(token);

      // Update state from service
      setCurrentStreetId(locationService.getCurrentStreetId());
      setStreetData(locationService.getStreetData());
      setVisitedStreets(locationService.getVisitedStreets());
      setAllVisitedStreetIds(new Set(locationService.getAllVisitedStreetIds()));
      setTotalActiveHours(locationService.getTotalActiveHours());

      console.log("Enhanced data initialized successfully");
    } catch (error) {
      console.error("Failed to initialize enhanced data:", error);
      setHasBackgroundPermission(false);
      setHasBackgroundPermission(false);
      throw error;
    }
  }, [getToken]);

  const getAllStreetVisitData = useCallback((): Map<
    string,
    StreetVisitData
  > => {
    return locationService.getAllStreetVisitData();
  }, []);

  const getMostVisitedStreets = useCallback((limit: number = 10) => {
    return locationService.getMostVisitedStreets(limit);
  }, []);

  const getStreetsByTimeSpent = useCallback((limit: number = 10) => {
    return locationService.getStreetsByTimeSpent(limit);
  }, []);

  // Active hours methods
  const getDailyActiveTime = useCallback((date?: string) => {
    return locationService.getDailyActiveTime(date);
  }, []);

  const getWeeklyActiveTime = useCallback(() => {
    return locationService.getWeeklyActiveTime();
  }, []);

  const getMonthlyActiveTime = useCallback(() => {
    return locationService.getMonthlyActiveTime();
  }, []);

  const contextValue: LocationTrackingContextType = {
    // Location state
    userLocation,
    currentStreetId,
    streetData,
    visitedStreets,
    allVisitedStreetIds,

    // Visit tracking
    getStreetVisitData,
    getAllStreetVisitData,
    getMostVisitedStreets,
    getStreetsByTimeSpent,

    // Active hours tracking
    totalActiveHours,
    currentSessionDuration,
    getDailyActiveTime,
    getWeeklyActiveTime,
    getMonthlyActiveTime,

    // Control methods
    startTracking,
    stopTracking,
    isTracking,

    // Permission status
    hasBackgroundPermission,
    requestLocationPermission,

    // Data
    initializeData,
    destroyService,

    requestFullLocationPermissions,
    checkExistingPermissions,


    startLocationTrackingEnhanced,
    showPermissionPanel,
    setShowPermissionPanel,
  };
  return (
    <LocationTrackingContext.Provider value={contextValue}>
      {children}
    </LocationTrackingContext.Provider>
  );
};

export const useLocationTracking = (): LocationTrackingContextType => {
  const context = useContext(LocationTrackingContext);
  if (!context) {
    throw new Error(
      "useLocationTracking must be used within a LocationTrackingProvider"
    );
  }
  return context;
};
