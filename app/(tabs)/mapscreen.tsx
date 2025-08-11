import VisitedStreetsLayer from "@/components/displyVisitedStreets";
import { MIN_MOVEMENT_DISTANCE_METERS } from "@/constants/Location";
import { useUserData } from "@/Providers/UserDataProvider";
import { logEvent } from "@/utils/logger";
import Mapbox, {
  Camera,
  MapView,
  PointAnnotation,
  ShapeSource,
} from "@rnmapbox/maps";
import * as turf from "@turf/turf";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

//? CONSTANTS:

const TIME_DB_SAVE_NEW_VISITED_STREETS_MILISECONDS: number = 180000; // Save every 3 minutes
const TIME_OBTAINING_NEW_LOCATION_MILISECONDS: number = 5000;
const BUFFER_GETTING_STREETS: number = 0.01; // ~1km in degrees
const LOCATION_ACCURACY = Location.Accuracy.High;
const LOCATION_UPDATE_INTERVAL_MS = 5000; // 5 seconds
const LOCATION_DISTANCE_THRESHOLD_M = 10; // 10 meters
const LOCATION_UPDATE_THROTTLE_MS = 1000; // 1 second throttle
const STREET_DATA_REFRESH_DISTANCE_KM = 0.2; // 200 meters threshold for refreshing street data
const STREET_PROXIMITY_THRESHOLD_METERS = 50; // 50m for better detection
const METERS_IN_KILOMETER = 1000;
const STREET_LOGGING_DISTANCE_METERS = 100; // Only log streets within this distance (to reduce noise)

const mapToken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
Mapbox.setAccessToken(mapToken!);

interface UserCoords {
  latitude: number;
  longitude: number;
}

interface Street {
  type: "Feature";
  id: string;
  geometry: {
    coordinates: number[][];
    type: "LineString";
  };
  properties: {
    name?: string;
    highway?: string;
    surface?: string;
  };
}

interface StreetData {
  type: "FeatureCollection";
  features: Street[];
}

interface VisitedStreet {
  streetId: string;
  streetName: string;
  timestamp: number;
  coordinates: UserCoords;
  duration?: number;
}

interface VisitedStreetRequest {
  streetId: string;
  streetName: string;
  entryTimestamp: number;
  exitTimestamp?: number;
  durationSeconds?: number;
  entryLatitude: number;
  entryLongitude: number;
}

export interface SaveVisitedStreetsRequest {
  sessionId: string;
  visitedStreets: VisitedStreetRequest[];
}

interface FetchedVisitedStreet {
  streetId: string;
  streetName: string;
  entryTimestamp: number;
  exitTimestamp?: number;
  durationSeconds?: number;
  entryLatitude: number;
  entryLongitude: number;
}

const StreetTrackingMap = () => {
  const {
    getLocationPermission,
    saveLocationPermission,
    saveVisitedStreets,
    fetchVisitedStreets,
  } = useUserData();
  const [userLocation, setUserLocation] = useState<UserCoords | null>(null);
  const [highlightedStreets, setHighlightedStreets] = useState<string[]>([]);
  const [streetData, setStreetData] = useState<StreetData | null>(null);
  const [currentStreetId, setCurrentStreetId] = useState<string | null>(null);
  const [visitedStreets, setVisitedStreets] = useState<VisitedStreet[]>([]);
  const [isLoadingStreets, setIsLoadingStreets] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [allVisitedStreetIds, setAllVisitedStreetIds] = useState<Set<string>>(
    new Set()
  );

  const mapRef = useRef(null);
  const streetEntryTimeRef = useRef<number | null>(null);
  const lastLocationUpdateRef = useRef<number>(0);
  const [previousUserCoords, setPreviousUserCoords] =
    useState<UserCoords | null>(null);

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const currentSessionId = useRef<string>(generateSessionId());

  const loadVisitedStreetsFromDB = async () => {
    try {
      console.log("Loading visited streets from database...");
      const fetchedStreets = await fetchVisitedStreets();

      if (fetchedStreets && Array.isArray(fetchedStreets)) {
        const streetIds = new Set(
          fetchedStreets.map((street: FetchedVisitedStreet) => street.streetId)
        );
        setAllVisitedStreetIds(streetIds);
        console.log(
          `Loaded ${streetIds.size} previously visited streets from DB`
        );
      }
    } catch (error) {
      console.error("Error loading visited streets from DB:", error);
    }
  };

  useEffect(() => {
    const initializeComponent = async () => {
      await loadVisitedStreetsFromDB();
      await initializePermissions();
    };

    initializeComponent();

    return () => {
      // Save any remaining streets when component unmounts
      if (visitedStreets.length > 0) {
        saveVisitedStreetsToDatabase();
      }
      stopLocationTracking();
    };
  }, []);

  const initializePermissions = async () => {
    try {
      logEvent("initializing location user permissions");

      // Load user's explicit choice from database
      const savedPermission = await loadPermissionStatus();
      console.log("User's saved permission choice:", savedPermission);

      // Check current system permission
      const { status } = await Location.getForegroundPermissionsAsync();
      const hasSystemPermission = status === "granted";
      console.log("System permission status:", status);

      if (savedPermission === true && hasSystemPermission) {
        // User explicitly opted in AND system allows it - start tracking
        console.log(
          "Starting tracking: User opted in + system permission granted"
        );
        setHasLocationPermission(true);
        await startLocationTracking();
      } else if (savedPermission === true && !hasSystemPermission) {
        // User opted in but system permission was revoked - ask again
        console.log(
          "User opted in but system permission revoked - requesting permission"
        );
        await requestLocationPermission();
      } else if (savedPermission === false || savedPermission === null) {
        console.log("User hasn't opted in to location tracking");
        setHasLocationPermission(false);
      }
    } catch (error) {
      console.error("Error initializing permissions:", error);
      setHasLocationPermission(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (visitedStreets.length > 0) {
        saveVisitedStreetsToDatabase();
      }
    }, TIME_DB_SAVE_NEW_VISITED_STREETS_MILISECONDS);

    return () => clearInterval(interval);
  }, [visitedStreets]);

  const savePermissionStatus = async (hasPermission: boolean) => {
    try {
      logEvent("request for saving permission into db");

      const result = await saveLocationPermission(hasPermission);
      console.log("Permission save result:", result);
      if (!result) {
        console.log("Failed to save location permission data");
      }
    } catch (error) {
      console.error("Error saving permission status:", error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      logEvent("request for local user permissions");

      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";

      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for street tracking."
        );
      } else {
        console.log("Location permission granted");
        await startLocationTracking();
      }

      setHasLocationPermission(granted);
      await savePermissionStatus(granted);
      return granted;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert("Error", "Failed to request location permission");
      setHasLocationPermission(false);
      await savePermissionStatus(false);
      return false;
    }
  };

  const loadPermissionStatus = async () => {
    try {
      const saved = await getLocationPermission();
      console.log("saved location permission: " + saved);
      return saved === true;
    } catch (error) {
      console.error("Error loading permission status:", error);
      return null;
    }
  };

  const startLocationTracking = async () => {
    try {
      logEvent("Getting initial location...");

      console.log("Getting initial location...");
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: TIME_OBTAINING_NEW_LOCATION_MILISECONDS,
      });

      console.log("Initial location received:", initialLocation);
      handleLocationUpdate(initialLocation);

      console.log("Starting location watching...");
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: LOCATION_ACCURACY,
          timeInterval: LOCATION_UPDATE_INTERVAL_MS,
          distanceInterval: LOCATION_DISTANCE_THRESHOLD_M,
        },
        (location) => {
          console.log("Location update received:", location);
          handleLocationUpdate(location);
        }
      );

      setLocationSubscription(subscription);
      console.log("Location tracking started successfully");
    } catch (error) {
      console.error("Error starting location tracking:", error);
      Alert.alert("Error", "Failed to start location tracking");
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      console.log("Location tracking stopped");
    }
  };
  const fetchStreetData = useCallback(
    async (coords: UserCoords) => {
      if (!mapToken) {
        console.error("No map token available");
        return;
      }

      setIsLoadingStreets(true);
      try {
        logEvent("fetching street data");

        // Create a larger bounding box for more street data
        const buffer = BUFFER_GETTING_STREETS * 1.5; // Increased buffer size
        const bbox = [
          coords.longitude - buffer, // west
          coords.latitude - buffer, // south
          coords.longitude + buffer, // east
          coords.latitude + buffer, // north
        ];

        const overpassQuery = `
[out:json][timeout:30];
(
  way["highway"~"^(primary|secondary|tertiary|residential|trunk|motorway|unclassified|living_street|service|footway|path|cycleway|track)$"]
    (${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]});
);
out geom;
`;

        console.log("Fetching streets with query:", overpassQuery);

        const response = await fetch(
          "https://overpass-api.de/api/interpreter",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `data=${encodeURIComponent(overpassQuery)}`,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(
          "Raw Overpass data received, elements:",
          data.elements?.length || 0
        );

        if (!data.elements || data.elements.length === 0) {
          console.warn("No street elements found in response");
          return;
        }

        // Convert Overpass data to proper GeoJSON format
        const features: Street[] = data.elements
          .filter((element: any) => {
            const hasGeometry =
              element.type === "way" &&
              element.geometry &&
              element.geometry.length > 1;
            if (!hasGeometry) {
              console.log(
                `Filtering out element ${element.id}: no valid geometry`
              );
            }
            return hasGeometry;
          })
          .map((way: any) => ({
            type: "Feature",
            id: way.id.toString(),
            geometry: {
              type: "LineString",
              coordinates: way.geometry.map((node: any) => [
                node.lon,
                node.lat,
              ]),
            },
            properties: {
              name: way.tags?.name || `Street ${way.id}`,
              highway: way.tags?.highway,
              surface: way.tags?.surface,
            },
          }));

        console.log(`Successfully processed ${features.length} streets`);

        setStreetData({
          type: "FeatureCollection",
          features,
        });

        console.log(`Loaded ${features.length} streets in the area`);

        // Only check proximity if we don't have a current street or if we're not tracking location actively
        if (
          features.length > 0 &&
          (!currentStreetId || !locationSubscription)
        ) {
          console.log("Checking proximity after fetching new street data");
          checkStreetProximity(coords, {
            type: "FeatureCollection",
            features,
          });
        } else {
          console.log(
            "Skipping proximity check - already tracking or no current street"
          );
        }
      } catch (error) {
        console.error("Error fetching street data:", error);
        Alert.alert("Error", `Failed to load street data: ${error.message}`);
      } finally {
        setIsLoadingStreets(false);
      }
    },
    [mapToken, currentStreetId, locationSubscription]
  );

  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
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
  };

  const handleLocationUpdate = useCallback(
    (location: Location.LocationObject) => {
      try {
        logEvent("handling location update");

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

        // Reduced throttle time for more responsive updates
        const now = Date.now();
        if (now - lastLocationUpdateRef.current < LOCATION_UPDATE_THROTTLE_MS) {
          return; // Skip update if called too soo
        }
        lastLocationUpdateRef.current = now;

        // Check if user has moved significantly
        if (previousUserCoords) {
          const movementDistance = calculateDistance(
            previousUserCoords.latitude,
            previousUserCoords.longitude,
            newUserCoords.latitude,
            newUserCoords.longitude
          );

          console.log(`Movement distance: ${movementDistance.toFixed(1)}m`);

          if (movementDistance < MIN_MOVEMENT_DISTANCE_METERS) {
            console.log("Movement too small, skipping update");
            return;
          }
        }

        console.log("Processing location update:", newUserCoords);
        setUserLocation(newUserCoords);

        // Check street proximity with current street data
        if (streetData) {
          checkStreetProximity(newUserCoords);
        }

        // Fetch new street data if user moved significantly or no data exists
        if (!streetData || shouldRefreshStreetData(newUserCoords)) {
          console.log("Fetching new street data...");
          fetchStreetData(newUserCoords);
        }

        setPreviousUserCoords(newUserCoords);
      } catch (error) {
        console.error("Error handling location update:", error);
      }
    },
    [previousUserCoords, streetData, fetchStreetData]
  );

  // Convert client interface to API format
  const convertToApiFormat = (
    visitedStreets: VisitedStreet[]
  ): VisitedStreetRequest[] => {
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
  };

  const shouldRefreshStreetData = (newCoords: UserCoords): boolean => {
    if (!userLocation) return true;

    const distance = turf.distance(
      [userLocation.longitude, userLocation.latitude],
      [newCoords.longitude, newCoords.latitude],
      { units: "kilometers" }
    );

    return distance > STREET_DATA_REFRESH_DISTANCE_KM;
  };

  // Also update the checkStreetProximity function to be more careful about triggering changes:
  const checkStreetProximity = useCallback(
    (userCoords: UserCoords, customStreetData?: StreetData) => {
      const dataToUse = customStreetData || streetData;
      if (!dataToUse || !dataToUse.features.length) {
        console.log("No street data available for proximity check");
        return;
      }

      logEvent("checking street proximity");

      const userPoint = turf.point([userCoords.longitude, userCoords.latitude]);
      const proximityThresholdKm =
        STREET_PROXIMITY_THRESHOLD_METERS / METERS_IN_KILOMETER;

      let foundStreet: string | null = null;
      let closestDistance = Infinity;
      let closestStreetName = null;

      console.log(`Checking proximity to ${dataToUse.features.length} streets`);

      dataToUse.features.forEach((street) => {
        try {
          // Ensure coordinates are valid
          if (
            !street.geometry.coordinates ||
            street.geometry.coordinates.length < 2
          ) {
            console.warn(`Street ${street.id} has invalid coordinates`);
            return;
          }

          const streetLine = turf.lineString(street.geometry.coordinates);
          const distanceKm = turf.pointToLineDistance(userPoint, streetLine, {
            units: "kilometers",
          });

          const distanceMeters = distanceKm * 1000;

          // Only log for very close streets to reduce noise
          if (distanceMeters <= STREET_LOGGING_DISTANCE_METERS) {
            console.log(
              `Street ${street.id} (${street.properties?.name || "Unnamed"}) is ${distanceMeters.toFixed(1)}m away`
            );
          }

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

      if (foundStreet) {
        console.log(
          `Closest street: ${closestStreetName} (${foundStreet}) at ${(closestDistance * 1000).toFixed(1)}m`
        );
      } else {
        console.log("No nearby streets found");
      }

      // Only trigger change if we found a *different* street AND it's not already the current street
      if (foundStreet && foundStreet !== currentStreetId) {
        logEvent(`Switching to street: ${closestStreetName} (${foundStreet})`);
        console.log(
          `Switching to street: ${closestStreetName} (${foundStreet})`
        );
        handleStreetChange(foundStreet, userCoords);
      } else if (foundStreet === currentStreetId) {
        // We're still on the same street, no need to trigger change
        console.log(
          `Still on same street: ${closestStreetName} (${foundStreet})`
        );
      }

      // Update highlighted streets regardless
      setHighlightedStreets(foundStreet ? [foundStreet] : []);
    },
    [streetData, currentStreetId, allVisitedStreetIds, visitedStreets]
  );

  const saveVisitedStreetsToDatabase = async () => {
    if (visitedStreets.length === 0) {
      console.log("No visited streets to save");
      return;
    }

    try {
      const apiFormatStreets = convertToApiFormat(visitedStreets);
      const requestBody: SaveVisitedStreetsRequest = {
        sessionId: currentSessionId.current,
        visitedStreets: apiFormatStreets,
      };

      console.log("Attempting to save visited streets:", requestBody);

      const result = await saveVisitedStreets(requestBody);
      console.log("Save response:", result);

      // Fixed: Check for the actual response format from your backend
      // Also handle case where result might be null
      if (result && result.status === "success") {
        console.log("Successfully saved visited streets:", result);

        // Add the saved streets to our all-time visited set
        visitedStreets.forEach((street) => {
          allVisitedStreetIds.add(street.streetId);
        });
        setAllVisitedStreetIds(new Set(allVisitedStreetIds));

        // Clear local storage after successful save
        setVisitedStreets([]);

        // Generate new session ID for next batch
        currentSessionId.current = generateSessionId();
      } else {
        throw new Error(`Save operation failed: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error("Error saving visited streets:", error);
      Alert.alert(
        "Error",
        `Failed to save street data: ${error.message}. Will retry later.`
      );
    }
  };

  const handleStreetChange = (
    newStreetId: string | null,
    coords: UserCoords
  ) => {
    const now = Date.now();
    logEvent("handle street change");

    // User left a street
    if (currentStreetId && currentStreetId !== newStreetId) {
      const exitTime = now;
      const entryTime = streetEntryTimeRef.current || now;
      const duration = Math.floor((exitTime - entryTime) / 1000); // Duration in seconds

      logEvent(
        `User left street ${currentStreetId}, spent ${duration} seconds`
      );

      // Update the last visited street with duration
      setVisitedStreets((prev) => {
        const updated = [...prev];
        const lastStreet = updated[updated.length - 1];
        if (lastStreet && lastStreet.streetId === currentStreetId) {
          lastStreet.duration = duration;
        }
        return updated;
      });

      console.log(
        `User left street ${currentStreetId}, spent ${duration} seconds`
      );
    }

    // User entered a new street
    if (newStreetId && newStreetId !== currentStreetId) {
      // Enhanced duplicate prevention: check both current session AND all-time visited
      const alreadyVisitedInSession = visitedStreets.some(
        (vs) => vs.streetId === newStreetId
      );

      // Also check if we're already tracking this as the current street
      const isAlreadyCurrentStreet = currentStreetId === newStreetId;

      // Only add if it's truly a new street entry
      if (!alreadyVisitedInSession && !isAlreadyCurrentStreet) {
        const street = streetData?.features.find((s) => s.id === newStreetId);
        const streetName =
          street?.properties?.name || `Unknown Street ${newStreetId}`;

        const visitedStreet: VisitedStreet = {
          streetId: newStreetId,
          streetName,
          timestamp: now,
          coordinates: coords,
        };

        setVisitedStreets((prev) => {
          // Double-check for duplicates before adding
          const isDuplicate = prev.some((vs) => vs.streetId === newStreetId);
          if (isDuplicate) {
            console.log(`Preventing duplicate entry for street ${newStreetId}`);
            return prev;
          }
          return [...prev, visitedStreet];
        });

        console.log(`User entered NEW street: ${streetName} (${newStreetId})`);

        // Add to all-time visited set immediately
        allVisitedStreetIds.add(newStreetId);
        setAllVisitedStreetIds(new Set(allVisitedStreetIds));
      } else {
        console.log(
          `User re-entered street ${newStreetId} - not adding duplicate (session: ${alreadyVisitedInSession}, current: ${isAlreadyCurrentStreet})`
        );
      }

      streetEntryTimeRef.current = now;
    }

    setCurrentStreetId(newStreetId);
  };

  const getCurrentStreetName = (): string => {
    if (!currentStreetId || !streetData) return "Not on a street";

    const street = streetData.features.find((s) => s.id === currentStreetId);
    return street?.properties?.name || "Unknown Street";
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        zoomEnabled
        rotateEnabled
        styleURL={Mapbox.StyleURL.Street}
        onDidFinishLoadingMap={() => console.log("Map loaded")}
        onCameraChanged={(state) => {
          setMapZoom(state.properties.zoom);
        }}
      >
        <Camera
          zoomLevel={13}
          centerCoordinate={
            userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : [23.3219, 42.6977]
          }
        />

        {userLocation && hasLocationPermission && (
          <PointAnnotation
            id="userLocation"
            coordinate={[userLocation.longitude, userLocation.latitude]}
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
              <View style={styles.userLocationPulse} />
            </View>
          </PointAnnotation>
        )}

        {streetData && mapZoom >= 12 && (
          <>
            {/* All streets with dynamic coloring */}
            <ShapeSource id="allStreetsSource" shape={streetData}>
              <Mapbox.LineLayer
                id="all_streets_layer"
                style={{
                  lineColor: [
                    "case",
                    ["==", ["get", "id"], currentStreetId || ""],
                    "#00FF00", // Current street - green
                    [
                      "in",
                      ["get", "id"],
                      ["literal", Array.from(allVisitedStreetIds)],
                    ],
                    "#8B00FF", // Visited streets - purple (changed from orange)
                    "#1886e0c2", // Unvisited streets - blue
                  ],
                  lineWidth: [
                    "case",
                    ["==", ["get", "id"], currentStreetId || ""],
                    3, // Current street thicker
                    ["in", ["get", "id"], highlightedStreets],
                    3, // Highlighted streets
                    2, // Default width
                  ],
                  lineOpacity: 0.5,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </ShapeSource>

            {currentStreetId && (
              <ShapeSource
                id="currentStreetSource"
                shape={{
                  type: "FeatureCollection",
                  features: streetData.features.filter(
                    (street) => street.id === currentStreetId
                  ),
                }}
              >
                <Mapbox.LineLayer
                  id="current_street_layer"
                  style={{
                    lineColor: "#00FF00",
                    lineWidth: 4, // Reduced from 10
                    lineOpacity: 0.5,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              </ShapeSource>
            )}

            <VisitedStreetsLayer
              visitedStreets={visitedStreets}
              streetData={streetData}
            />
          </>
        )}
      </MapView>

      <View style={styles.infoPanel}>
        {!hasLocationPermission && (
          <View>
            <Text style={styles.permissionText}>
              Location tracking is disabled
            </Text>
            <TouchableOpacity onPress={requestLocationPermission}>
              <Text style={styles.enableButton}>Enable Location Tracking</Text>
            </TouchableOpacity>
          </View>
        )}
        {userLocation && (
          <>
            <Text style={styles.infoText}>
              Lat: {userLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.infoText}>
              Lng: {userLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.infoText}>
              Tracking: {locationSubscription ? "Active" : "Inactive"}
            </Text>
            <Text style={styles.infoText}>
              Streets Loaded: {streetData?.features.length || 0}
            </Text>
          </>
        )}
        <Text style={styles.currentStreet}>
          Current Street: {getCurrentStreetName()}
        </Text>
        <Text style={styles.statsText}>
          Session Streets: {visitedStreets.length}
        </Text>
        <Text style={styles.statsText}>
          Total Visited: {allVisitedStreetIds.size}
        </Text>
        {isLoadingStreets && (
          <Text style={styles.loadingText}>Loading streets...</Text>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoPanel: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  enableButton: {
    fontSize: 14,
    color: "#007AFF",
    textAlign: "center",
    marginTop: 5,
    textDecorationLine: "underline",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
  },
  currentStreet: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statsText: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 5,
  },
  loadingText: {
    fontSize: 12,
    color: "#FFA500",
    fontStyle: "italic",
  },
  permissionText: {
    fontSize: 14,
    color: "#FF0000",
    textAlign: "center",
    fontWeight: "bold",
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  userLocationDot: {
    width: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 2,
  },
  userLocationPulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.3)",
  },
});

export default StreetTrackingMap;

//! not remove this commet. Claude code for mocked user movement for testing component
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { View, StyleSheet, Alert, Text, TouchableOpacity } from "react-native";
// import Mapbox, {
//   Camera,
//   MapView,
//   PointAnnotation,
//   ShapeSource,
// } from "@rnmapbox/maps";
// import * as Location from "expo-location";
// import * as turf from "@turf/turf";
// import { MIN_MOVEMENT_DISTANCE_METERS } from "@/constants/Location";

// // CONSTANTS
// const TIME_DB_SAVE_NEW_VISITED_STREETS_MILISECONDS: number = 180000;
// const TIME_OBTAINING_NEW_LOCATION_MILISECONDS: number = 5000;
// const BUFFER_GETTING_STREETS: number = 0.01;

// const mapToken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
// Mapbox.setAccessToken(mapToken!);

// interface UserCoords {
//   latitude: number;
//   longitude: number;
// }

// interface Street {
//   type: "Feature";
//   id: string;
//   geometry: {
//     coordinates: number[][];
//     type: "LineString";
//   };
//   properties: {
//     name?: string;
//     highway?: string;
//     surface?: string;
//   };
// }

// interface StreetData {
//   type: "FeatureCollection";
//   features: Street[];
// }

// interface VisitedStreet {
//   streetId: string;
//   streetName: string;
//   timestamp: number;
//   coordinates: UserCoords;
//   duration?: number;
// }

// // SIMULATION DATA - Predefined path through Sofia
// const SIMULATION_PATH: UserCoords[] = [
//   { latitude: 42.6977, longitude: 23.3219 }, // Start point in Sofia
//   { latitude: 42.698, longitude: 23.3225 },
//   { latitude: 42.6985, longitude: 23.3235 },
//   { latitude: 42.699, longitude: 23.3245 },
//   { latitude: 42.6995, longitude: 23.3255 },
//   { latitude: 42.7, longitude: 23.3265 },
//   { latitude: 42.7005, longitude: 23.3275 },
//   { latitude: 42.701, longitude: 23.3285 },
//   { latitude: 42.7015, longitude: 23.3295 },
//   { latitude: 42.702, longitude: 23.3305 },
// ];

// const StreetTrackingMap = () => {
//   const [userLocation, setUserLocation] = useState<UserCoords | null>(null);
//   const [highlightedStreets, setHighlightedStreets] = useState<string[]>([]);
//   const [streetData, setStreetData] = useState<StreetData | null>(null);
//   const [currentStreetId, setCurrentStreetId] = useState<string | null>(null);
//   const [visitedStreets, setVisitedStreets] = useState<VisitedStreet[]>([]);
//   const [isLoadingStreets, setIsLoadingStreets] = useState(false);
//   const [hasLocationPermission, setHasLocationPermission] = useState(false);
//   const [locationSubscription, setLocationSubscription] =
//     useState<Location.LocationSubscription | null>(null);
//   const [mapZoom, setMapZoom] = useState(13);

//   // SIMULATION STATES
//   const [isSimulating, setIsSimulating] = useState(false);
//   const [simulationIndex, setSimulationIndex] = useState(0);
//   const [locationHistory, setLocationHistory] = useState<UserCoords[]>([]);
//   const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

//   const mapRef = useRef(null);
//   const streetEntryTimeRef = useRef<number | null>(null);
//   const lastLocationUpdateRef = useRef<number>(0);
//   const [previousUserCoords, setPreviousUserCoords] =
//     useState<UserCoords | null>(null);

//   useEffect(() => {
//     requestLocationPermission();
//     return () => {
//       stopLocationTracking();
//       stopSimulation();
//     };
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (visitedStreets.length > 0) {
//         saveVisitedStreetsToDatabase();
//       }
//     }, TIME_DB_SAVE_NEW_VISITED_STREETS_MILISECONDS);

//     return () => clearInterval(interval);
//   }, [visitedStreets]);

//   // SIMULATION FUNCTIONS
//   const startSimulation = () => {
//     if (isSimulating) return;

//     console.log("🚀 Starting location simulation");
//     setIsSimulating(true);
//     setSimulationIndex(0);
//     setLocationHistory([]);

//     // Start from first point
//     const firstPoint = SIMULATION_PATH[0];
//     handleLocationUpdate(createMockLocationObject(firstPoint));

//     simulationIntervalRef.current = setInterval(() => {
//       setSimulationIndex((prevIndex) => {
//         const nextIndex = prevIndex + 1;

//         if (nextIndex >= SIMULATION_PATH.length) {
//           // Loop back to start or stop
//           console.log("🏁 Simulation completed, looping back");
//           return 0; // Loop back to start
//         }

//         const nextPoint = SIMULATION_PATH[nextIndex];
//         console.log(`📍 Simulating movement to point ${nextIndex}:`, nextPoint);

//         // Create mock location object and handle update
//         handleLocationUpdate(createMockLocationObject(nextPoint));

//         return nextIndex;
//       });
//     }, 3000); // Move every 3 seconds
//   };

//   const stopSimulation = () => {
//     if (!isSimulating) return;

//     console.log("⏹️ Stopping simulation");
//     setIsSimulating(false);

//     if (simulationIntervalRef.current) {
//       clearInterval(simulationIntervalRef.current);
//       simulationIntervalRef.current = null;
//     }
//   };

//   const createMockLocationObject = (
//     coords: UserCoords
//   ): Location.LocationObject => {
//     return {
//       coords: {
//         latitude: coords.latitude,
//         longitude: coords.longitude,
//         altitude: 100,
//         accuracy: 5,
//         altitudeAccuracy: 10,
//         heading: 0,
//         speed: 2, // 2 m/s walking speed
//       },
//       timestamp: Date.now(),
//       mocked: true, // This indicates it's a mock location
//     };
//   };

//   const requestLocationPermission = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();

//       if (status !== "granted") {
//         Alert.alert(
//           "Permission Denied",
//           "Location permission is required for street tracking."
//         );
//         setHasLocationPermission(false);
//         return false;
//       }

//       console.log("Location permission granted");
//       setHasLocationPermission(true);
//       await startLocationTracking();
//       return true;
//     } catch (error) {
//       console.error("Error requesting location permission:", error);
//       Alert.alert("Error", "Failed to request location permission");
//       setHasLocationPermission(false);
//       return false;
//     }
//   };

//   const startLocationTracking = async () => {
//     try {
//       console.log("Getting initial location...");
//       const initialLocation = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//         timeInterval: TIME_OBTAINING_NEW_LOCATION_MILISECONDS,
//       });

//       console.log("Initial location received:", initialLocation);
//       handleLocationUpdate(initialLocation);

//       const subscription = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 7000,
//           distanceInterval: 15,
//         },
//         (location) => {
//           if (!isSimulating) {
//             // Only use real location if not simulating
//             console.log("Location update received:", location);
//             handleLocationUpdate(location);
//           }
//         }
//       );

//       setLocationSubscription(subscription);
//       console.log("Location tracking started successfully");
//     } catch (error) {
//       console.error("Error starting location tracking:", error);
//       Alert.alert("Error", "Failed to start location tracking");
//     }
//   };

//   const stopLocationTracking = () => {
//     if (locationSubscription) {
//       locationSubscription.remove();
//       setLocationSubscription(null);
//       console.log("Location tracking stopped");
//     }
//   };

//   const fetchStreetData = useCallback(
//     async (coords: UserCoords) => {
//       if (!mapToken) return;

//       setIsLoadingStreets(true);
//       try {
//         const buffer = BUFFER_GETTING_STREETS;
//         const bbox = [
//           coords.longitude - buffer,
//           coords.latitude - buffer,
//           coords.longitude + buffer,
//           coords.latitude + buffer,
//         ];

//         const overpassQuery = `
//         [out:json][timeout:25];
//         (
//           way["highway"~"^(primary|secondary|tertiary|residential|trunk|motorway|unclassified)$"]
//             (${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]});
//         );
//         out geom;
//       `;

//         const response = await fetch(
//           "https://overpass-api.de/api/interpreter",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/x-www-form-urlencoded",
//             },
//             body: `data=${encodeURIComponent(overpassQuery)}`,
//           }
//         );

//         const data = await response.json();

//         const features: Street[] = data.elements
//           .filter((element: any) => element.type === "way" && element.geometry)
//           .map((way: any) => ({
//             type: "Feature",
//             id: way.id.toString(),
//             geometry: {
//               type: "LineString",
//               coordinates: way.geometry.map((node: any) => [
//                 node.lon,
//                 node.lat,
//               ]),
//             },
//             properties: {
//               name: way.tags?.name,
//               highway: way.tags?.highway,
//               surface: way.tags?.surface,
//             },
//           }));

//         setStreetData({
//           type: "FeatureCollection",
//           features,
//         });

//         console.log(`Loaded ${features.length} streets in the area`);
//       } catch (error) {
//         console.error("Error fetching street data:", error);
//         Alert.alert("Error", "Failed to load street data");
//       } finally {
//         setIsLoadingStreets(false);
//       }
//     },
//     [mapToken]
//   );

//   const calculateDistance = (
//     lat1: number,
//     lon1: number,
//     lat2: number,
//     lon2: number
//   ): number => {
//     const R = 6371e3;
//     const φ1 = (lat1 * Math.PI) / 180;
//     const φ2 = (lat2 * Math.PI) / 180;
//     const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//     const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//     const a =
//       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c;
//   };

//   const handleLocationUpdate = useCallback(
//     (location: Location.LocationObject) => {
//       try {
//         const { coords } = location;
//         const newUserCoords: UserCoords = {
//           latitude: coords.latitude,
//           longitude: coords.longitude,
//         };

//         if (
//           !isFinite(newUserCoords.latitude) ||
//           !isFinite(newUserCoords.longitude)
//         ) {
//           console.warn("Invalid coordinates received:", newUserCoords);
//           return;
//         }

//         // Add to location history for trail visualization
//         setLocationHistory((prev) => [...prev.slice(-20), newUserCoords]); // Keep last 20 points

//         const now = Date.now();
//         if (now - lastLocationUpdateRef.current < 2000 && !location.mocked) {
//           return;
//         }
//         lastLocationUpdateRef.current = now;

//         if (previousUserCoords && !location.mocked) {
//           const movementDistance = calculateDistance(
//             previousUserCoords.latitude,
//             previousUserCoords.longitude,
//             newUserCoords.latitude,
//             newUserCoords.longitude
//           );

//           if (movementDistance < MIN_MOVEMENT_DISTANCE_METERS) {
//             return;
//           }
//         }

//         console.log(
//           `📍 ${location.mocked ? "SIMULATED" : "REAL"} location update:`,
//           newUserCoords
//         );
//         setUserLocation(newUserCoords);

//         checkStreetProximity(newUserCoords);

//         if (!streetData || shouldRefreshStreetData(newUserCoords)) {
//           fetchStreetData(newUserCoords);
//         }

//         setPreviousUserCoords(newUserCoords);
//       } catch (error) {
//         console.error("Error handling location update:", error);
//       }
//     },
//     [previousUserCoords, streetData, fetchStreetData]
//   );

//   const shouldRefreshStreetData = (newCoords: UserCoords): boolean => {
//     if (!userLocation) return true;

//     const distance = turf.distance(
//       [userLocation.longitude, userLocation.latitude],
//       [newCoords.longitude, newCoords.latitude],
//       { units: "kilometers" }
//     );

//     return distance > 0.5;
//   };

//   const checkStreetProximity = useCallback(
//     (userCoords: UserCoords) => {
//       if (!streetData) return;

//       const userPoint = turf.point([userCoords.longitude, userCoords.latitude]);
//       const proximityThreshold = 0.02;

//       let foundStreet: string | null = null;
//       let closestDistance = Infinity;

//       streetData.features.forEach((street) => {
//         try {
//           const streetLine = turf.lineString(street.geometry.coordinates);
//           const distance = turf.pointToLineDistance(userPoint, streetLine, {
//             units: "kilometers",
//           });

//           if (distance <= proximityThreshold && distance < closestDistance) {
//             closestDistance = distance;
//             foundStreet = street.id;
//           }
//         } catch (error) {
//           console.warn(`Error processing street ${street.id}:`, error);
//         }
//       });

//       if (foundStreet !== currentStreetId) {
//         handleStreetChange(foundStreet, userCoords);
//       }

//       setHighlightedStreets(foundStreet ? [foundStreet] : []);
//     },
//     [streetData, currentStreetId]
//   );

//   const saveVisitedStreetsToDatabase = async () => {
//     try {
//       const response = await fetch("YOUR_API_ENDPOINT/visited-streets", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId: "YOUR_USER_ID",
//           visitedStreets: visitedStreets,
//           sessionId: Date.now().toString(),
//         }),
//       });

//       if (response.ok) {
//         console.log("Successfully saved visited streets to database");
//       } else {
//         throw new Error("Failed to save to database");
//       }
//     } catch (error) {
//       console.error("Error saving visited streets:", error);
//       Alert.alert("Error", "Failed to save street data");
//     }
//   };

//   const handleStreetChange = (
//     newStreetId: string | null,
//     coords: UserCoords
//   ) => {
//     const now = Date.now();

//     if (currentStreetId && currentStreetId !== newStreetId) {
//       const exitTime = now;
//       const entryTime = streetEntryTimeRef.current || now;
//       const duration = Math.floor((exitTime - entryTime) / 1000);

//       setVisitedStreets((prev) => {
//         const updated = [...prev];
//         const lastStreet = updated[updated.length - 1];
//         if (lastStreet && lastStreet.streetId === currentStreetId) {
//           lastStreet.duration = duration;
//         }
//         return updated;
//       });

//       console.log(
//         `🚪 User left street ${currentStreetId}, spent ${duration} seconds`
//       );
//     }

//     if (newStreetId && newStreetId !== currentStreetId) {
//       const street = streetData?.features.find((s) => s.id === newStreetId);
//       const streetName =
//         street?.properties?.name || `Unknown Street ${newStreetId}`;

//       const visitedStreet: VisitedStreet = {
//         streetId: newStreetId,
//         streetName,
//         timestamp: now,
//         coordinates: coords,
//       };

//       setVisitedStreets((prev) => [...prev, visitedStreet]);
//       streetEntryTimeRef.current = now;

//       console.log(`🏠 User entered street: ${streetName} (${newStreetId})`);
//     }

//     setCurrentStreetId(newStreetId);
//   };

//   const getCurrentStreetName = (): string => {
//     if (!currentStreetId || !streetData) return "Not on a street";

//     const street = streetData.features.find((s) => s.id === currentStreetId);
//     return street?.properties?.name || "Unknown Street";
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         zoomEnabled
//         rotateEnabled
//         styleURL={Mapbox.StyleURL.Street}
//         onDidFinishLoadingMap={() => console.log("Map loaded")}
//         onCameraChanged={(state) => {
//           setMapZoom(state.properties.zoom);
//         }}
//       >
//         <Camera
//           zoomLevel={15} // Increased for better detail during simulation
//           centerCoordinate={
//             userLocation
//               ? [userLocation.longitude, userLocation.latitude]
//               : [23.3219, 42.6977]
//           }
//         />

//         {/* User location marker */}
//         {userLocation && hasLocationPermission && (
//           <PointAnnotation
//             id="userLocation"
//             coordinate={[userLocation.longitude, userLocation.latitude]}
//           >
//             <View
//               style={[
//                 styles.userLocationMarker,
//                 isSimulating && styles.simulatingMarker,
//               ]}
//             >
//               <View
//                 style={[
//                   styles.userLocationDot,
//                   isSimulating && styles.simulatingDot,
//                 ]}
//               />
//               <View
//                 style={[
//                   styles.userLocationPulse,
//                   isSimulating && styles.simulatingPulse,
//                 ]}
//               />
//             </View>
//           </PointAnnotation>
//         )}

//         {/* Location history trail */}
//         {locationHistory.length > 1 && (
//           <ShapeSource
//             id="locationTrailSource"
//             shape={{
//               type: "FeatureCollection",
//               features: [
//                 {
//                   type: "Feature",
//                   geometry: {
//                     type: "LineString",
//                     coordinates: locationHistory.map((coord) => [
//                       coord.longitude,
//                       coord.latitude,
//                     ]),
//                   },
//                   properties: {},
//                 },
//               ],
//             }}
//           >
//             <Mapbox.LineLayer
//               id="location_trail_layer"
//               style={{
//                 lineColor: isSimulating ? "#FF6B35" : "#007AFF",
//                 lineWidth: 4,
//                 lineOpacity: 0.8,
//                 lineCap: "round",
//                 lineJoin: "round",
//               }}
//             />
//           </ShapeSource>
//         )}

//         {/* Street layers */}
//         {streetData && mapZoom >= 13 && (
//           <>
//             <ShapeSource
//               id="regularStreetsSource"
//               shape={{
//                 type: "FeatureCollection",
//                 features: streetData.features.filter(
//                   (street) =>
//                     !highlightedStreets.includes(street.id) &&
//                     street.id !== currentStreetId
//                 ),
//               }}
//             >
//               <Mapbox.LineLayer
//                 id="regular_streets_layer"
//                 style={{
//                   lineColor: "#0000FF",
//                   lineWidth: 2,
//                   lineOpacity: 0.5,
//                   lineCap: "round",
//                   lineJoin: "round",
//                 }}
//               />
//             </ShapeSource>

//             {highlightedStreets.length > 0 && (
//               <ShapeSource
//                 id="highlightedStreetsSource"
//                 shape={{
//                   type: "FeatureCollection",
//                   features: streetData.features.filter(
//                     (street) =>
//                       highlightedStreets.includes(street.id) &&
//                       street.id !== currentStreetId
//                   ),
//                 }}
//               >
//                 <Mapbox.LineLayer
//                   id="highlighted_streets_layer"
//                   style={{
//                     lineColor: "#FF0000",
//                     lineWidth: 6,
//                     lineOpacity: 1,
//                     lineCap: "round",
//                     lineJoin: "round",
//                   }}
//                 />
//               </ShapeSource>
//             )}

//             {currentStreetId && (
//               <ShapeSource
//                 id="currentStreetSource"
//                 shape={{
//                   type: "FeatureCollection",
//                   features: streetData.features.filter(
//                     (street) => street.id === currentStreetId
//                   ),
//                 }}
//               >
//                 <Mapbox.LineLayer
//                   id="current_street_layer"
//                   style={{
//                     lineColor: "#00FF00",
//                     lineWidth: 8,
//                     lineOpacity: 1,
//                     lineCap: "round",
//                     lineJoin: "round",
//                   }}
//                 />
//               </ShapeSource>
//             )}
//           </>
//         )}
//       </MapView>

//       {/* Control buttons */}
//       <View style={styles.controlPanel}>
//         <TouchableOpacity
//           style={[styles.controlButton, isSimulating && styles.activeButton]}
//           onPress={isSimulating ? stopSimulation : startSimulation}
//         >
//           <Text
//             style={[
//               styles.controlButtonText,
//               isSimulating && styles.activeButtonText,
//             ]}
//           >
//             {isSimulating ? "Stop Simulation" : "Start Simulation"}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Info panel */}
//       <View style={styles.infoPanel}>
//         {!hasLocationPermission && (
//           <Text style={styles.permissionText}>
//             Location permission required for tracking
//           </Text>
//         )}

//         {userLocation && (
//           <>
//             <Text style={styles.infoText}>
//               Lat: {userLocation.latitude.toFixed(6)}
//             </Text>
//             <Text style={styles.infoText}>
//               Lng: {userLocation.longitude.toFixed(6)}
//             </Text>
//             <Text style={styles.infoText}>
//               Mode: {isSimulating ? "SIMULATION" : "REAL GPS"}
//             </Text>
//             {isSimulating && (
//               <Text style={styles.simulationText}>
//                 Point: {simulationIndex + 1}/{SIMULATION_PATH.length}
//               </Text>
//             )}
//           </>
//         )}

//         <Text style={styles.currentStreet}>
//           Current Street: {getCurrentStreetName()}
//         </Text>

//         <Text style={styles.statsText}>
//           Visited Streets: {visitedStreets.length}
//         </Text>

//         <Text style={styles.statsText}>
//           Trail Points: {locationHistory.length}
//         </Text>

//         {isLoadingStreets && (
//           <Text style={styles.loadingText}>Loading streets...</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   controlPanel: {
//     position: "absolute",
//     bottom: 30,
//     left: 20,
//     right: 20,
//     alignItems: "center",
//   },
//   controlButton: {
//     backgroundColor: "#007AFF",
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 25,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   activeButton: {
//     backgroundColor: "#FF3B30",
//   },
//   controlButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   activeButtonText: {
//     color: "white",
//   },
//   infoPanel: {
//     position: "absolute",
//     top: 50,
//     left: 10,
//     right: 10,
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//     padding: 15,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   infoText: {
//     fontSize: 12,
//     color: "#666",
//   },
//   simulationText: {
//     fontSize: 12,
//     color: "#FF6B35",
//     fontWeight: "600",
//   },
//   currentStreet: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginTop: 5,
//   },
//   statsText: {
//     fontSize: 14,
//     color: "#007AFF",
//     marginTop: 5,
//   },
//   loadingText: {
//     fontSize: 12,
//     color: "#FFA500",
//     fontStyle: "italic",
//   },
//   permissionText: {
//     fontSize: 14,
//     color: "#FF0000",
//     textAlign: "center",
//     fontWeight: "bold",
//   },
//   userLocationMarker: {
//     width: 20,
//     height: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   simulatingMarker: {
//     width: 24,
//     height: 24,
//   },
//   userLocationDot: {
//     width: 14,
//     height: 14,
//     borderRadius: 8,
//     backgroundColor: "#007AFF",
//     borderWidth: 2,
//     borderColor: "#FFFFFF",
//     shadowColor: "#000000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.3,
//     shadowRadius: 2,
//     elevation: 3,
//     zIndex: 2,
//   },
//   simulatingDot: {
//     backgroundColor: "#FF6B35",
//     width: 16,
//     height: 16,
//     borderRadius: 10,
//   },
//   userLocationPulse: {
//     position: "absolute",
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: "rgba(0, 122, 255, 0.2)",
//     borderWidth: 1,
//     borderColor: "rgba(0, 122, 255, 0.3)",
//   },
//   simulatingPulse: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: "rgba(255, 107, 53, 0.2)",
//     borderColor: "rgba(255, 107, 53, 0.4)",
//   },
// });

// export default StreetTrackingMap;
