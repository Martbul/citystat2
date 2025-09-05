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
import { useLocationTracking } from "@/Providers/LocationTrackingProvider";

import Mapbox, { Camera, MapView, ShapeSource } from "@rnmapbox/maps";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CenterCameraOnUserButton from "@/components/centerCameraOnUserButton";
import LocationEnablerPanel from "@/components/locationEnablerPanel";
import VisitedStreetsLayer from "@/components/displyVisitedStreets";
import MapTrackingPanel from "@/components/mapMenu";
import Spinner from "@/components/spinner";

const mapToken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
Mapbox.setAccessToken(mapToken!);

//!  LOG  Successfully processed 1696 streets
//! user is in other screens buit streets are loaded(do not remove but do it once for performace purposses)


//! make new separate functions for traking the user cause this only log the visited strrets and cant be sed for stats like favorete place and so on....

const StreetTrackingMap = () => {
  const { isLoading } = useUserData();

  // Use the new location tracking context
  const {
    userLocation,
    currentStreetId,
    streetData,
    visitedStreets,
    allVisitedStreetIds,
    startTracking,
    stopTracking,
    isTracking,
    hasLocationPermission,
    requestLocationPermission,
    getMostVisitedStreets,
    getStreetsByTimeSpent,
  } = useLocationTracking();

  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isMapMenuOpen, setIsMapMenuOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);
  const [highlightedStreets, setHighlightedStreets] = useState<string[]>([]);

  const cameraRef = useRef<Camera>(null);
  const mapRef = useRef<MapView>(null);
  useEffect(() => {
    const initializeTracking = async () => {
      if (hasLocationPermission && !isTracking) {
        try {
          await startTracking(true); // Enable background tracking
        } catch (error) {
          console.error("Failed to start tracking:", error);
          Alert.alert("Error", "Failed to start location tracking");
        }
      }
    };

    initializeTracking();

    // Cleanup on unmount
    return () => {
      if (isTracking) {
        stopTracking().catch(console.error);
      }
    };
  }, [hasLocationPermission, isTracking, startTracking, stopTracking]);

  // Update highlighted streets when current street changes
  useEffect(() => {
    setHighlightedStreets(currentStreetId ? [currentStreetId] : []);
  }, [currentStreetId]);

  const handleRequestLocationPermission = useCallback(async () => {
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for street tracking."
        );
      }
      return granted;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert("Error", "Failed to request location permission");
      return false;
    }
  }, [requestLocationPermission]);


const centerOnUser = useCallback(() => {
  if (userLocation && cameraRef.current) {
    cameraRef.current.setCamera({
      centerCoordinate: [userLocation.longitude, userLocation.latitude],
      zoomLevel: 15,
      animationDuration: 1000,
    });
  }
}, [userLocation]);

const toggleMapMenu = useCallback(() => {
  setIsMapMenuOpen((prev) => !prev);
}, []);

const handleMapMenuClose = useCallback(() => {
  setIsMapMenuOpen(false);
}, []);

// Get analytics data for the menu
const getMostVisitedData = useCallback(() => {
  return getMostVisitedStreets(5);
}, [getMostVisitedStreets]);

const getTimeSpentData = useCallback(() => {
  return getStreetsByTimeSpent(5);
}, [getStreetsByTimeSpent]);
  
  
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
          centerOnUser={centerOnUser}
        />
      )}

      {!hasLocationPermission && (
        <LocationEnablerPanel
          requestLocationPermission={handleRequestLocationPermission}
        />
      )}

      {userLocation && hasLocationPermission && isMapMenuOpen && (
        <MapTrackingPanel
          isLocationSubscrActive={isTracking ? "Active" : "Inactive"}
          currentStreetId={currentStreetId}
          streetData={streetData}
          sessionCountVisitedStreets={visitedStreets.length}
          allCountVisitedStreets={allVisitedStreetIds.size}
          onClose={handleMapMenuClose}
          mostVisitedStreets={getMostVisitedData()}
          streetsByTimeSpent={getTimeSpentData()}
        />
      )}

      {/* Loading indicator */}
      {!streetData && isTracking && (
        <View className="absolute inset-0 bg-black/30 justify-center items-center z-50 pointer-events-none">
          <Spinner />
          <Text className="text-white text-lg">Loading streets...</Text>
        </View>
      )}

      {/* Map menu toggle button */}
      <TouchableOpacity
        style={styles.menuToggleButton}
        onPress={toggleMapMenu}
        activeOpacity={0.7}
      >
        <View style={styles.menuToggleBar} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  menuToggleButton: {
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
  },
  menuToggleBar: {
    width: 100,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#c8f751",
    marginBottom: 8,
  },
});


export default StreetTrackingMap;
