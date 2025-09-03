import * as turf from "@turf/turf";
import * as Location from "expo-location";
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
} from "@/types/world";
import { logEvent } from "@/utils/logger";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUserData } from "@/Providers/UserDataProvider";
import Mapbox, { Camera, MapView, ShapeSource } from "@rnmapbox/maps";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CenterCameraOnUserButton from "@/components/centerCameraOnUserButton";
import LocationEnablerPanel from "@/components/locationEnablerPanel";
import VisitedStreetsLayer from "@/components/displyVisitedStreets";
import MapTrackingPanel from "@/components/mapMenu";

const mapToken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
Mapbox.setAccessToken(mapToken!);

//!  LOG  Successfully processed 1696 streets
//! user is in other screens buit streets are loaded(do not remove but do it once for performace purposses)


//! make new separate functions for traking the user cause this only log the visited strrets and cant be sed for stats like favorete place and so on....

const StreetTrackingMap = () => {
  const {
    getLocationPermission,
    saveLocationPermission,
    saveVisitedStreets,
    fetchVisitedStreets,
    isLoading,
  } = useUserData();
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isMapMenuOpen, setIsMapMenuOpen] = useState(false);
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
  const cameraRef = useRef<Camera>(null);
  const mapRef = useRef<MapView>(null);
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
  const handleRequestLocationPermission = useCallback(async () => {
    // Your location permission request logic here
    return await requestLocationPermission();
  }, [requestLocationPermission]);
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
        const err = error as Error;

        console.error("Error fetching street data:", err);
        Alert.alert("Error", `Failed to load street data: ${err.message}`);
      } finally {
        setIsLoadingStreets(false);
      }
    },
    [
      mapToken,
      currentStreetId,
      locationSubscription,
      userLocation,
      hasLocationPermission,
    ]
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
      let seen: VisitedStreetRequest[] = [];
      const filteredApiFormatStreets = apiFormatStreets.filter((street) => {
        if (seen.find((s) => s.streetId === street.streetId)) {
          console.log(
            `Skipping duplicate street in save batch: ${street.streetId}`
          );
          return false;
        } else {
          seen.push(street);
          return true;
        }
      });
      const requestBody: SaveVisitedStreetsRequest = {
        sessionId: currentSessionId.current,
        visitedStreets: filteredApiFormatStreets,
      };

      console.log("#######Attempting to save visited streets:", requestBody);

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
      const err = error as Error;
      console.error("Error saving visited streets:", err);
      Alert.alert(
        "Error",
        `Failed to save street data: ${err.message}. Will retry later.`
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

  const toggleMapMenu = () => {
    if (isMapMenuOpen) {
      setIsMapMenuOpen(false);
    } else {
      setIsMapMenuOpen(true);
    }
  };

  const handleMapMenuClose = useCallback(() => {
    toggleMapMenu();
  }, [toggleMapMenu]);

  const centerOnUser = () => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  };

  const handleCenterOnUser = useCallback(() => {
    centerOnUser();
  }, [centerOnUser]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-containerBg">
        <View className="flex-1 justify-center items-center">
          <Text className="text-textDarkGray text-lg">Loading map...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1">
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
        <Mapbox.Images
          images={{
            "user-location": require("../../assets/images/icon.png"),
          }}
        />
        <Camera
          ref={cameraRef}
          zoomLevel={13}
          centerCoordinate={
            userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : [23.3219, 42.6977]
          }
          followUserLocation={isFollowingUser}
        />

        {userLocation && hasLocationPermission && (
          <Mapbox.ShapeSource
            id="userLocationSource"
            shape={{
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [userLocation.longitude, userLocation.latitude],
              },
              properties: {},
            }}
          >
            <Mapbox.SymbolLayer
              id="userLocationSymbol"
              style={{
                iconImage: "user-location",
                iconSize: 0.06,
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
                iconAnchor: "bottom",
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {streetData && mapZoom >= 11 && (
          <>
            {/* All streets with dynamic coloring */}
            <ShapeSource
              id="allStreetsSource"
              shape={streetData}
              onPress={(event) => {
                console.log("Street pressed:", event.features[0]?.id);
              }}
            >
              <Mapbox.LineLayer
                id="all_streets_layer"
                style={{
                  lineColor: [
                    "case",
                    ["==", ["to-string", ["get", "id"]], currentStreetId || ""],
                    "#c8f751",
                    [
                      "in",
                      ["to-string", ["get", "id"]],
                      ["literal", Array.from(allVisitedStreetIds)],
                    ],
                    "#8B00FF", // Visited streets
                    "rgba(0, 0, 0, 0)", // Unvisited streets
                  ],
                  lineWidth: [
                    "case",
                    ["==", ["to-string", ["get", "id"]], currentStreetId || ""],
                    6, // Current street thicker
                    [
                      "in",
                      ["to-string", ["get", "id"]],
                      ["literal", highlightedStreets],
                    ],
                    3, // Highlighted streets
                    2, // Default width
                  ],
                  lineOpacity: 0.7,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </ShapeSource>

            {/* Separate layer for current street highlight - more reliable */}
            {currentStreetId &&
              streetData.features.some((f) => f.id === currentStreetId) && (
                <ShapeSource
                  id="currentStreetHighlight"
                  shape={{
                    type: "FeatureCollection",
                    features: streetData.features.filter(
                      (street) => street.id === currentStreetId
                    ),
                  }}
                >
                  <Mapbox.LineLayer
                    id="current_street_highlight"
                    style={{
                      lineColor: "#c8f751",
                      lineWidth: 6,
                      lineOpacity: 0.8,
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

      {!isMapMenuOpen && (
        <CenterCameraOnUserButton
          userLocation={userLocation}
          centerOnUser={handleCenterOnUser}
        />
      )}

      {!hasLocationPermission && (
        <LocationEnablerPanel
          requestLocationPermission={handleRequestLocationPermission}
        />
      )}

      {userLocation && hasLocationPermission && isMapMenuOpen && (
        <MapTrackingPanel
          isLocationSubscrActive={locationSubscription ? "Active" : "Inactive"}
          currentStreetId={currentStreetId}
          streetData={streetData}
          sessionCountVisitedStreets={visitedStreets.length}
          allCountVisitedStreets={allVisitedStreetIds.size}
          onClose={handleMapMenuClose}
        />
      )}

      {isLoadingStreets && (
        <Text className="absolute inset-0 bg-black/30 justify-center items-center z-50">
          Loading streets...
        </Text>
      )}

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: "center",
          zIndex: 10,
          shadowColor: "#000",
          shadowOffset: { width: 2, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 2,
          elevation: 7,
          padding: 1,
          marginHorizontal: 140,
          borderRadius: 10,
          opacity: 0.9,
          justifyContent: "center",
        }}
        onPress={() => {
          toggleMapMenu();
        }}
      >
        <View
          style={{
            width: 100,
            height: 12,
            borderRadius: 4,
            backgroundColor: "#c8f751",
            marginBottom: 8,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default StreetTrackingMap;
