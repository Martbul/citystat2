import * as turf from "@turf/turf";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  FetchedVisitedStreet,
  SaveVisitedStreetsRequest,
  Street,
  StreetData,
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

// Define the background task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
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

export interface StreetVisitData {
  visitCount: number;
  firstVisit: number;
  lastVisit: number;
  totalTimeSpent: number; // in seconds
  averageTimeSpent: number;
}
export interface ActiveHoursData {
  totalActiveHours: number; // Total hours spent tracking
  currentSessionStart: number | null; // When current session started
  dailyActiveTime: Map<string, number>; // Daily tracking time in seconds
}

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
  private activeHoursInterval: NodeJS.Timeout | null = null;

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

  private updateActiveHours() {
    if (!this.activeHoursData.currentSessionStart) return;

    const now = Date.now();
    const sessionDuration = now - this.activeHoursData.currentSessionStart;
    const hoursToAdd = sessionDuration / (1000 * 60 * 60); // Convert to hours

    // Update total active hours
    this.activeHoursData.totalActiveHours += hoursToAdd;

    // Update daily active time
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const currentDailyTime =
      this.activeHoursData.dailyActiveTime.get(today) || 0;
    this.activeHoursData.dailyActiveTime.set(
      today,
      currentDailyTime + Math.floor(sessionDuration / 1000) // Store daily time in seconds
    );

    // Reset session start for next interval
    this.activeHoursData.currentSessionStart = now;

    // Notify listeners
    this.activeHoursUpdateListeners.forEach((listener) =>
      listener(this.activeHoursData.totalActiveHours)
    );

    // Persist the updated data
    this.persistData();
  }

  public async startLocationTracking(enableBackground: boolean = true) {
    try {
      // Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Foreground location permission not granted");
      }

      // Request background permissions if needed
      if (enableBackground) {
        const backgroundStatus =
          await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus.status !== "granted") {
          console.warn("Background location permission not granted");
        } else {
          await this.startBackgroundLocationUpdates();
        }
      }

      // Start active hours tracking
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
      console.log("Location tracking started successfully");
    } catch (error) {
      console.error("Error starting location tracking:", error);
      throw error;
    }
  }

  private async startBackgroundLocationUpdates() {
    try {
      if (this.isBackgroundTaskRegistered) {
        return;
      }

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
      console.log("Background location updates started");
    } catch (error) {
      console.error("Error starting background location updates:", error);
    }
  }
  // In your service
  public async stopLocationTracking(token: string|null) {
    
    // Stop active hours tracking
    this.stopActiveHoursTracking();

    // Stop foreground tracking
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    // Stop background tracking
    if (this.isBackgroundTaskRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      this.isBackgroundTaskRegistered = false;
    }

    // Save any pending data
    if (token) {
      await this.saveVisitedStreetsToDatabase(token);
      await this.saveActiveHoursToDatabase(token);
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

      // Check street proximity
      if (this.streetData) {
        this.checkStreetProximity(newUserCoords);
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

  private shouldRefreshStreetData(newCoords: UserCoords): boolean {
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
      return;
    }

    const userPoint = turf.point([userCoords.longitude, userCoords.latitude]);
    const proximityThresholdKm =
      STREET_PROXIMITY_THRESHOLD_METERS / METERS_IN_KILOMETER;

    let foundStreet: string | null = null;
    let closestDistance = Infinity;
    let closestStreetName = null;

    this.streetData.features.forEach((street) => {
      try {
        if (
          !street.geometry.coordinates ||
          street.geometry.coordinates.length < 2
        ) {
          return;
        }

        const streetLine = turf.lineString(street.geometry.coordinates);
        const distanceKm = turf.pointToLineDistance(userPoint, streetLine, {
          units: "kilometers",
        });

        if (
          distanceKm <= proximityThresholdKm &&
          distanceKm < closestDistance
        ) {
          closestDistance = distanceKm;
          foundStreet = street.id;
          closestStreetName = street.properties?.name || "Unnamed";
        }
      } catch (error) {
        console.warn(`Error processing street ${street.id}:`, error);
      }
    });

    if (foundStreet && foundStreet !== this.currentStreetId) {
      this.handleStreetChange(foundStreet, userCoords);
    }
  }

  private handleStreetChange(newStreetId: string | null, coords: UserCoords) {
    const now = Date.now();

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

      // Notify listeners
      this.streetChangeListeners.forEach((listener) =>
        listener(newStreetId, coords)
      );
    }

    this.currentStreetId = newStreetId;
    this.persistData();
  }

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

      // Notify listeners
      this.visitCountUpdateListeners.forEach((listener) =>
        listener(streetId, newData)
      );
    }
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

  // Public getters
  public getCurrentStreetId(): string | null {
    return this.currentStreetId;
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
}
