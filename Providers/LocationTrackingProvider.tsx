import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  LocationTrackingService,
  StreetVisitData,
} from "../services/LocationTrackingService";
import type { UserCoords, StreetData, VisitedStreet } from "@/types/world";
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
  startTracking: (enableBackground?: boolean) => Promise<void>;
  stopTracking: () => Promise<void>;
  isTracking: boolean;

  // Permission status
  hasLocationPermission: boolean;
  requestLocationPermission: () => Promise<boolean>;
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


  useEffect(() => {
    // Set up event listeners
    const handleLocationUpdate = (location: UserCoords) => {
      setUserLocation(location);
    };

    const handleStreetChange = (
      streetId: string | null,
      coords: UserCoords
    ) => {
      setCurrentStreetId(streetId);
      // Refresh visited streets and street IDs
      setVisitedStreets(locationService.getVisitedStreets());
      setAllVisitedStreetIds(locationService.getAllVisitedStreetIds());
    };
    const handleVisitCountUpdate = (
      streetId: string,
      visitData: StreetVisitData
    ) => {
      // Force re-render of components that depend on visit data
      // This could trigger analytics updates, UI refreshes, etc.
      console.log(`Visit count updated for street ${streetId}:`, visitData);
    };

    const handleActiveHoursUpdate = (activeHours: number) => {
      setTotalActiveHours(activeHours);
    };

    // Add listeners
    locationService.addLocationUpdateListener(handleLocationUpdate);
    locationService.addStreetChangeListener(handleStreetChange);
    locationService.addVisitCountUpdateListener(handleVisitCountUpdate);
    locationService.addActiveHoursUpdateListener(handleActiveHoursUpdate);

    // Initialize state from service
    setCurrentStreetId(locationService.getCurrentStreetId());
    setStreetData(locationService.getStreetData());
    setVisitedStreets(locationService.getVisitedStreets());
    setAllVisitedStreetIds(locationService.getAllVisitedStreetIds());
    setTotalActiveHours(locationService.getTotalActiveHours());
    setIsTracking(locationService.isTracking());

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
      clearInterval(sessionInterval);
    };
  }, []);

const startTracking = async (enableBackground: boolean = true) => {
  try {
    await locationService.startLocationTracking(enableBackground);
    setIsTracking(true);
    setHasLocationPermission(true);
    setCurrentSessionDuration(0); // Reset session duration
  } catch (error) {
    console.error("Failed to start tracking:", error);
    setHasLocationPermission(false);
    throw error;
  }
};

  
  //! this is calling react hooks with is wrong
const stopTracking = async () => {
  try {
    const token = await getToken();

    // Pass the token to the service
    await locationService.stopLocationTracking(token);
    setIsTracking(false);
    setCurrentSessionDuration(0);
  } catch (error) {
    console.error("Failed to stop tracking:", error);
    throw error;
  }
};
    const requestLocationPermission = async (): Promise<boolean> => {
      try {
        await startTracking(true);
        return true;
      } catch (error) {
        console.error("Permission denied:", error);
        return false;
      }
    };

    const getStreetVisitData = (streetId: string): StreetVisitData | null => {
      return locationService.getStreetVisitData(streetId);
    };

    const getAllStreetVisitData = (): Map<string, StreetVisitData> => {
      return locationService.getAllStreetVisitData();
    };

    const getMostVisitedStreets = (limit: number = 10) => {
      return locationService.getMostVisitedStreets(limit);
    };

    const getStreetsByTimeSpent = (limit: number = 10) => {
      return locationService.getStreetsByTimeSpent(limit);
    };

    // Active hours methods
    const getDailyActiveTime = (date?: string) => {
      return locationService.getDailyActiveTime(date);
    };

    const getWeeklyActiveTime = () => {
      return locationService.getWeeklyActiveTime();
    };

    const getMonthlyActiveTime = () => {
      return locationService.getMonthlyActiveTime();
    };

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
