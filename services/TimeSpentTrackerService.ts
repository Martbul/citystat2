import * as turf from "@turf/turf";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserCoords } from "@/types/world";
import { apiService } from "./api";
import { MovementData, StationarySession, TimeSpentLocation } from "@/types/timeSpentTraker";

// Storage keys
const TIME_SPENT_LOCATIONS_STORAGE_KEY = "@time_spent_locations";
const CURRENT_STATIONARY_SESSION_STORAGE_KEY = "@current_stationary_session";

// Constants
const STATIONARY_THRESHOLD_SECONDS = 30; // Wait 30 seconds before starting timer
const MOVEMENT_THRESHOLD_METERS = 10; // User must move 10m to be considered "moving"
const TIME_SPENT_CIRCLE_RADIUS_METERS = 25; // 25m radius circle for time-spent tracking
const MIN_TIME_SPENT_TO_SAVE_SECONDS = 60; // Only save locations where user spent at least 1 minute
const TIME_SPENT_UPDATE_INTERVAL_MS = 10000; // Update every 10 seconds
const MAX_MOVEMENT_SPEED_MPS = 1.5; // Max walking speed considered stationary (1.5 m/s)



export class TimeSpentTrackingService {
  private static instance: TimeSpentTrackingService | null = null;
  
  // Core tracking data
  private timeSpentLocations: Map<string, TimeSpentLocation> = new Map();
  private currentStationarySession: StationarySession | null = null;
  private lastSignificantMovement: number = Date.now();
  private lastLocation: UserCoords | null = null;
  private lastLocationTime: number = Date.now();
  
  // Movement tracking
  private movementHistory: Array<{ coords: UserCoords; timestamp: number; speed: number }> = [];
  private isUserStationary: boolean = false;
  private timeStationaryStart: number | null = null;
  
  // Intervals
  private updateInterval: NodeJS.Timeout | null = null;
  
  // Event listeners
  private stationarySessionStartListeners: ((session: StationarySession) => void)[] = [];
  private stationarySessionEndListeners: ((session: StationarySession, finalLocation: TimeSpentLocation | null) => void)[] = [];
  private timeSpentLocationUpdateListeners: ((location: TimeSpentLocation) => void)[] = [];
  private movementStatusChangeListeners: ((movementData: MovementData) => void)[] = [];

  private constructor() {
    this.loadPersistedData();
  }

  public static getInstance(): TimeSpentTrackingService {
    if (!TimeSpentTrackingService.instance) {
      TimeSpentTrackingService.instance = new TimeSpentTrackingService();
    }
    return TimeSpentTrackingService.instance;
  }

  // Event listener methods
  public addStationarySessionStartListener(listener: (session: StationarySession) => void) {
    this.stationarySessionStartListeners.push(listener);
  }

  public removeStationarySessionStartListener(listener: (session: StationarySession) => void) {
    this.stationarySessionStartListeners = this.stationarySessionStartListeners.filter(l => l !== listener);
  }

  public addStationarySessionEndListener(listener: (session: StationarySession, finalLocation: TimeSpentLocation | null) => void) {
    this.stationarySessionEndListeners.push(listener);
  }

  public removeStationarySessionEndListener(listener: (session: StationarySession, finalLocation: TimeSpentLocation | null) => void) {
    this.stationarySessionEndListeners = this.stationarySessionEndListeners.filter(l => l !== listener);
  }

  public addTimeSpentLocationUpdateListener(listener: (location: TimeSpentLocation) => void) {
    this.timeSpentLocationUpdateListeners.push(listener);
  }

  public removeTimeSpentLocationUpdateListener(listener: (location: TimeSpentLocation) => void) {
    this.timeSpentLocationUpdateListeners = this.timeSpentLocationUpdateListeners.filter(l => l !== listener);
  }

  public addMovementStatusChangeListener(listener: (movementData: MovementData) => void) {
    this.movementStatusChangeListeners.push(listener);
  }

  public removeMovementStatusChangeListener(listener: (movementData: MovementData) => void) {
    this.movementStatusChangeListeners = this.movementStatusChangeListeners.filter(l => l !== listener);
  }

  private async loadPersistedData() {
    try {
      // Load time spent locations
      const timeSpentStr = await AsyncStorage.getItem(TIME_SPENT_LOCATIONS_STORAGE_KEY);
      if (timeSpentStr) {
        const locationsArray = JSON.parse(timeSpentStr);
        this.timeSpentLocations = new Map(locationsArray);
      }

      // Load current stationary session
      const sessionStr = await AsyncStorage.getItem(CURRENT_STATIONARY_SESSION_STORAGE_KEY);
      if (sessionStr) {
        const sessionData = JSON.parse(sessionStr);
        // Only restore session if it was active recently (within last hour)
        if (sessionData.isActive && (Date.now() - sessionData.lastUpdateTime) < 3600000) {
          this.currentStationarySession = sessionData;
          this.isUserStationary = true;
        }
      }
    } catch (error) {
      console.error("Error loading time spent data:", error);
    }
  }

  private async persistData() {
    try {
      // Persist time spent locations
      const locationsArray = Array.from(this.timeSpentLocations.entries());
      await AsyncStorage.setItem(TIME_SPENT_LOCATIONS_STORAGE_KEY, JSON.stringify(locationsArray));

      // Persist current session
      if (this.currentStationarySession) {
        await AsyncStorage.setItem(CURRENT_STATIONARY_SESSION_STORAGE_KEY, JSON.stringify(this.currentStationarySession));
      } else {
        await AsyncStorage.removeItem(CURRENT_STATIONARY_SESSION_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error persisting time spent data:", error);
    }
  }

  public startTracking() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Start update interval
    this.updateInterval = setInterval(() => {
      this.updateStationaryTracking();
    }, TIME_SPENT_UPDATE_INTERVAL_MS);

    console.log("Time spent tracking started");
  }

  public async stopTracking(token: string | null) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // End any active session
    if (this.currentStationarySession && this.currentStationarySession.isActive) {
      await this.endStationarySession();
    }

    // Save data to database if token provided
    if (token) {
      await this.saveTimeSpentDataToDatabase(token);
    }

    await this.persistData();
    console.log("Time spent tracking stopped");
  }

  public processLocationUpdate(location: UserCoords) {
    const now = Date.now();
    
    // Calculate movement data
    const movementData = this.calculateMovementData(location, now);
    
    // Update movement history (keep last 10 points for speed calculation)
    this.movementHistory.push({
      coords: location,
      timestamp: now,
      speed: movementData.currentSpeed
    });
    if (this.movementHistory.length > 10) {
      this.movementHistory.shift();
    }

    // Check if user movement status changed
    const wasStationary = this.isUserStationary;
    this.updateStationaryStatus(movementData);

    // Handle stationary session logic
    if (this.isUserStationary && !wasStationary) {
      // User just became stationary
      this.handleBecameStationary(location, now);
    } else if (!this.isUserStationary && wasStationary) {
      // User started moving
      this.handleStartedMoving();
    } else if (this.isUserStationary && this.currentStationarySession) {
      // User is still stationary, check if they're within the tracking circle
      this.checkStationarySessionBounds(location);
    }

    // Notify movement status listeners
    this.movementStatusChangeListeners.forEach(listener => 
      listener({
        isStationary: this.isUserStationary,
        currentSpeed: movementData.currentSpeed,
        timeStationary: movementData.timeStationary,
        lastMovementTime: this.lastSignificantMovement
      })
    );

    this.lastLocation = location;
    this.lastLocationTime = now;
  }

  private calculateMovementData(location: UserCoords, timestamp: number): MovementData {
    let currentSpeed = 0;
    let timeStationary = 0;

    if (this.lastLocation && this.lastLocationTime) {
      const distance = this.calculateDistance(
        this.lastLocation.latitude,
        this.lastLocation.longitude,
        location.latitude,
        location.longitude
      );
      const timeDiff = (timestamp - this.lastLocationTime) / 1000; // seconds
      currentSpeed = timeDiff > 0 ? distance / timeDiff : 0;

      // Check if this is significant movement
      if (distance > MOVEMENT_THRESHOLD_METERS && currentSpeed > MAX_MOVEMENT_SPEED_MPS / 10) {
        this.lastSignificantMovement = timestamp;
      }
    }

    timeStationary = (timestamp - this.lastSignificantMovement) / 1000;

    return {
      isStationary: timeStationary >= STATIONARY_THRESHOLD_SECONDS && currentSpeed < MAX_MOVEMENT_SPEED_MPS,
      currentSpeed,
      timeStationary,
      lastMovementTime: this.lastSignificantMovement
    };
  }

  private updateStationaryStatus(movementData: MovementData) {
    this.isUserStationary = movementData.isStationary;
    
    if (!this.isUserStationary) {
      this.timeStationaryStart = null;
    } else if (this.timeStationaryStart === null) {
      this.timeStationaryStart = Date.now();
    }
  }

  private handleBecameStationary(location: UserCoords, timestamp: number) {
    if (this.currentStationarySession && this.currentStationarySession.isActive) {
      // End previous session first
      this.endStationarySession();
    }

    // Create new stationary session
    this.currentStationarySession = {
      id: this.generateSessionId(),
      locationId: null, // Will be set when we find or create a matching location
      startTime: timestamp,
      centerCoords: location,
      isActive: true,
      lastUpdateTime: timestamp,
      currentDuration: 0
    };

    console.log("User became stationary at:", location);
    
    // Notify listeners
    this.stationarySessionStartListeners.forEach(listener => 
      listener(this.currentStationarySession!)
    );
  }

  private handleStartedMoving() {
    if (this.currentStationarySession && this.currentStationarySession.isActive) {
      this.endStationarySession();
    }
  }

  private checkStationarySessionBounds(location: UserCoords) {
    if (!this.currentStationarySession) return;

    const distance = this.calculateDistance(
      this.currentStationarySession.centerCoords.latitude,
      this.currentStationarySession.centerCoords.longitude,
      location.latitude,
      location.longitude
    );

    if (distance > TIME_SPENT_CIRCLE_RADIUS_METERS) {
      // User left the circle
      console.log("User left stationary circle, ending session");
      this.endStationarySession();
    }
  }

  private updateStationaryTracking() {
    if (!this.currentStationarySession || !this.currentStationarySession.isActive) {
      return;
    }

    const now = Date.now();
    const sessionDuration = Math.floor((now - this.currentStationarySession.startTime) / 1000);
    
    this.currentStationarySession.currentDuration = sessionDuration;
    this.currentStationarySession.lastUpdateTime = now;
    
    // Persist updated session
    this.persistData();
  }

  private endStationarySession() {
    if (!this.currentStationarySession) return;

    const now = Date.now();
    const totalDuration = Math.floor((now - this.currentStationarySession.startTime) / 1000);
    
    this.currentStationarySession.isActive = false;
    this.currentStationarySession.currentDuration = totalDuration;

    console.log(`Ending stationary session, duration: ${totalDuration} seconds`);

    let finalLocation: TimeSpentLocation | null = null;

    // Only save if user spent significant time
    if (totalDuration >= MIN_TIME_SPENT_TO_SAVE_SECONDS) {
      finalLocation = this.saveOrUpdateTimeSpentLocation(this.currentStationarySession, totalDuration);
    }

    // Notify listeners
    this.stationarySessionEndListeners.forEach(listener => 
      listener(this.currentStationarySession!, finalLocation)
    );

    this.currentStationarySession = null;
    this.persistData();
  }

  private saveOrUpdateTimeSpentLocation(session: StationarySession, duration: number): TimeSpentLocation {
    const existingLocationId = this.findExistingLocation(session.centerCoords);
    const now = Date.now();

    if (existingLocationId) {
      // Update existing location
      const existing = this.timeSpentLocations.get(existingLocationId)!;
      const updated: TimeSpentLocation = {
        ...existing,
        totalTimeSpent: existing.totalTimeSpent + duration,
        lastVisit: now,
        visitCount: existing.visitCount + 1,
        lastSessionDuration: duration
      };
      
      this.timeSpentLocations.set(existingLocationId, updated);
      
      // Notify listeners
      this.timeSpentLocationUpdateListeners.forEach(listener => listener(updated));
      
      console.log(`Updated existing location ${existingLocationId}, total time: ${updated.totalTimeSpent}s`);
      return updated;
    } else {
      // Create new location
      const newLocation: TimeSpentLocation = {
        id: this.generateLocationId(),
        centerCoords: session.centerCoords,
        totalTimeSpent: duration,
        firstVisit: session.startTime,
        lastVisit: now,
        visitCount: 1,
        radius: TIME_SPENT_CIRCLE_RADIUS_METERS,
        lastSessionDuration: duration
      };
      
      this.timeSpentLocations.set(newLocation.id, newLocation);
      
      // Notify listeners
      this.timeSpentLocationUpdateListeners.forEach(listener => listener(newLocation));
      
      console.log(`Created new time spent location ${newLocation.id}, duration: ${duration}s`);
      return newLocation;
    }
  }

  private findExistingLocation(coords: UserCoords): string | null {
    for (const [locationId, location] of this.timeSpentLocations) {
      const distance = this.calculateDistance(
        location.centerCoords.latitude,
        location.centerCoords.longitude,
        coords.latitude,
        coords.longitude
      );
      
      if (distance <= TIME_SPENT_CIRCLE_RADIUS_METERS) {
        return locationId;
      }
    }
    return null;
  }

  public async saveTimeSpentDataToDatabase(token: string) {
    if (this.timeSpentLocations.size === 0) {
      return;
    }

    try {
      const locationsArray = Array.from(this.timeSpentLocations.values());
      
      // You'll need to add this method to your API service
      const result = await apiService.saveTimeSpentLocations({
        locations: locationsArray.map(location => ({
          id: location.id,
          centerLatitude: location.centerCoords.latitude,
          centerLongitude: location.centerCoords.longitude,
          totalTimeSpent: location.totalTimeSpent,
          firstVisit: location.firstVisit,
          lastVisit: location.lastVisit,
          visitCount: location.visitCount,
          radius: location.radius,
          address: location.address
        }))
      }, token);

      if (result) {
        console.log("Successfully saved time spent locations:", locationsArray.length);
      } else {
        throw new Error(`Save time spent locations failed: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error("Error saving time spent locations:", error);
      throw error;
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private generateSessionId(): string {
    return `stationary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLocationId(): string {
    return `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public getters
  public getCurrentStationarySession(): StationarySession | null {
    return this.currentStationarySession;
  }

  public getTimeSpentLocations(): TimeSpentLocation[] {
    return Array.from(this.timeSpentLocations.values());
  }

  public getTimeSpentLocation(locationId: string): TimeSpentLocation | null {
    return this.timeSpentLocations.get(locationId) || null;
  }

  public getTopTimeSpentLocations(limit: number = 10): TimeSpentLocation[] {
    return Array.from(this.timeSpentLocations.values())
      .sort((a, b) => b.totalTimeSpent - a.totalTimeSpent)
      .slice(0, limit);
  }

  public getMostVisitedTimeSpentLocations(limit: number = 10): TimeSpentLocation[] {
    return Array.from(this.timeSpentLocations.values())
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, limit);
  }

  public getTotalTimeSpentAllLocations(): number {
    return Array.from(this.timeSpentLocations.values())
      .reduce((total, location) => total + location.totalTimeSpent, 0);
  }

  public isCurrentlyStationary(): boolean {
    return this.isUserStationary;
  }

  public getCurrentStationaryDuration(): number {
    if (!this.currentStationarySession || !this.currentStationarySession.isActive) {
      return 0;
    }
    return Math.floor((Date.now() - this.currentStationarySession.startTime) / 1000);
  }

  public getMovementHistory(): Array<{ coords: UserCoords; timestamp: number; speed: number }> {
    return [...this.movementHistory];
  }

  public isTracking(): boolean {
    return this.updateInterval !== null;
  }
}