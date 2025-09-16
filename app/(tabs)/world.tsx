import { SafeAreaView } from "react-native-safe-area-context";
import { useUserData } from "@/Providers/UserDataProvider";
import { useLocationTracking } from "@/Providers/LocationTrackingProvider";
import Mapbox, { Camera, MapView, ShapeSource } from "@rnmapbox/maps";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
    hasBackgroundPermission,
    getMostVisitedStreets,
    getStreetsByTimeSpent,
    requestFullLocationPermissions,
    showPermissionPanel,
    setShowPermissionPanel,
  } = useLocationTracking();

  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isMapMenuOpen, setIsMapMenuOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);
  const [highlightedStreets, setHighlightedStreets] = useState<string[]>([]);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false); // Add this state

  const cameraRef = useRef<Camera>(null);
  const mapRef = useRef<MapView>(null);
  const isMountedRef = useRef(true); // Track component mount status

  const { getToken } = useAuth();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoize map configuration to prevent unnecessary re-renders
  const mapConfiguration = useMemo(
    () => ({
      styleURL: Mapbox.StyleURL.Street,
      zoomLevel: 13,
      centerCoordinate: userLocation
        ? [userLocation.longitude, userLocation.latitude]
        : [23.3219, 42.6977],
    }),
    [userLocation]
  );

  // Safe camera operations - check if component is mounted and refs exist
  const safeCameraOperation = useCallback(
    (operation: () => void) => {
      if (isMountedRef.current && cameraRef.current && isMapReady) {
        try {
          operation();
        } catch (error) {
          console.warn("Camera operation failed:", error);
        }
      }
    },
    [isMapReady]
  );

  const centerOnUser = useCallback(() => {
    if (userLocation) {
      safeCameraOperation(() => {
        cameraRef.current?.setCamera({
          centerCoordinate: [userLocation.longitude, userLocation.latitude],
          zoomLevel: 15,
          animationDuration: 1000,
        });
      });
    }
  }, [userLocation, safeCameraOperation]);

  // Handle map ready state
  const handleMapReady = useCallback(() => {
    console.log("Map loaded and ready");
    setIsMapReady(true);
  }, []);

  // Handle camera changes with error boundary
  const handleCameraChanged = useCallback((state: any) => {
    if (isMountedRef.current && state?.properties?.zoom) {
      setMapZoom(state.properties.zoom);
    }
  }, []);

  useEffect(() => {
    const initializeComponentData = async () => {
      if (initializationComplete || !userData) return;

      console.log("=== INITIALIZATION START ===");
      console.log("isLoading:", isLoading);
      console.log("userData:", !!userData);
      console.log("hasBackgroundPermission:", hasBackgroundPermission);
      console.log("isTracking:", isTracking);

      try {

        // await checkExistingPermissions();
        // Step 1: Initialize data (this includes permission check and server sync)
        console.log("Step 1: Initializing data...");
        await initializeData();

        // Step 2: Start tracking if not already tracking and we have permission
        if (!isTracking && hasBackgroundPermission) {
          console.log("Step 2: Starting tracking...");
          await startTracking(true);
          console.log("Tracking started successfully");
        } else if (!hasBackgroundPermission) {
          console.log(
            "Step 2: Skipping tracking start - no location permission"
          );
        } else {
          console.log("Step 2: Tracking already active");
        }

        if (isMountedRef.current) {
          setInitializationComplete(true);
          console.log("=== INITIALIZATION COMPLETE ===");
        }
      } catch (error) {
        console.error("Initialization failed:", error);
          if (isMountedRef.current) {
          Alert.alert("Error", "Failed to initialize location services");
        }
      }
    };

    // Only initialize if we have user data and haven't completed initialization
    if (userData && !initializationComplete) {
      initializeComponentData();
    }
  }, [userData, initializationComplete, hasBackgroundPermission]);
  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log("Component unmounting - cleaning up");
      isMountedRef.current = false;

      // Clean up any pending operations
      setTimeout(() => {
        destroyService().catch(console.error);
      }, 100);
    };
  }, []);

  // Update highlighted streets when current street changes
  // useEffect(() => {
  //   setHighlightedStreets(currentStreetId ? [currentStreetId] : []);
  // }, [currentStreetId]);

  // useEffect(() => {
  //   console.log(
  //     "=== STATE UPDATE DEBUG =============================================="
  //   );
  //   console.log("currentStreetId:", currentStreetId);
  //   console.log("visitedStreets:", visitedStreets);

  //   console.log("visitedStreets length:", visitedStreets.length);
  //   console.log("allVisitedStreetIds size:", allVisitedStreetIds.size);
  //   console.log("streetData available:", !!streetData);
  //   console.log(
  //     "streetData features count:",
  //     streetData?.features?.length || 0
  //   );
  //   console.log("hasBackgroundPermission:", hasBackgroundPermission);
  //   console.log("isTracking:", isTracking);
  // }, [
  //   currentStreetId,
  //   visitedStreets,
  //   allVisitedStreetIds,
  //   streetData,
  //   hasBackgroundPermission,
  //   isTracking,
  // ]);

  const handleRequestLocationPermission = useCallback(async () => {
    //this is fot when the app knows that the user doesnt have pers so just should get it as in the onboarding
    try {
      const granted = await requestFullLocationPermissions();

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
  }, [
    requestFullLocationPermissions,
    getToken,
    isTracking,
    startTracking,
    setShowPermissionPanel,
  ]);

  const toggleMapMenu = useCallback(() => {
    setIsMapMenuOpen((prev) => !prev);
  }, []);

  const handleMapMenuClose = useCallback(() => {
    setIsMapMenuOpen(false);
  }, []);

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
        styleURL={mapConfiguration.styleURL}
        onDidFinishLoadingMap={handleMapReady}
        onCameraChanged={handleCameraChanged}
      >
        {/* Only render map content after map is ready */}
        {isMapReady && (
          <>
            <Mapbox.Images
              images={{
                "user-location": require("../../assets/images/icon.png"),
              }}
            />

            <Camera
              ref={cameraRef}
              zoomLevel={mapConfiguration.zoomLevel}
              centerCoordinate={mapConfiguration.centerCoordinate}
              followUserLocation={isFollowingUser}
            />

            {/* User location marker */}
            {userLocation && hasBackgroundPermission && (
              <Mapbox.ShapeSource
                id="userLocationSource"
                shape={{
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [
                      userLocation.longitude,
                      userLocation.latitude,
                    ],
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

            {/* Street layers */}
            {streetData && mapZoom >= 11 && (
              <>
                {/* Current street highlight */}
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
          </>
        )}
      </MapView>

      {isMapReady && !isMapMenuOpen && (
        <CenterCameraOnUserButton
          userLocation={userLocation}
          centerOnUser={centerOnUser}
        />
      )}

      {showPermissionPanel && !isLoading && userData && (
        <LocationEnablerPanel
          requestLocationPermission={handleRequestLocationPermission}
        />
      )}

      {userLocation && hasBackgroundPermission && isMapMenuOpen && (
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
