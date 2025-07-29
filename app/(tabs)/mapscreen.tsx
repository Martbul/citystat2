import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import Mapbox, { Camera, MapView, PointAnnotation, ShapeSource } from "@rnmapbox/maps";
import * as Location from 'expo-location';
import * as turf from "@turf/turf";
import { MIN_MOVEMENT_DISTANCE_METERS } from "@/constants/Location";


//TODO: Understand useCallback
//TODO: Uderstand ref()


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

//TODO: a street has a single visited coords????
interface VisitedStreet {
  streetId: string;
  streetName: string;
  timestamp: number;
  coordinates: UserCoords;
  duration?: number; 
}



const StreetTrackingMap = () => {
  const [userLocation, setUserLocation] = useState<UserCoords | null>(null);
  const [highlightedStreets, setHighlightedStreets] = useState<string[]>([]);
  const [streetData, setStreetData] = useState<StreetData | null>(null);
  const [currentStreetId, setCurrentStreetId] = useState<string | null>(null);
  const [visitedStreets, setVisitedStreets] = useState<VisitedStreet[]>([]);
  const [isLoadingStreets, setIsLoadingStreets] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  
  const mapRef = useRef(null);
  const streetEntryTimeRef = useRef<number | null>(null);
  const lastLocationUpdateRef = useRef<number>(0);
  const [previousUserCoords, setPreviousUserCoords] = useState<UserCoords | null>(null);


  useEffect(() => {
    requestLocationPermission();
    
    return () => {
      stopLocationTracking();
    };
  }, []);



  useEffect(() => {
    const interval = setInterval(() => {
      if (visitedStreets.length > 0) {
        saveVisitedStreetsToDatabase();
      }
    }, 180000); // Save every 3 minutes

    return () => clearInterval(interval);
  }, [visitedStreets]);


  //TODO: Save req permisions in DB
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for street tracking.'
        );
        setHasLocationPermission(false);
        return false;
      }

      console.log('Location permission granted');
      setHasLocationPermission(true);
      await startLocationTracking();
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
      setHasLocationPermission(false);
      return false;
    }
  };

  //TODO: Set the time imterval to 30sec when a user is off screen but the app still works in the background and change it to every 5-10 sec when the user looks at the map

  const startLocationTracking = async () => {
    try {
      console.log('Getting initial location...');
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      });

      console.log('Initial location received:', initialLocation);
      handleLocationUpdate(initialLocation);

      // Start watching position
      console.log('Starting location watching...');
      //TODO: Maybe use array to push in it every location so that it can be drawn later where on the street you have been
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 7000, // Update every 7 seconds
          distanceInterval: 15, // Update when user moves 15 meters
        },
        (location) => {
          console.log('Location update received:', location);
          handleLocationUpdate(location);
        }
      );

      setLocationSubscription(subscription);
      console.log('Location tracking started successfully');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      console.log('Location tracking stopped');
    }
  };

 

const fetchStreetData = useCallback(async (coords: UserCoords) => {
  if (!mapToken) return;
  
  setIsLoadingStreets(true);
  try {
    // Create a bounding box around user location (roughly 1km radius)
    const buffer = 0.01; // ~1km in degrees
    const bbox = [
      coords.longitude - buffer, // west
      coords.latitude - buffer,  // south
      coords.longitude + buffer, // east
      coords.latitude + buffer   // north
    ];

    // Use Overpass API for OpenStreetMap data
    const overpassQuery = `
      [out:json][timeout:25];
      (
        way["highway"~"^(primary|secondary|tertiary|residential|trunk|motorway|unclassified)$"]
          (${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]});
      );
      out geom;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    const data = await response.json();
    
    // Convert Overpass data to proper GeoJSON format
    const features: Street[] = data.elements
      .filter((element: any) => element.type === 'way' && element.geometry)
      .map((way: any) => ({
        type: "Feature", // Now includes the required type property
        id: way.id.toString(),
        geometry: {
          type: "LineString",
          coordinates: way.geometry.map((node: any) => [node.lon, node.lat])
        },
        properties: {
          name: way.tags?.name,
          highway: way.tags?.highway,
          surface: way.tags?.surface,
        }
      }));

    setStreetData({
      type: "FeatureCollection",
      features
    });

    console.log(`Loaded ${features.length} streets in the area`);
  } catch (error) {
    console.error('Error fetching street data:', error);
    Alert.alert('Error', 'Failed to load street data');
  } finally {
    setIsLoadingStreets(false);
  }
}, [mapToken]);


  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };


  //TODO: Location.LocationObject has option to be mocked => use it for testing 
  const handleLocationUpdate = useCallback((location: Location.LocationObject) => {
    try {
      const { coords } = location;
      const newUserCoords: UserCoords = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      // Validate coordinates
      if (!isFinite(newUserCoords.latitude) || !isFinite(newUserCoords.longitude)) {
        console.warn('Invalid coordinates received:', newUserCoords);
        return;
      }

      // Throttle location updates to avoid excessive processing
      const now = Date.now();
      if (now - lastLocationUpdateRef.current < 2000) {
        return; // 2 second throttle
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

        if (movementDistance < MIN_MOVEMENT_DISTANCE_METERS) {
          return; // Don't update if movement is too small
        }
      }

      console.log('Processing location update:', newUserCoords);
      setUserLocation(newUserCoords);

      // Check street proximity
      checkStreetProximity(newUserCoords);

      // Fetch new street data if user moved significantly
      if (!streetData || shouldRefreshStreetData(newUserCoords)) {
        fetchStreetData(newUserCoords);
      }

      setPreviousUserCoords(newUserCoords);
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  }, [previousUserCoords, streetData, fetchStreetData]);


  const shouldRefreshStreetData = (newCoords: UserCoords): boolean => {
    if (!userLocation) return true;
    
    const distance = turf.distance(
      [userLocation.longitude, userLocation.latitude],
      [newCoords.longitude, newCoords.latitude],
      { units: 'kilometers' }
    );
    
    
    return distance > 0.5; // Refresh if moved more than 500m
  };


  // Check if user is near/on a street
  const checkStreetProximity = useCallback((userCoords: UserCoords) => {
    if (!streetData) return;

    const userPoint = turf.point([userCoords.longitude, userCoords.latitude]);
    const proximityThreshold = 0.02; // ~20 meters

    let foundStreet: string | null = null;
    let closestDistance = Infinity;

    streetData.features.forEach((street) => {
      try {
        const streetLine = turf.lineString(street.geometry.coordinates);
        const distance = turf.pointToLineDistance(userPoint, streetLine, {
          units: "kilometers",
        });

        if (distance <= proximityThreshold && distance < closestDistance) {
          closestDistance = distance;
          foundStreet = street.id;
        }
      } catch (error) {
        console.warn(`Error processing street ${street.id}:`, error);
      }
    });

    // Handle street changes
    if (foundStreet !== currentStreetId) {
      handleStreetChange(foundStreet, userCoords);
    }

    // Update highlighted streets
    setHighlightedStreets(foundStreet ? [foundStreet] : []);
  }, [streetData, currentStreetId]);


  const saveVisitedStreetsToDatabase = async () => {
    try {
      const response = await fetch('YOUR_API_ENDPOINT/visited-streets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth headers here
        },
        body: JSON.stringify({
          userId: 'YOUR_USER_ID', // Get from your auth system
          visitedStreets: visitedStreets,
          sessionId: Date.now().toString(), // Or generate proper session ID
        }),
      });

      if (response.ok) {
        console.log('Successfully saved visited streets to database');
        // Optionally clear local storage after successful save
        // setVisitedStreets([]);
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error('Error saving visited streets:', error);
      Alert.alert('Error', 'Failed to save street data');
    }
  };


const handleStreetChange = (newStreetId: string | null, coords: UserCoords) => {
  const now = Date.now();

  // User left a street
  if (currentStreetId && currentStreetId !== newStreetId) {
    const exitTime = now;
    const entryTime = streetEntryTimeRef.current || now;
    const duration = Math.floor((exitTime - entryTime) / 1000); // Duration in seconds

    // Update the last visited street with duration
    setVisitedStreets(prev => {
      const updated = [...prev];
      const lastStreet = updated[updated.length - 1];
      if (lastStreet && lastStreet.streetId === currentStreetId) {
        lastStreet.duration = duration;
      }
      return updated;
    });

    console.log(`User left street ${currentStreetId}, spent ${duration} seconds`);
  }

  // User entered a new street
  if (newStreetId && newStreetId !== currentStreetId) {
    const street = streetData?.features.find(s => s.id === newStreetId);
    const streetName = street?.properties?.name || `Unknown Street ${newStreetId}`;
    
    const visitedStreet: VisitedStreet = {
      streetId: newStreetId,
      streetName,
      timestamp: now,
      coordinates: coords,
    };

    setVisitedStreets(prev => [...prev, visitedStreet]);
    streetEntryTimeRef.current = now;

    console.log(`User entered street: ${streetName} (${newStreetId})`);
  }

  setCurrentStreetId(newStreetId);
};



  // Generate street style based on highlight status
  const getStreetStyle = (streetId: string) => {
    const isHighlighted = highlightedStreets.includes(streetId);
    const isCurrent = streetId === currentStreetId;
    
    return {
      lineColor: isCurrent ? "#00FF00" : isHighlighted ? "#FF0000" : "#0000FF",
      lineWidth: isCurrent ? 10 : isHighlighted ? 8 : 4,
      lineOpacity: isCurrent ? 1 : isHighlighted ? 1 : 0.7,
    };
  };



  const getCurrentStreetName = (): string => {
  if (!currentStreetId || !streetData) return "Not on a street";
  
  const street = streetData.features.find(s => s.id === currentStreetId);
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

        {streetData && (
          <ShapeSource id="streetsSource" shape={streetData}>
            {streetData.features.map((street) => (
              <Mapbox.LineLayer
                key={street.id}
                id={`street_layer_${street.id}`}
                style={{
                  ...getStreetStyle(street.id),
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            ))}
          </ShapeSource>
        )}
      </MapView>

      <View style={styles.infoPanel}>
        {!hasLocationPermission && (
          <Text style={styles.permissionText}>
            Location permission required for tracking
          </Text>
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
              Tracking: {locationSubscription ? 'Active' : 'Inactive'}
            </Text>
          </>
        )}
        
        <Text style={styles.currentStreet}>
          Current Street: {getCurrentStreetName()}
        </Text>
        
        <Text style={styles.statsText}>
          Visited Streets: {visitedStreets.length}
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
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  currentStreet: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statsText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
  loadingText: {
    fontSize: 12,
    color: '#FFA500',
    fontStyle: 'italic',
  },
  permissionText: {
    fontSize: 14,
    color: '#FF0000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationDot: {
    width: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 2,
  },
  userLocationPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
});

export default StreetTrackingMap;