import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { TimeSpentTrackingService } from "../services/TimeSpentTrackerService";
import type { UserCoords } from "@/types/world";
import { useAuth } from "@clerk/clerk-expo";
import {
  MovementData,
  StationarySession,
  TimeSpentLocation,
} from "@/types/timeSpentTraker";

interface TimeSpentTrackingContextType {
  // Current state
  currentStationarySession: StationarySession | null;
  timeSpentLocations: TimeSpentLocation[];
  currentStationaryDuration: number;
  isCurrentlyStationary: boolean;
  currentMovementData: MovementData | null;

  // Location management
  getTimeSpentLocation: (locationId: string) => TimeSpentLocation | null;
  getTopTimeSpentLocations: (limit?: number) => TimeSpentLocation[];
  getMostVisitedTimeSpentLocations: (limit?: number) => TimeSpentLocation[];
  getTotalTimeSpentAllLocations: () => number;

  // Movement data
  getMovementHistory: () => Array<{
    coords: UserCoords;
    timestamp: number;
    speed: number;
  }>;

  // Control methods
  startTracking: () => void;
  stopTracking: () => Promise<void>;
  isTracking: boolean;
  processLocationUpdate: (location: UserCoords) => void;

  // Manual session control (for testing or manual overrides)
  forceEndCurrentSession: () => void;
}

const TimeSpentTrackingContext =
  createContext<TimeSpentTrackingContextType | null>(null);

interface TimeSpentTrackingProviderProps {
  children: ReactNode;
}

export const TimeSpentTrackingProvider: React.FC<
  TimeSpentTrackingProviderProps
> = ({ children }) => {
  const [currentStationarySession, setCurrentStationarySession] =
    useState<StationarySession | null>(null);
  const [timeSpentLocations, setTimeSpentLocations] = useState<
    TimeSpentLocation[]
  >([]);
  const [currentStationaryDuration, setCurrentStationaryDuration] = useState(0);
  const [isCurrentlyStationary, setIsCurrentlyStationary] = useState(false);
  const [currentMovementData, setCurrentMovementData] =
    useState<MovementData | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const timeSpentService = TimeSpentTrackingService.getInstance();
  const { getToken } = useAuth();

  useEffect(() => {
    // Set up event listeners
    const handleStationarySessionStart = (session: StationarySession) => {
      setCurrentStationarySession(session);
      console.log("Stationary session started:", session);
    };

    const handleStationarySessionEnd = (
      session: StationarySession,
      finalLocation: TimeSpentLocation | null
    ) => {
      setCurrentStationarySession(null);
      if (finalLocation) {
        // Update locations list
        setTimeSpentLocations(timeSpentService.getTimeSpentLocations());
      }
      console.log("Stationary session ended:", session, finalLocation);
    };

    const handleTimeSpentLocationUpdate = (location: TimeSpentLocation) => {
      // Update the locations list when a location is updated
      setTimeSpentLocations(timeSpentService.getTimeSpentLocations());
      console.log("Time spent location updated:", location);
    };

    const handleMovementStatusChange = (movementData: MovementData) => {
      setIsCurrentlyStationary(movementData.isStationary);
      setCurrentMovementData(movementData);
    };

    // Add listeners
    timeSpentService.addStationarySessionStartListener(
      handleStationarySessionStart
    );
    timeSpentService.addStationarySessionEndListener(
      handleStationarySessionEnd
    );
    timeSpentService.addTimeSpentLocationUpdateListener(
      handleTimeSpentLocationUpdate
    );
    timeSpentService.addMovementStatusChangeListener(
      handleMovementStatusChange
    );

    // Initialize state from service
    setCurrentStationarySession(timeSpentService.getCurrentStationarySession());
    setTimeSpentLocations(timeSpentService.getTimeSpentLocations());
    setIsCurrentlyStationary(timeSpentService.isCurrentlyStationary());
    setIsTracking(timeSpentService.isTracking());

    // Update current session duration every 10 seconds when active
    const durationInterval = setInterval(() => {
      if (timeSpentService.isCurrentlyStationary()) {
        setCurrentStationaryDuration(
          timeSpentService.getCurrentStationaryDuration()
        );
      } else {
        setCurrentStationaryDuration(0);
      }
    }, 10000);

    // Cleanup listeners on unmount
    return () => {
      timeSpentService.removeStationarySessionStartListener(
        handleStationarySessionStart
      );
      timeSpentService.removeStationarySessionEndListener(
        handleStationarySessionEnd
      );
      timeSpentService.removeTimeSpentLocationUpdateListener(
        handleTimeSpentLocationUpdate
      );
      timeSpentService.removeMovementStatusChangeListener(
        handleMovementStatusChange
      );
      clearInterval(durationInterval);
    };
  }, []);

  const startTracking = () => {
    try {
      timeSpentService.startTracking();
      setIsTracking(true);
      console.log("Time spent tracking started");
    } catch (error) {
      console.error("Failed to start time spent tracking:", error);
      throw error;
    }
  };

  const stopTracking = async () => {
    try {
      const token = await getToken();
      await timeSpentService.stopTracking(token);
      setIsTracking(false);
      setCurrentStationarySession(null);
      setCurrentStationaryDuration(0);
      setIsCurrentlyStationary(false);
      setCurrentMovementData(null);
      console.log("Time spent tracking stopped");
    } catch (error) {
      console.error("Failed to stop time spent tracking:", error);
      throw error;
    }
  };

  const processLocationUpdate = (location: UserCoords) => {
    timeSpentService.processLocationUpdate(location);
  };

  const getTimeSpentLocation = (
    locationId: string
  ): TimeSpentLocation | null => {
    return timeSpentService.getTimeSpentLocation(locationId);
  };

  const getTopTimeSpentLocations = (
    limit: number = 10
  ): TimeSpentLocation[] => {
    return timeSpentService.getTopTimeSpentLocations(limit);
  };

  const getMostVisitedTimeSpentLocations = (
    limit: number = 10
  ): TimeSpentLocation[] => {
    return timeSpentService.getMostVisitedTimeSpentLocations(limit);
  };

  const getTotalTimeSpentAllLocations = (): number => {
    return timeSpentService.getTotalTimeSpentAllLocations();
  };

  const getMovementHistory = (): Array<{
    coords: UserCoords;
    timestamp: number;
    speed: number;
  }> => {
    return timeSpentService.getMovementHistory();
  };

  const forceEndCurrentSession = () => {
    if (currentStationarySession && currentStationarySession.isActive) {
      // This is a manual override - you might want to implement this in the service
      console.log("Force ending current stationary session");
      // For now, we can simulate movement by processing a location far away
      if (currentStationarySession.centerCoords) {
        const farAwayLocation: UserCoords = {
          latitude: currentStationarySession.centerCoords.latitude + 0.001, // ~100m away
          longitude: currentStationarySession.centerCoords.longitude + 0.001,
        };
        processLocationUpdate(farAwayLocation);
      }
    }
  };

  const contextValue: TimeSpentTrackingContextType = {
    // Current state
    currentStationarySession,
    timeSpentLocations,
    currentStationaryDuration,
    isCurrentlyStationary,
    currentMovementData,

    // Location management
    getTimeSpentLocation,
    getTopTimeSpentLocations,
    getMostVisitedTimeSpentLocations,
    getTotalTimeSpentAllLocations,

    // Movement data
    getMovementHistory,

    // Control methods
    startTracking,
    stopTracking,
    isTracking,
    processLocationUpdate,

    // Manual session control
    forceEndCurrentSession,
  };

  return (
    <TimeSpentTrackingContext.Provider value={contextValue}>
      {children}
    </TimeSpentTrackingContext.Provider>
  );
};

export const useTimeSpentTracking = (): TimeSpentTrackingContextType => {
  const context = useContext(TimeSpentTrackingContext);
  if (!context) {
    throw new Error(
      "useTimeSpentTracking must be used within a TimeSpentTrackingProvider"
    );
  }
  return context;
};
