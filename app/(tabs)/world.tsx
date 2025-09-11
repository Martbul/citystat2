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
import { useAuth } from "@clerk/clerk-expo";

const mapToken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
Mapbox.setAccessToken(mapToken!);

const StreetTrackingMap = () => {
  const { isLoading, userData } = useUserData();

  const {
    userLocation,
    currentStreetId,
    streetData,
    visitedStreets,
    allVisitedStreetIds,
    startTracking,
    initializeData,
    destroyService,
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
  const [initializationComplete, setInitializationComplete] = useState(false);

  const cameraRef = useRef<Camera>(null);
  const mapRef = useRef<MapView>(null);
  const { getToken } = useAuth();

  // useEffect(() => {
  //   const initializeComponentData = async () => {
  //     if (initializationComplete) return;
      
  //     console.log("=== INITIALIZATION START ===");
  //     console.log("isLoading:", isLoading);
  //     console.log("userData:", !!userData);
  //     console.log("hasLocationPermission:", hasLocationPermission);
  //     console.log("isTracking:", isTracking);

  //     try {
  //       // Step 1: Initialize data (this includes permission check and server sync)
  //       console.log("Step 1: Initializing data...");
  //       await initializeData();
        
  //       // Step 2: Start tracking if not already tracking and we have permission
  //       if (!isTracking && hasLocationPermission) {
  //         console.log("Step 2: Starting tracking...");
  //         await startTracking(true);
  //         console.log("Tracking started successfully");
  //       } else if (!hasLocationPermission) {
  //         console.log("Step 2: Skipping tracking start - no location permission");
  //       } else {
  //         console.log("Step 2: Tracking already active");
  //       }
        
  //       setInitializationComplete(true);
  //       console.log("=== INITIALIZATION COMPLETE ===");
        
  //     } catch (error) {
  //       console.error("Initialization failed:", error);
  //       Alert.alert("Error", "Failed to initialize location services");
  //     }
  //   };

  //   // Only initialize if we have user data and haven't completed initialization
  //   if (userData && !initializationComplete) {
  //     initializeComponentData();
  //   }

  //   return () => {
  //     console.log("Cleanup function running");
  //     if (isTracking) {
  //       console.log("About to stop tracking");
  //       stopTracking().catch(console.error);
  //     }
  //   };
  // }, [userData, isTracking, hasLocationPermission, initializationComplete]);

  // Initialization effect (runs when userData changes)
useEffect(() => {
  const initializeComponentData = async () => {
      if (initializationComplete) return;
      
      console.log("=== INITIALIZATION START ===");
      console.log("isLoading:", isLoading);
      console.log("userData:", !!userData);
      console.log("hasLocationPermission:", hasLocationPermission);
      console.log("isTracking:", isTracking);

      try {
        // Step 1: Initialize data (this includes permission check and server sync)
        console.log("Step 1: Initializing data...");
        await initializeData();
        
        // Step 2: Start tracking if not already tracking and we have permission
        if (!isTracking && hasLocationPermission) {
          console.log("Step 2: Starting tracking...");
          await startTracking(true);
          console.log("Tracking started successfully");
        } else if (!hasLocationPermission) {
          console.log("Step 2: Skipping tracking start - no location permission");
        } else {
          console.log("Step 2: Tracking already active");
        }
        
        setInitializationComplete(true);
        console.log("=== INITIALIZATION COMPLETE ===");
        
      } catch (error) {
        console.error("Initialization failed:", error);
        Alert.alert("Error", "Failed to initialize location services");
      }
    };

    // Only initialize if we have user data and haven't completed initialization
    if (userData && !initializationComplete) {
      initializeComponentData();
    }


}, [userData, initializationComplete,hasLocationPermission]);

 useEffect(() => {
  return () => {
    console.log("Component unmounting - cleaning up via provider");
    
    const cleanup = async () => {
      try {
        await destroyService();
      } catch (error) {
        console.error("Provider cleanup error:", error);
      }
    };
    
    cleanup();
  };
}, []); // Empty array = only on unmount

  // Update highlighted streets when current street changes
  useEffect(() => {
    setHighlightedStreets(currentStreetId ? [currentStreetId] : []);
  }, [currentStreetId]);

  useEffect(() => {

    console.log("=== STATE UPDATE DEBUG ==============================================");
    console.log("currentStreetId:", currentStreetId);
        console.log("visitedStreets:", visitedStreets);

    console.log("visitedStreets length:", visitedStreets.length);
    console.log("allVisitedStreetIds size:", allVisitedStreetIds.size);
    console.log("streetData available:", !!streetData);
    console.log("streetData features count:", streetData?.features?.length || 0);
    console.log("hasLocationPermission:", hasLocationPermission);
    console.log("isTracking:", isTracking);
  }, [currentStreetId, visitedStreets, allVisitedStreetIds, streetData, hasLocationPermission, isTracking]);

  const handleRequestLocationPermission = useCallback(async () => {
    try {
      const token = await getToken();
      const granted = await requestLocationPermission(token);
      
      if (granted) {
        console.log("Permission granted, starting tracking...");
        // After permission is granted, start tracking
        if (!isTracking) {
          await startTracking(true);
        }
      } else {
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
  }, [requestLocationPermission, getToken, isTracking, startTracking]);

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

  // Get analytics data for the menu with debugging
  const getMostVisitedData = useCallback(() => {
    const data = getMostVisitedStreets(5);
    console.log("Most visited streets data:", data.length);
    return data;
  }, [getMostVisitedStreets]);

  const getTimeSpentData = useCallback(() => {
    const data = getStreetsByTimeSpent(5);
    console.log("Time spent streets data:", data.length);
    return data;
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
            {/* <ShapeSource
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
                    "#797979",
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
                    3, // Current street thicker
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

              } */}

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

      {!hasLocationPermission && !isLoading && userData && (
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

      {(!streetData || !initializationComplete) && userData && (
        <View className="absolute inset-0 bg-black/30 justify-center items-center z-50 pointer-events-none">
          <Spinner />
          <Text className="text-white text-lg">
            {!streetData ? "Loading streets..." : "Initializing..."}
          </Text>
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