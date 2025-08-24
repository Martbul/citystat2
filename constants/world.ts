import * as Location from "expo-location";

/** Time interval for saving new visited streets to the database (in milliseconds) */
export const TIME_DB_SAVE_NEW_VISITED_STREETS_MILISECONDS: number = 180000; // Save every 3 minutes

/** Time interval for obtaining a new location (in milliseconds) */
export const TIME_OBTAINING_NEW_LOCATION_MILISECONDS: number = 5000;

/** Buffer distance (in degrees) around the current viewport to fetch street data */
export const BUFFER_GETTING_STREETS: number = 0.005; // ~0.5km in degrees

/** Location accuracy settings for Expo Location */
export const LOCATION_ACCURACY = Location.Accuracy.High;

/** Time interval for updating user location (in milliseconds) */
export const LOCATION_UPDATE_INTERVAL_MS = 5000; // 5 seconds

/** Minimum travel interval between location (in meters) */
export const LOCATION_DISTANCE_THRESHOLD_M = 10; // 10 meters

/** Throttle interval for location updates (in milliseconds) */
export const LOCATION_UPDATE_THROTTLE_MS = 1000; // 1 second throttle

/** Distance threshold for refreshing street data (in kilometers) */
export const STREET_DATA_REFRESH_DISTANCE_KM = 0.2; // 200 meters threshold for refreshing street data

/** Distance threshold for considering user "on street" (in meters) */
export const STREET_PROXIMITY_THRESHOLD_METERS = 50; // 50m for better detection

/** Conversion metesrs in kilometers */
export const METERS_IN_KILOMETER = 1000;

/** Distance threshold for logging a street (in meters) */
export const STREET_LOGGING_DISTANCE_METERS = 100; // Only log streets within this distance (to reduce noise)


/** Minimum movement distance to update route (in meters) */
export const MIN_MOVEMENT_DISTANCE_METERS = 10;
