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
  showPermissionPanel: boolean;
  setShowPermissionPanel: (show: boolean) => void;

  // Core methods
  initializeData: () => Promise<void>;
  destroyService: (token?: string | null) => Promise<void>;

  // Permission methods (streamlined)
  requestFullLocationPermissions: () => Promise<{
    backgroundGranted: boolean;
    success: boolean;
  }>;
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
   showPermissionPanel,
   setShowPermissionPanel,

   // Core methods
   initializeData,
   destroyService,
   requestFullLocationPermissions,
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
