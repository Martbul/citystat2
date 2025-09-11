import * as turf from "@turf/turf";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import {
  BUFFER_GETTING_STREETS,
  LOCATION_ACCURACY,
  LOCATION_DISTANCE_THRESHOLD_M,
  LOCATION_UPDATE_INTERVAL_MS,
  LOCATION_UPDATE_THROTTLE_MS,
  METERS_IN_KILOMETER,
  MIN_MOVEMENT_DISTANCE_METERS,
  STREET_DATA_REFRESH_DISTANCE_KM,
  STREET_LOGGING_DISTANCE_METERS,
  STREET_PROXIMITY_THRESHOLD_METERS,
  TIME_DB_SAVE_NEW_VISITED_STREETS_MILISECONDS,
  TIME_OBTAINING_NEW_LOCATION_MILISECONDS,
} from "@/constants/world";
import type {
  ActiveHoursData,
  FetchedVisitedStreet,
  SaveVisitedStreetsRequest,
  Street,
  StreetData,
  StreetDataResponse,
  StreetVisitData,
  UserCoords,
  VisitedStreet,
  VisitedStreetRequest,
  // StreetVisitCount,
} from "@/types/world";
import { apiService } from "./api";

const BACKGROUND_LOCATION_TASK = "background-location-task";
const STREET_DATA_STORAGE_KEY = "@street_data";
const CURRENT_SESSION_STORAGE_KEY = "@current_session";
const VISIT_COUNTS_STORAGE_KEY = "@visit_counts";
const PENDING_STREETS_STORAGE_KEY = "@pending_streets";
const ACTIVE_HOURS_STORAGE_KEY = "@active_hours";

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }
  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    if (location) {
      LocationTrackingService.handleBackgroundLocationUpdate(location);
    }
  }
});

export class LocationTrackingService {
  private static instance: LocationTrackingService | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private streetData: StreetData | null = null;
  private currentStreetId: string | null = null;
  private streetEntryTime: number | null = null;
  private lastLocationUpdate: number = 0;
  private previousUserCoords: UserCoords | null = null;
  private visitedStreets: VisitedStreet[] = [];
  private allVisitedStreetIds: Set<string> = new Set();
  private streetVisitCounts: Map<string, StreetVisitData> = new Map();
  private currentSessionId: string = this.generateSessionId();
  private isBackgroundTaskRegistered: boolean = false;
  private activeHoursData: ActiveHoursData = {
    totalActiveHours: 0,
    currentSessionStart: null,
    dailyActiveTime: new Map(),
  };
  private lastStreetDataFetch: number = 0;
  private readonly MIN_FETCH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private activeHoursInterval: number | null = null;

  // Event listeners
  private locationUpdateListeners: ((location: UserCoords) => void)[] = [];
  private streetChangeListeners: ((
    streetId: string | null,
    coords: UserCoords
  ) => void)[] = [];
  private visitCountUpdateListeners: ((
    streetId: string,
    visitData: StreetVisitData
  ) => void)[] = [];
  private activeHoursUpdateListeners: ((activeHours: number) => void)[] = [];

  private constructor() {
    this.loadPersistedData();
  }

  public static getInstance(): LocationTrackingService {
    if (!LocationTrackingService.instance) {
      LocationTrackingService.instance = new LocationTrackingService();
    }
    return LocationTrackingService.instance;
  }

  // Event listener methods
  public addLocationUpdateListener(listener: (location: UserCoords) => void) {
    this.locationUpdateListeners.push(listener);
  }

  public removeLocationUpdateListener(
    listener: (location: UserCoords) => void
  ) {
    this.locationUpdateListeners = this.locationUpdateListeners.filter(
      (l) => l !== listener
    );
  }

  public addStreetChangeListener(
    listener: (streetId: string | null, coords: UserCoords) => void
  ) {
    this.streetChangeListeners.push(listener);
  }

  public removeStreetChangeListener(
    listener: (streetId: string | null, coords: UserCoords) => void
  ) {
    this.streetChangeListeners = this.streetChangeListeners.filter(
      (l) => l !== listener
    );
  }

  public addVisitCountUpdateListener(
    listener: (streetId: string, visitData: StreetVisitData) => void
  ) {
    this.visitCountUpdateListeners.push(listener);
  }

  public removeVisitCountUpdateListener(
    listener: (streetId: string, visitData: StreetVisitData) => void
  ) {
    this.visitCountUpdateListeners = this.visitCountUpdateListeners.filter(
      (l) => l !== listener
    );
  }

  public addActiveHoursUpdateListener(listener: (activeHours: number) => void) {
    this.activeHoursUpdateListeners.push(listener);
  }

  public removeActiveHoursUpdateListener(
    listener: (activeHours: number) => void
  ) {
    this.activeHoursUpdateListeners = this.activeHoursUpdateListeners.filter(
      (l) => l !== listener
    );
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadPersistedData() {
    try {
      // Load street data
      const streetDataStr = await AsyncStorage.getItem(STREET_DATA_STORAGE_KEY);
      if (streetDataStr) {
        this.streetData = JSON.parse(streetDataStr);
      }

      // Load visit counts
      const visitCountsStr = await AsyncStorage.getItem(
        VISIT_COUNTS_STORAGE_KEY
      );
      if (visitCountsStr) {
        const visitCountsObj = JSON.parse(visitCountsStr);
        this.streetVisitCounts = new Map(Object.entries(visitCountsObj));
      }

      // Load pending streets
      const pendingStreetsStr = await AsyncStorage.getItem(
        PENDING_STREETS_STORAGE_KEY
      );
      if (pendingStreetsStr) {
        this.visitedStreets = JSON.parse(pendingStreetsStr);
      }

      // Load current session
      const currentSessionStr = await AsyncStorage.getItem(
        CURRENT_SESSION_STORAGE_KEY
      );
      if (currentSessionStr) {
        const sessionData = JSON.parse(currentSessionStr);
        this.currentSessionId = sessionData.sessionId;
        this.currentStreetId = sessionData.currentStreetId;
        this.streetEntryTime = sessionData.streetEntryTime;
      }

      // Load active hours data
      const activeHoursStr = await AsyncStorage.getItem(
        ACTIVE_HOURS_STORAGE_KEY
      );
      if (activeHoursStr) {
        const data = JSON.parse(activeHoursStr);
        this.activeHoursData = {
          ...data,
          dailyActiveTime: new Map(data.dailyActiveTime || []),
        };
      }
    } catch (error) {
      console.error("Error loading persisted data:", error);
    }
  }

  private async persistData() {
    try {
      // Persist street data
      if (this.streetData) {
        await AsyncStorage.setItem(
          STREET_DATA_STORAGE_KEY,
          JSON.stringify(this.streetData)
        );
      }

      // Persist visit counts
      const visitCountsObj = Object.fromEntries(this.streetVisitCounts);
      await AsyncStorage.setItem(
        VISIT_COUNTS_STORAGE_KEY,
        JSON.stringify(visitCountsObj)
      );

      // Persist pending streets
      await AsyncStorage.setItem(
        PENDING_STREETS_STORAGE_KEY,
        JSON.stringify(this.visitedStreets)
      );

      // Persist current session
      const sessionData = {
        sessionId: this.currentSessionId,
        currentStreetId: this.currentStreetId,
        streetEntryTime: this.streetEntryTime,
      };
      await AsyncStorage.setItem(
        CURRENT_SESSION_STORAGE_KEY,
        JSON.stringify(sessionData)
      );

      // Persist active hours data
      const activeHoursData = {
        ...this.activeHoursData,
        dailyActiveTime: Array.from(
          this.activeHoursData.dailyActiveTime.entries()
        ),
      };
      await AsyncStorage.setItem(
        ACTIVE_HOURS_STORAGE_KEY,
        JSON.stringify(activeHoursData)
      );
    } catch (error) {
      console.error("Error persisting data:", error);
    }
  }

  private startActiveHoursTracking() {
    if (this.activeHoursInterval !== null) {
      clearInterval(this.activeHoursInterval);
    }

    this.activeHoursData.currentSessionStart = Date.now();

    // Update active hours every minute
    this.activeHoursInterval = setInterval(() => {
      this.updateActiveHours();
    }, 60000);

    console.log("Started active hours tracking");
  }

  private stopActiveHoursTracking() {
    if (this.activeHoursInterval) {
      clearInterval(this.activeHoursInterval);
      this.activeHoursInterval = null;
    }

    // Final update when stopping
    this.updateActiveHours();
    this.activeHoursData.currentSessionStart = null;

    console.log("Stopped active hours tracking");
  }

  // private updateActiveHours() {
  //   if (!this.activeHoursData.currentSessionStart) return;

  //   const now = Date.now();
  //   const sessionDuration = now - this.activeHoursData.currentSessionStart;
  //   const hoursToAdd = sessionDuration / (1000 * 60 * 60); // Convert to hours

  //   // Update total active hours
  //   this.activeHoursData.totalActiveHours += hoursToAdd;

  //   // Update daily active time
  //   const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  //   const currentDailyTime =
  //     this.activeHoursData.dailyActiveTime.get(today) || 0;
  //   this.activeHoursData.dailyActiveTime.set(
  //     today,
  //     currentDailyTime + Math.floor(sessionDuration / 1000) // Store daily time in seconds
  //   );

  //   // Reset session start for next interval
  //   this.activeHoursData.currentSessionStart = now;

  //   // Notify listeners
  //   this.activeHoursUpdateListeners.forEach((listener) =>
  //     listener(this.activeHoursData.totalActiveHours)
  //   );

  //   // Persist the updated data
  //   this.persistData();
  // }

  private updateActiveHours() {
    if (!this.activeHoursData.currentSessionStart) return;

    const now = Date.now();
    const MINUTE_IN_MS = 60 * 1000;

    // Add exactly one minute (since this runs every minute)
    const minutesToAdd = 1 / 60; // 1 minute = 1/60 hours
    this.activeHoursData.totalActiveHours += minutesToAdd;

    // Update daily active time (add 60 seconds)
    const today = new Date().toISOString().split("T")[0];
    const currentDailyTime =
      this.activeHoursData.dailyActiveTime.get(today) || 0;
    this.activeHoursData.dailyActiveTime.set(today, currentDailyTime + 60);

    // Update session start for next interval
    this.activeHoursData.currentSessionStart = now;

    // Notify listeners
    this.activeHoursUpdateListeners.forEach((listener) =>
      listener(this.activeHoursData.totalActiveHours)
    );

    // Persist the updated data
    this.persistData();
  }

  public async initializeData(token: string | null): Promise<void> {
    if (!token) {
      console.log("No token provided - skipping server data sync");
      return;
    }

    try {
      console.log("=== STARTING DATA INITIALIZATION ===");

      // 1. Load persisted data first (this includes street data and visit counts)
      console.log("Step 1: Loading persisted local data...");
      await this.loadPersistedData();
      console.log("✅ Persisted data loaded");
      console.log("- Local visit counts:", this.streetVisitCounts.size);
      console.log("- Local visited street IDs:", this.allVisitedStreetIds.size);

      // 2. Initialize permissions
      console.log("Step 2: Initializing permissions...");
      await this.initializePermissions(token);
      console.log("✅ Permissions initialized");

      // 3. Load and sync server data (this will call fetchVisitedStreets API)
      console.log("Step 3: Syncing with server data...");
      await this.syncServerData(token);
      console.log("✅ Server data synchronized");

      // 4. Force update the allVisitedStreetIds from the visit counts (in case of any missed data)
      console.log("Step 4: Final refresh of visited street IDs...");
      this.refreshVisitedStreetIds();
      console.log("✅ Street IDs refreshed");

      // 5. If we have a current location, check street proximity immediately
      if (this.previousUserCoords && this.streetData) {
        console.log(
          "Step 5: Re-checking street proximity with current location..."
        );
        this.checkStreetProximity(this.previousUserCoords);
        console.log("✅ Street proximity checked");
      } else {
        console.log(
          "Step 5: No current location available for proximity check"
        );
      }

      console.log("=== DATA INITIALIZATION COMPLETED SUCCESSFULLY ===");
      console.log("Final initialization state:");
      console.log(
        "- Street data features:",
        this.streetData?.features?.length || 0
      );
      console.log("- Visit counts:", this.streetVisitCounts.size);
      console.log("- All visited street IDs:", this.allVisitedStreetIds.size);
      console.log("- Current street ID:", this.currentStreetId);
      console.log("- Has user location:", !!this.previousUserCoords);
      console.log(
        "- Total active hours:",
        this.activeHoursData.totalActiveHours
      );

      // Debug: Show some sample data
      if (this.allVisitedStreetIds.size > 0) {
        console.log(
          "Sample visited street IDs:",
          Array.from(this.allVisitedStreetIds).slice(0, 5)
        );
      }
      if (this.streetVisitCounts.size > 0) {
        const firstEntry = this.streetVisitCounts.entries().next().value;
        console.log("Sample visit data:", firstEntry);
      }
    } catch (e) {
      let error = e as Error;
      console.error("Failed to initialize data:", error);
      console.error("Error stack:", error.stack);
      throw error;
    }
  }

  private refreshVisitedStreetIds() {
    // Rebuild the set from visit counts
    this.allVisitedStreetIds = new Set(this.streetVisitCounts.keys());

    // Also add any streets from the current session
    this.visitedStreets.forEach((street) => {
      this.allVisitedStreetIds.add(street.streetId);
    });

    console.log("Refreshed visited street IDs:", this.allVisitedStreetIds.size);
  }

  private async loadActiveHoursFromServer(token: string): Promise<void> {
    try {
      // Add this API call to your service
      //! dont create separete call for hourse , pull the from the user obj
      const serverActiveHours = (await apiService.fetchUser(token)).activeHours;
      console.log("serverActiveHours: ", serverActiveHours);
      if (
        serverActiveHours &&
        serverActiveHours > this.activeHoursData.totalActiveHours
      ) {
        // Server has more recent data, use it
        this.activeHoursData.totalActiveHours = serverActiveHours;

        // Notify listeners
        this.activeHoursUpdateListeners.forEach((listener) =>
          listener(this.activeHoursData.totalActiveHours)
        );
      }
    } catch (error) {
      console.error("Failed to load active hours from server:", error);
      // Continue with local data
    }
  }

  private async syncServerData(token: string): Promise<void> {
    try {
      // Load visited streets from server and merge with local data
      const serverDataLoaded = await this.loadVisitedStreetsFromDatabase(token);

      if (!serverDataLoaded) {
        console.log("ERROR SYNCHRONIZIATION");
      }

      console.log(
        "-----------Server data synchronized successfully",
        serverDataLoaded
      );

      //! here if you receive from server visited street that is already in the arr do not add it
      // Load any other server data (active hours, preferences, etc.)
      await this.loadActiveHoursFromServer(token);

      // After loading server data, persist the merged state locally
      await this.persistData();
    } catch (error) {
      console.error("Error syncing server data:", error);
      // Don't throw - allow app to work with local data only
    }
  }

  public async startLocationTracking(enableBackground: boolean) {
    try {
      this.startActiveHoursTracking();

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: TIME_OBTAINING_NEW_LOCATION_MILISECONDS,
      });

      this.handleLocationUpdate(initialLocation);

      // Start foreground location watching
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: LOCATION_ACCURACY,
          timeInterval: LOCATION_UPDATE_INTERVAL_MS,
          distanceInterval: LOCATION_DISTANCE_THRESHOLD_M,
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      this.locationSubscription = subscription;

      // Request background permissions and start background tracking if needed
      if (enableBackground) {
        try {
          const backgroundStatus =
            await Location.requestBackgroundPermissionsAsync();
          if (backgroundStatus.status === "granted") {
            await this.startBackgroundLocationUpdates();
          } else {
            console.warn(
              "Background location permission not granted - continuing with foreground only"
            );
          }
        } catch (backgroundError) {
          console.warn(
            "Failed to start background location (continuing with foreground):",
            backgroundError
          );
          // Don't throw here - foreground tracking is still working
        }
      }

      console.log("Location tracking started successfully");
    } catch (error) {
      // Clean up if something went wrong
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }
      this.stopActiveHoursTracking();

      console.error("Error starting location tracking:", error);
      throw error;
    }
  }

  private async loadPermissionStatus(token: string) {
    try {
      const saved = await apiService.getLocationPermission(token);
      console.log("saved location permission: " + saved);
      return saved === true;
    } catch (error) {
      console.error("Error loading permission status:", error);
      return null;
    }
  }

  private async initializePermissions(token: string | null) {
    try {
      if (!token) return;

      // Request foreground permissions first
      const { status: requestStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (requestStatus !== "granted") {
        console.log("Foreground location permission denied by user");
        this.setHasLocationPermission(false);
        return;
      }

      // Load user's explicit choice from database
      const savedPermission = await this.loadPermissionStatus(token);
      console.log("User's saved permission choice:", savedPermission);

      // Check current system permission (should be granted from above request)
      const { status: currentStatus } =
        await Location.getForegroundPermissionsAsync();
      const hasSystemPermission = currentStatus === "granted";
      console.log("System permission status:", currentStatus);

      if (savedPermission === true && hasSystemPermission) {
        console.log(
          "Starting tracking: User opted in + system permission granted"
        );
        this.setHasLocationPermission(true);
      } else if (savedPermission === true && !hasSystemPermission) {
        console.log(
          "User opted in but system permission revoked - this shouldn't happen after request"
        );
        this.setHasLocationPermission(false);
      } else if (savedPermission === false) {
        console.log("User explicitly opted out of location tracking");
        this.setHasLocationPermission(false);
      } else if (savedPermission === null) {
        console.log(
          "User hasn't made a choice yet - treating permission request as opt-in"
        );
        // Since they just granted permission, save this as opt-in
        await this.savePermissionStatus(token, true);
        this.setHasLocationPermission(true);
      }
    } catch (error) {
      console.error("Error initializing permissions:", error);
      this.setHasLocationPermission(false);
    }
  }

  private async savePermissionStatus(token: string, hasPermission: boolean) {
    try {
      await apiService.saveLocationPermission(hasPermission, token);
      console.log("Permission status saved to database:", hasPermission);
    } catch (error) {
      console.error("Error saving permission status:", error);
    }
  }

  private async loadVisitedStreetsFromDatabase(token: string) {
    try {
      console.log("Loading visited streets from database...");
      const response = await apiService.fetchVisitedStreets(token);

      if (response.data && response.status == "success") {
        console.log(
          `Received ${response.data.length} visited streets from database`
        );

        // Convert API response to internal format and merge with existing data
        response.data.forEach((streetData: StreetDataResponse) => {
          console.log("singlestreetdata:+++  ", streetData);

          const visitData: StreetVisitData = {
            visitCount: streetData.visitCount,
            firstVisit: streetData.firstVisit,
            lastVisit: streetData.lastVisit,
            totalTimeSpent: streetData.totalTimeSpent,
            averageTimeSpent: streetData.averageTimeSpent,
          };

          // Only update visit counts if server data is newer or we don't have local data
          const existingData = this.streetVisitCounts.get(streetData.streetId);
          if (!existingData || streetData.lastVisit > existingData.lastVisit) {
            this.streetVisitCounts.set(streetData.streetId, visitData);
          }

          // Check if this street is already in visitedStreets to prevent duplicates
          const existsInVisitedStreets = this.visitedStreets.some(
            (street) =>
              street.streetId === streetData.streetId &&
              street.timestamp === streetData.entryTimestamp
          );

          if (!existsInVisitedStreets) {
            // Convert server format to local VisitedStreet format
            const visitedStreet: VisitedStreet = {
              streetId: streetData.streetId,
              streetName: streetData.streetName,
              timestamp: streetData.entryTimestamp,
              coordinates: {
                latitude: parseFloat(streetData.entryLatitude),
                longitude: parseFloat(streetData.entryLongitude),
              },
              duration: streetData.durationSeconds || undefined,
            };

            this.visitedStreets.push(visitedStreet);
          } else {
            console.log(
              `Street ${streetData.streetId} already exists in visitedStreets, skipping`
            );
          }

          this.allVisitedStreetIds.add(streetData.streetId);
        });

        // Persist the merged data
        await this.persistData();

        console.log(`Final state after loading:`);
        console.log(`- Visit counts: ${this.streetVisitCounts.size}`);
        console.log(`- Visited streets: ${this.visitedStreets.length}`);
        console.log(
          `- All visited street IDs: ${this.allVisitedStreetIds.size}`
        );

        return true;
      } else {
        console.log(response);
        console.warn("Failed to load visited streets:", response);
        return false;
      }
    } catch (error) {
      console.error("Error loading visited streets from database:", error);
      return false;
    }
  }

  private async startBackgroundLocationUpdates() {
    try {
      // Check if task is already registered
      const isTaskDefined = TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);

      if (this.isBackgroundTaskRegistered && isTaskDefined) {
        console.log("Background location updates already running");
        return;
      }

      // Check if app is in foreground - required to start background location
      if (AppState.currentState !== "active") {
        console.log("Cannot start background location - app not in foreground");
        // We'll try to start it later when app becomes active
        this.scheduleBackgroundLocationStart();
        return;
      }

      // Stop any existing updates first (cleanup)
      if (isTaskDefined) {
        try {
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        } catch (stopError) {
          console.log(
            "Error stopping existing background task (continuing):",
            stopError
          );
        }
      }

      // Start new background updates
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION_UPDATE_INTERVAL_MS * 2, // Less frequent in background
        distanceInterval: LOCATION_DISTANCE_THRESHOLD_M,
        foregroundService: {
          notificationTitle: "Street Tracking",
          notificationBody: "Tracking your visited streets",
        },
      });

      this.isBackgroundTaskRegistered = true;
      console.log("Background location updates started successfully");
    } catch (e) {
      let error = e as Error;

      console.error("Error starting background location updates:", error);
      this.isBackgroundTaskRegistered = false;

      // If it failed because app is in background, schedule it for later
      if (error.message && error.message.includes("background")) {
        console.log("Will retry background location when app becomes active");
        this.scheduleBackgroundLocationStart();
      } else {
        throw error;
      }
    }
  }

  // Add this helper method to schedule background location start:
  private scheduleBackgroundLocationStart() {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && !this.isBackgroundTaskRegistered) {
        console.log(
          "App became active - attempting to start background location"
        );
        this.startBackgroundLocationUpdates().catch((error) => {
          console.error(
            "Failed to start background location on app active:",
            error
          );
        });

        // Remove the listener after successful attempt
        subscription?.remove();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
  }

  public async stopLocationTracking(token: string | null) {
    this.stopActiveHoursTracking();

    // Stop foreground tracking
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    // Stop background tracking - check if task exists first
    try {
      const isTaskDefined = TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);
      if (isTaskDefined && this.isBackgroundTaskRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.log("Background location updates stopped");
      } else if (!isTaskDefined && this.isBackgroundTaskRegistered) {
        console.log("Task was not defined but flag was set - resetting flag");
      }
    } catch (e) {
      let error = e as Error;
      if (error.message?.includes("TaskNotFoundException")) {
        console.log(
          "Background task already stopped or not found - this is normal"
        );
      } else {
        console.log("Unexpected error stopping background location:", error);
      }
    } finally {
      this.isBackgroundTaskRegistered = false;
    }

    // Save any pending data
    if (token) {
      try {
        await this.saveVisitedStreetsToDatabase(token);
        await this.saveActiveHoursToDatabase(token);
      } catch (error) {
        console.error("Error saving data during stop:", error);
      }
    }

    await this.persistData();
    console.log("Location tracking stopped");
  }

  public static async handleBackgroundLocationUpdate(
    location: Location.LocationObject
  ) {
    const service = LocationTrackingService.getInstance();
    service.handleLocationUpdate(location);
  }

  private handleLocationUpdate(location: Location.LocationObject) {
    try {
      const { coords } = location;
      const newUserCoords: UserCoords = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      // Validate coordinates
      if (
        !isFinite(newUserCoords.latitude) ||
        !isFinite(newUserCoords.longitude)
      ) {
        console.warn("Invalid coordinates received:", newUserCoords);
        return;
      }

      // Throttle updates
      const now = Date.now();
      if (now - this.lastLocationUpdate < LOCATION_UPDATE_THROTTLE_MS) {
        return;
      }
      this.lastLocationUpdate = now;

      // Check movement distance
      if (this.previousUserCoords) {
        const movementDistance = this.calculateDistance(
          this.previousUserCoords.latitude,
          this.previousUserCoords.longitude,
          newUserCoords.latitude,
          newUserCoords.longitude
        );

        if (movementDistance < MIN_MOVEMENT_DISTANCE_METERS) {
          return;
        }
      }

      console.log("Processing location update:", newUserCoords);

      // Notify listeners
      this.locationUpdateListeners.forEach((listener) =>
        listener(newUserCoords)
      );

      console.log("=== LOCATION UPDATE DEBUG ===");
      console.log("Current street ID:", this.currentStreetId);
      console.log("Street data exists:", !!this.streetData);
      console.log(
        "Street data features count:",
        this.streetData?.features?.length || 0
      );
      console.log("User coordinates:", newUserCoords);
      // console.log("Has location permission:", this.hasLocationPermission);

      // Check street proximity
      if (this.streetData) {
        this.checkStreetProximity(newUserCoords);
      } else {
        console.log("No street data available for proximity check");
      }

      // Fetch new street data if needed
      if (!this.streetData || this.shouldRefreshStreetData(newUserCoords)) {
        this.fetchStreetData(newUserCoords);
      }

      this.previousUserCoords = newUserCoords;
      this.persistData(); // Persist state changes
    } catch (error) {
      console.error("Error handling location update:", error);
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private async fetchStreetData(coords: UserCoords) {
    this.lastStreetDataFetch = Date.now();
    try {
      const buffer = BUFFER_GETTING_STREETS * 1.5;
      const bbox = [
        coords.longitude - buffer,
        coords.latitude - buffer,
        coords.longitude + buffer,
        coords.latitude + buffer,
      ];

      const overpassQuery = `
[out:json][timeout:30];
(
  way["highway"~"^(primary|secondary|tertiary|residential|trunk|motorway|unclassified|living_street|service|footway|path|cycleway|track)$"]
    (${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]});
);
out geom;
`;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.elements || data.elements.length === 0) {
        console.warn("No street elements found in response");
        return;
      }

      const features: Street[] = data.elements
        .filter((element: any) => {
          return (
            element.type === "way" &&
            element.geometry &&
            element.geometry.length > 1
          );
        })
        .map((way: any) => ({
          type: "Feature",
          id: way.id.toString(),
          geometry: {
            type: "LineString",
            coordinates: way.geometry.map((node: any) => [node.lon, node.lat]),
          },
          properties: {
            name: way.tags?.name || `Street ${way.id}`,
            highway: way.tags?.highway,
            surface: way.tags?.surface,
          },
        }));

      this.streetData = {
        type: "FeatureCollection",
        features,
      };

      // Persist the new street data
      await AsyncStorage.setItem(
        STREET_DATA_STORAGE_KEY,
        JSON.stringify(this.streetData)
      );

      console.log(`Successfully loaded ${features.length} streets`);

      if (features.length > 0) {
        this.checkStreetProximity(coords);
      }
    } catch (error) {
      console.error("Error fetching street data:", error);
    }
  }

  // private shouldRefreshStreetData(newCoords: UserCoords): boolean {
  //   if (!this.previousUserCoords) return true;

  //   const distance = turf.distance(
  //     [this.previousUserCoords.longitude, this.previousUserCoords.latitude],
  //     [newCoords.longitude, newCoords.latitude],
  //     { units: "kilometers" }
  //   );

  //   return distance > STREET_DATA_REFRESH_DISTANCE_KM;
  // }

  private shouldRefreshStreetData(newCoords: UserCoords): boolean {
    const now = Date.now();

    // Prevent too frequent requests
    if (now - this.lastStreetDataFetch < this.MIN_FETCH_INTERVAL_MS) {
      return false;
    }

    if (!this.previousUserCoords) return true;

    const distance = turf.distance(
      [this.previousUserCoords.longitude, this.previousUserCoords.latitude],
      [newCoords.longitude, newCoords.latitude],
      { units: "kilometers" }
    );
    return distance > STREET_DATA_REFRESH_DISTANCE_KM;
  }

  private checkStreetProximity(userCoords: UserCoords) {
    if (!this.streetData || !this.streetData.features.length) {
      console.log("No street data available for proximity check");
      return;
    }

    const userPoint = turf.point([userCoords.longitude, userCoords.latitude]);
    const proximityThresholdKm =
      STREET_PROXIMITY_THRESHOLD_METERS / METERS_IN_KILOMETER;

    console.log("=== STREET PROXIMITY CHECK ===");
    console.log("User point:", [userCoords.longitude, userCoords.latitude]);
    console.log("Proximity threshold (km):", proximityThresholdKm);
    console.log("Total streets to check:", this.streetData.features.length);

    let foundStreet: string | null = null;
    let closestDistance = Infinity;
    let closestStreetName = null;
    let checkedStreets = 0;
    let validStreets = 0;

    this.streetData.features.forEach((street) => {
      checkedStreets++;
      try {
        if (
          !street.geometry.coordinates ||
          street.geometry.coordinates.length < 2
        ) {
          console.log(`Street ${street.id} has invalid coordinates`);
          return;
        }

        validStreets++;
        const streetLine = turf.lineString(street.geometry.coordinates);
        const distanceKm = turf.pointToLineDistance(userPoint, streetLine, {
          units: "kilometers",
        });

        if (distanceKm <= proximityThresholdKm * 2) {
          // console.log(
          //   `Street ${street.id} (${street.properties?.name || "Unnamed"}): ${distanceKm}km away`
          // );
        }

        if (
          distanceKm <= proximityThresholdKm &&
          distanceKm < closestDistance
        ) {
          closestDistance = distanceKm;
          foundStreet = street.id;
          closestStreetName = street.properties?.name || "Unnamed";
          console.log(
            `NEW CLOSEST: ${foundStreet} (${closestStreetName}) at ${distanceKm}km`
          );
        }
      } catch (error) {
        console.warn(`Error processing street ${street.id}:`, error);
      }
    });

    console.log("=== PROXIMITY CHECK RESULTS ===");
    console.log("Checked streets:", checkedStreets);
    console.log("Valid streets:", validStreets);
    console.log("Closest distance:", closestDistance);
    console.log("Found street:", foundStreet);
    console.log("Current street before change:", this.currentStreetId);

    if (foundStreet && foundStreet !== this.currentStreetId) {
      console.log(`STREET CHANGE: ${this.currentStreetId} -> ${foundStreet}`);
      this.handleStreetChange(foundStreet, userCoords);
    } else if (!foundStreet && this.currentStreetId) {
      console.log(`USER LEFT STREET: ${this.currentStreetId} -> null`);
      this.handleStreetChange(null, userCoords);
    } else if (!foundStreet) {
      console.log("User not on any street");
    } else {
      console.log(`User still on same street: ${foundStreet}`);
    }
  }

  private handleStreetChange(newStreetId: string | null, coords: UserCoords) {
    const now = Date.now();
    console.log(
      `=== STREET CHANGE: ${this.currentStreetId} -> ${newStreetId} ===`
    );

    // Handle leaving current street
    if (this.currentStreetId && this.currentStreetId !== newStreetId) {
      const exitTime = now;
      const entryTime = this.streetEntryTime || now;
      const duration = Math.floor((exitTime - entryTime) / 1000);

      // Update the last visited street with duration
      this.visitedStreets = this.visitedStreets.map((street, index) => {
        if (
          index === this.visitedStreets.length - 1 &&
          street.streetId === this.currentStreetId
        ) {
          return { ...street, duration };
        }
        return street;
      });

      // Update visit statistics
      this.updateStreetVisitStats(this.currentStreetId, duration);

      console.log(
        `User left street ${this.currentStreetId}, spent ${duration} seconds`
      );
    }

    // Handle entering new street
    if (newStreetId && newStreetId !== this.currentStreetId) {
      const street = this.streetData?.features.find(
        (s) => s.id === newStreetId
      );
      const streetName =
        street?.properties?.name || `Unknown Street ${newStreetId}`;

      const visitedStreet: VisitedStreet = {
        streetId: newStreetId,
        streetName,
        timestamp: now,
        coordinates: coords,
      };

      this.visitedStreets.push(visitedStreet);
      this.allVisitedStreetIds.add(newStreetId);

      // Update visit count
      this.updateStreetVisitCount(newStreetId);

      this.streetEntryTime = now;
      console.log(`User entered street: ${streetName} (${newStreetId})`);
      console.log(`Session streets: ${this.visitedStreets.length}`);
      console.log(`Total visited streets: ${this.allVisitedStreetIds.size}`);
    }

    // Set the new street ID AFTER handling the change
    this.currentStreetId = newStreetId;

    // Notify listeners with updated state
    this.streetChangeListeners.forEach((listener) =>
      listener(newStreetId, coords)
    );

    this.persistData();
  }

  // Fix the updateStreetVisitCount method to ensure proper notifications
  private updateStreetVisitCount(streetId: string) {
    const existing = this.streetVisitCounts.get(streetId);
    const now = Date.now();

    if (existing) {
      const updated: StreetVisitData = {
        ...existing,
        visitCount: existing.visitCount + 1,
        lastVisit: now,
      };
      this.streetVisitCounts.set(streetId, updated);
      console.log(`Updated visit count for ${streetId}: ${updated.visitCount}`);

      // Notify listeners
      this.visitCountUpdateListeners.forEach((listener) =>
        listener(streetId, updated)
      );
    } else {
      const newData: StreetVisitData = {
        visitCount: 1,
        firstVisit: now,
        lastVisit: now,
        totalTimeSpent: 0,
        averageTimeSpent: 0,
      };
      this.streetVisitCounts.set(streetId, newData);
      console.log(`Created new visit data for ${streetId}: first visit`);

      // Notify listeners
      this.visitCountUpdateListeners.forEach((listener) =>
        listener(streetId, newData)
      );
    }
  }

  // Add a method to get current state for debugging
  public getDebugState() {
    return {
      currentStreetId: this.currentStreetId,
      streetDataFeatures: this.streetData?.features?.length || 0,
      visitedStreetsCount: this.visitedStreets.length,
      allVisitedStreetIdsCount: this.allVisitedStreetIds.size,
      streetVisitCountsSize: this.streetVisitCounts.size,
      isTracking: this.isTracking(),
      hasStreetData: !!this.streetData,
      hasUserLocation: !!this.previousUserCoords,
    };
  }

  private updateStreetVisitStats(streetId: string, duration: number) {
    const existing = this.streetVisitCounts.get(streetId);
    if (existing) {
      const newTotalTime = existing.totalTimeSpent + duration;
      const updated: StreetVisitData = {
        ...existing,
        totalTimeSpent: newTotalTime,
        averageTimeSpent: Math.floor(newTotalTime / existing.visitCount),
      };
      this.streetVisitCounts.set(streetId, updated);

      // Notify listeners
      this.visitCountUpdateListeners.forEach((listener) =>
        listener(streetId, updated)
      );
    }
  }
  public async saveVisitedStreetsToDatabase(token: string) {
    if (this.visitedStreets.length === 0) {
      return;
    }

    try {
      const requestBody: SaveVisitedStreetsRequest = {
        sessionId: this.currentSessionId,
        visitedStreets: this.convertToApiFormat(this.visitedStreets),
      };

      console.log(
        "Saving visited streets to database:",
        this.visitedStreets.length
      );

      // Use your existing API service
      const result = await apiService.saveVisitedStreets(requestBody, token);

      if (result && result.status === "success") {
        console.log("Successfully saved visited streets:", result);

        // Clear visited streets after successful save
        this.visitedStreets = [];
        this.currentSessionId = this.generateSessionId();

        await this.persistData();
      } else {
        throw new Error(`Save operation failed: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error("Error saving visited streets:", error);
      throw error;
    }
  }

  public async saveActiveHoursToDatabase(token: string) {
    try {
      // You'll need to add this method to your API service
      const result = await apiService.updateUserActiveHours(
        {
          activeHours: this.activeHoursData.totalActiveHours,
        },
        token
      );

      if (result) {
        console.log(
          "Successfully saved active hours:",
          this.activeHoursData.totalActiveHours
        );
      } else {
        throw new Error(`Save active hours failed: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error("Error saving active hours:", error);
      throw error;
    }
  }

  public async saveStreetVisitStatsToDatabase(token: string) {
    try {
      const streetStats = Array.from(this.streetVisitCounts.entries()).map(
        ([streetId, visitData]) => ({
          streetId,
          streetName: this.getStreetNameById(streetId),
          visitCount: visitData.visitCount,
          firstVisit: visitData.firstVisit,
          lastVisit: visitData.lastVisit,
          totalTimeSpent: visitData.totalTimeSpent,
          averageTimeSpent: visitData.averageTimeSpent,
        })
      );

      if (streetStats.length === 0) {
        return;
      }

      // You'll need to add this method to your API service
      const result = await apiService.saveStreetVisitStats(
        { streetStats },
        token
      );

      if (result && result.status === "success") {
        console.log(
          "Successfully saved street visit stats:",
          streetStats.length
        );
      } else {
        throw new Error(`Save street stats failed: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error("Error saving street visit stats:", error);
      throw error;
    }
  }

  private getStreetNameById(streetId: string): string {
    const street = this.streetData?.features.find((s) => s.id === streetId);
    return street?.properties?.name || `Unknown Street ${streetId}`;
  }

  private convertToApiFormat(
    visitedStreets: VisitedStreet[]
  ): VisitedStreetRequest[] {
    return visitedStreets.map((street) => ({
      streetId: street.streetId,
      streetName: street.streetName,
      entryTimestamp: street.timestamp,
      exitTimestamp: street.duration
        ? street.timestamp + street.duration * 1000
        : undefined,
      durationSeconds: street.duration,
      entryLatitude: street.coordinates.latitude,
      entryLongitude: street.coordinates.longitude,
    }));
  }

  // Public getters & setters
  public getCurrentStreetId(): string | null {
    return this.currentStreetId;
  }

  public setCurrentStreetId(streetId: string) {
    this.currentStreetId = streetId;
  }

  public getStreetData(): StreetData | null {
    return this.streetData;
  }

  public getVisitedStreets(): VisitedStreet[] {
    return [...this.visitedStreets];
  }

  public getAllVisitedStreetIds(): Set<string> {
    return new Set(this.allVisitedStreetIds);
  }

  public getStreetVisitData(streetId: string): StreetVisitData | null {
    return this.streetVisitCounts.get(streetId) || null;
  }

  public getAllStreetVisitData(): Map<string, StreetVisitData> {
    return new Map(this.streetVisitCounts);
  }

  public getMostVisitedStreets(
    limit: number = 10
  ): Array<{ streetId: string; visitData: StreetVisitData }> {
    return Array.from(this.streetVisitCounts.entries())
      .sort(([, a], [, b]) => b.visitCount - a.visitCount)
      .slice(0, limit)
      .map(([streetId, visitData]) => ({ streetId, visitData }));
  }

  public getStreetsByTimeSpent(
    limit: number = 10
  ): Array<{ streetId: string; visitData: StreetVisitData }> {
    return Array.from(this.streetVisitCounts.entries())
      .sort(([, a], [, b]) => b.totalTimeSpent - a.totalTimeSpent)
      .slice(0, limit)
      .map(([streetId, visitData]) => ({ streetId, visitData }));
  }

  // Active hours getters
  public getTotalActiveHours(): number {
    return this.activeHoursData.totalActiveHours;
  }

  public getDailyActiveTime(date?: string): number {
    const targetDate = date || new Date().toISOString().split("T")[0];
    return this.activeHoursData.dailyActiveTime.get(targetDate) || 0;
  }

  public getWeeklyActiveTime(): number {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let totalSeconds = 0;

    for (let d = new Date(oneWeekAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      totalSeconds += this.activeHoursData.dailyActiveTime.get(dateStr) || 0;
    }

    return totalSeconds / 3600; // Convert to hours
  }

  public getMonthlyActiveTime(): number {
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    let totalSeconds = 0;

    for (let d = new Date(oneMonthAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      totalSeconds += this.activeHoursData.dailyActiveTime.get(dateStr) || 0;
    }

    return totalSeconds / 3600; // Convert to hours
  }

  public getCurrentSessionDuration(): number {
    if (!this.activeHoursData.currentSessionStart) return 0;
    return (
      (Date.now() - this.activeHoursData.currentSessionStart) / (1000 * 60 * 60)
    ); // Hours
  }

  public isTracking(): boolean {
    return this.locationSubscription !== null;
  }

  // Add to the class properties
  private permissionStatusListeners: ((hasPermission: boolean) => void)[] = [];

  // Add listener methods
  public addPermissionStatusListener(
    listener: (hasPermission: boolean) => void
  ) {
    this.permissionStatusListeners.push(listener);
  }

  public removePermissionStatusListener(
    listener: (hasPermission: boolean) => void
  ) {
    this.permissionStatusListeners = this.permissionStatusListeners.filter(
      (l) => l !== listener
    );
  }

  // Add a method to update permission status
  private setHasLocationPermission(hasPermission: boolean) {
    this.permissionStatusListeners.forEach((listener) =>
      listener(hasPermission)
    );
  }

  // Add a method to request permission
  public async requestLocationPermission(
    token: string | null
  ): Promise<boolean> {
    try {
      if (!token) return false;

      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === "granted";

      // Save to database
      await this.savePermissionStatus(token, hasPermission);

      // Update local state and notify listeners
      this.setHasLocationPermission(hasPermission);

      console.log("Location permission requested and saved:", hasPermission);
      return hasPermission;
    } catch (error) {
      console.error("Error requesting location permission:", error);

      // Save rejection to database if possible
      if (token) {
        try {
          await this.savePermissionStatus(token, false);
        } catch (saveError) {
          console.error("Failed to save permission rejection:", saveError);
        }
      }

      this.setHasLocationPermission(false);
      return false;
    }
  }

  public clearAllListeners(): void {
    this.locationUpdateListeners = [];
    this.streetChangeListeners = [];
    this.visitCountUpdateListeners = [];
    this.activeHoursUpdateListeners = [];
    this.permissionStatusListeners = [];
  }

 public async destroy(token: string | null = null): Promise<void> {
  try {
    // Stop location tracking with proper token for data saving
    if (token) {
      await this.stopLocationTracking(token);
    } else {
      // At minimum, stop tracking without server sync
      this.stopActiveHoursTracking();
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }
    }

    // Clear all listeners
    this.clearAllListeners();

    // Clean up intervals
    if (this.activeHoursInterval) {
      clearInterval(this.activeHoursInterval);
      this.activeHoursInterval = null;
    }

    // Reset singleton instance if needed
    LocationTrackingService.instance = null;
    
    console.log('LocationTrackingService destroyed');
  } catch (error) {
    console.error('Error during service destruction:', error);
  }
}
}
