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
  hasLocationPermission: boolean;
  requestLocationPermission: (token: string | null) => Promise<boolean>;

  initializeData: () => Promise<void>;
  destroyService: (token?: string | null) => Promise<void>;
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
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [totalActiveHours, setTotalActiveHours] = useState(0);
  const [currentSessionDuration, setCurrentSessionDuration] = useState(0);

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
      setHasLocationPermission(hasPermission);
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

    // Add listeners
    locationService.addLocationUpdateListener(handleLocationUpdate);
    locationService.addStreetChangeListener(handleStreetChange);
    locationService.addVisitCountUpdateListener(handleVisitCountUpdate);
    locationService.addActiveHoursUpdateListener(handleActiveHoursUpdate);
    locationService.addPermissionStatusListener(handlePermissionStatusUpdate);

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
      locationService.removeStreetChangeListener(handleStreetChange);
      locationService.removeVisitCountUpdateListener(handleVisitCountUpdate);
      locationService.removeActiveHoursUpdateListener(handleActiveHoursUpdate);
      locationService.removePermissionStatusListener(
        handlePermissionStatusUpdate
      );
      clearInterval(sessionInterval);
    };
  }, [triggerUpdate]);

  const initializeData = useCallback(async () => {
    try {
      const token = await getToken();
      console.log("Initializing data with token:", !!token);

      await locationService.initializeData(token);

      // After initialization, update state from service again
      setCurrentStreetId(locationService.getCurrentStreetId());
      setStreetData(locationService.getStreetData());
      setVisitedStreets(locationService.getVisitedStreets());
      setAllVisitedStreetIds(new Set(locationService.getAllVisitedStreetIds()));
      setTotalActiveHours(locationService.getTotalActiveHours());

      console.log("Data initialized successfully");
      console.log(
        "- Street data available:",
        !!locationService.getStreetData()
      );
      console.log(
        "- Total visited streets:",
        locationService.getAllVisitedStreetIds().size
      );
    } catch (error) {
      console.error("Failed to initializeData:", error);
      setHasLocationPermission(false);
      throw error;
    }
  }, [getToken]);

  const startTracking = useCallback(async (enableBackground: boolean) => {
    try {
      await locationService.startLocationTracking(enableBackground);
      setIsTracking(true);
      setHasLocationPermission(true);
      setCurrentSessionDuration(0);

      console.log("Tracking started successfully");
    } catch (error) {
      console.error("Failed to start tracking:", error);
      setHasLocationPermission(false);
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
    token: string | null
  ): Promise<boolean> => {
    try {
      const granted = await locationService.requestLocationPermission(token);
      setHasLocationPermission(granted);
      return granted;
    } catch (error) {
      console.error("Permission denied:", error);
      setHasLocationPermission(false);
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
    hasLocationPermission,
    requestLocationPermission,

    // Data
    initializeData,
    destroyService,
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
