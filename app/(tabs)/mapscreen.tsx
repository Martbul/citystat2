// import React, { useEffect, useRef, useState } from "react";
// import { StyleSheet, View, SafeAreaView, Text } from "react-native";
// import Mapbox, { Camera, LineLayer, MapView, PointAnnotation, ShapeSource, UserLocation } from "@rnmapbox/maps";
// import Entypo from '@expo/vector-icons/Entypo';
// import { sofiaStreets } from "@/mockData/mocks";

// // Mock data for 20 streets in Sofia, Bulgaria

// interface MapboxMap {
//   on: (event: string, layerIdOrCallback: string | Function, callback?: Function) => void;
//   remove: () => void;
//   addSource: (id: string, source: any) => void;
//   addLayer: (layer: any) => void;
//   setPaintProperty: (layerId: string, property: string, value: any) => void;
//   getCanvas: () => HTMLCanvasElement;
// }

// const mapToken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
// Mapbox.setAccessToken(mapToken!);

// export default function MapsScreen() {
//   // Sofia city center coordinates
//   const [coords, setCoords] = useState<[number, number]>([23.3219, 42.6977]);
//   const [destinationCoords, setDestinationCoords] = useState<[number, number]>([
//     23.3219, 42.6977,
//   ]);

//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<MapboxMap | null>(null);
//   const [userCoords, setUserCoords] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);

//   // Function to get line color based on distance walked
//   const getLineColor = (distance: number) => {
//     if (distance < 800) return "#FF6B6B"; // Red for short walks
//     if (distance < 1500) return "#4ECDC4"; // Teal for medium walks
//     if (distance < 2000) return "#45B7D1"; // Blue for long walks
//     return "#96CEB4"; // Green for very long walks
//   };

//   // Function to get line width based on distance
//   const getLineWidth = (distance: number) => {
//     if (distance < 800) return 2;
//     if (distance < 1500) return 3;
//     if (distance < 2000) return 4;
//     return 5;
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.mapContainer}>
//         <MapView
//           style={styles.map}
//           styleURL={Mapbox.StyleURL.Street}
//           zoomEnabled
//           rotateEnabled
//         >
//           <Camera
//             zoomLevel={13}
//             centerCoordinate={
//               userCoords
//                 ? [userCoords.longitude, userCoords.latitude]
//                 : [23.3219, 42.6977] // Sofia city center
//             }
//           />

//           {/* Render all Sofia streets */}
//           {sofiaStreets.map((street) => (
//             <ShapeSource
//               key={`street-${street.id}`}
//               id={`street-source-${street.id}`}
//               shape={{
//                 type: "Feature",
//                 properties: {
//                   name: street.name,
//                   distance: street.distance,
//                   walkedAt: street.walkedAt,
//                 },
//                 geometry: {
//                   type: "LineString",
//                   coordinates: street.coordinates,
//                 },
//               }}
//             >
//               <LineLayer
//                 id={`street-layer-${street.id}`}
//                 style={{
//                   lineColor: getLineColor(street.distance),
//                   lineWidth: getLineWidth(street.distance),
//                   lineOpacity: 0.8,
//                 }}
//               />
//             </ShapeSource>
//           ))}

//           {destinationCoords && (
//             <PointAnnotation
//               id="destinationPoint"
//               coordinate={destinationCoords}
//             >
//               <View style={styles.destinationIcon}>
//                 <Entypo name="location-pin" size={24} color="black" />
//               </View>
//             </PointAnnotation>
//           )}

//           <UserLocation
//             visible={true}
//             onUpdate={(location) => {
//               const { coords } = location;
//               setUserCoords({
//                 latitude: coords.latitude,
//                 longitude: coords.longitude,
//               });
//             }}
//           />
//         </MapView>
//       </View>

//       {userCoords && (
//         <View style={styles.info}>
//           <Text>Lat: {userCoords.latitude}</Text>
//           <Text>Lng: {userCoords.longitude}</Text>
//         </View>
//       )}

//       {/* Legend */}
//       <View style={styles.legend}>
//         <Text style={styles.legendTitle}>Street Walking Legend</Text>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendLine, { backgroundColor: "#FF6B6B" }]} />
//           <Text style={styles.legendText}>800m</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendLine, { backgroundColor: "#4ECDC4" }]} />
//           <Text style={styles.legendText}>800m - 1.5km</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendLine, { backgroundColor: "#45B7D1" }]} />
//           <Text style={styles.legendText}>1.5km - 2km</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendLine, { backgroundColor: "#96CEB4" }]} />
//           <Text style={styles.legendText}> 2km</Text>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   mapContainer: { flex: 1 },
//   map: { flex: 1 },
//   info: {
//     position: "absolute",
//     bottom: 30,
//     left: 20,
//     right: 20,
//     backgroundColor: "white",
//     padding: 10,
//     borderRadius: 10,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   destinationIcon: {
//     width: 30,
//     height: 30,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   legend: {
//     position: "absolute",
//     top: 60,
//     right: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.9)",
//     padding: 12,
//     borderRadius: 8,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.22,
//     shadowRadius: 2.22,
//   },
//   legendTitle: {
//     fontSize: 12,
//     fontWeight: "bold",
//     marginBottom: 8,
//     color: "#333",
//   },
//   legendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   legendLine: {
//     width: 20,
//     height: 3,
//     marginRight: 8,
//     borderRadius: 1.5,
//   },
//   legendText: {
//     fontSize: 10,
//     color: "#666",
//   },
// });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// import React, { useRef, useState } from "react";
// import { StyleSheet, View, SafeAreaView, Text } from "react-native";
// import Mapbox, { Camera, LineLayer, MapView, PointAnnotation, ShapeSource, UserLocation } from "@rnmapbox/maps";
// import Entypo from '@expo/vector-icons/Entypo';
// import { sofiaStreets } from "@/mockData/mocks";

// // Mock data for 20 streets in Sofia, Bulgaria

// interface MapboxMap {
//   on: (event: string, layerIdOrCallback: string | Function, callback?: Function) => void;
//   remove: () => void;
//   addSource: (id: string, source: any) => void;
//   addLayer: (layer: any) => void;
//   setPaintProperty: (layerId: string, property: string, value: any) => void;
//   getCanvas: () => HTMLCanvasElement;
// }

// interface VisitedStreet {
//   streetId: number;
//   coordinates: number[][];
//   visitedAt: string;
//   isCompleted: boolean;
// }

// interface CurrentRoute {
//   streetId: number;
//   coordinates: number[][];
//   startTime: string;
// }

// const mapToken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
// Mapbox.setAccessToken(mapToken!);

// export default function MapsScreen() {
//   // Sofia city center coordinates
//   const [coords, setCoords] = useState<[number, number]>([23.3219, 42.6977]);
//   const [destinationCoords, setDestinationCoords] = useState<[number, number]>([
//     23.3219, 42.6977,
//   ]);

//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<MapboxMap | null>(null);
//   const [userCoords, setUserCoords] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);

//   // New state for street tracking
//   const [visitedStreets, setVisitedStreets] = useState<VisitedStreet[]>([]);
//   const [currentRoute, setCurrentRoute] = useState<CurrentRoute | null>(null);
//   const [currentStreetId, setCurrentStreetId] = useState<number | null>(null);
//   const [previousUserCoords, setPreviousUserCoords] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);

//   // Distance threshold for considering user "on street" (in meters)
//   const STREET_PROXIMITY_THRESHOLD = 50;

//   // Minimum movement distance to update route (in meters)
//   const MIN_MOVEMENT_DISTANCE = 10;

//   // Function to calculate distance between two points using Haversine formula
//   const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
//     const R = 6371e3; // Earth's radius in meters
//     const φ1 = lat1 * Math.PI / 180;
//     const φ2 = lat2 * Math.PI / 180;
//     const Δφ = (lat2 - lat1) * Math.PI / 180;
//     const Δλ = (lon2 - lon1) * Math.PI / 180;

//     const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ/2) * Math.sin(Δλ/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

//     return R * c;
//   };

//   // Function to find the closest point on a line segment to a given point
//   const closestPointOnLineSegment = (
//     px: number, py: number,
//     x1: number, y1: number,
//     x2: number, y2: number
//   ) => {
//     const A = px - x1;
//     const B = py - y1;
//     const C = x2 - x1;
//     const D = y2 - y1;

//     const dot = A * C + B * D;
//     const lenSq = C * C + D * D;

//     if (lenSq === 0) return { x: x1, y: y1 };

//     let param = dot / lenSq;
//     param = Math.max(0, Math.min(1, param));

//     const xx = x1 + param * C;
//     const yy = y1 + param * D;

//     return { x: xx, y: yy };
//   };

//   // Function to check if user is on a specific street
//   const isUserOnStreet = (userLat: number, userLon: number, streetCoordinates: number[][]): boolean => {
//     for (let i = 0; i < streetCoordinates.length - 1; i++) {
//       const [lon1, lat1] = streetCoordinates[i];
//       const [lon2, lat2] = streetCoordinates[i + 1];

//       const closest = closestPointOnLineSegment(userLon, userLat, lon1, lat1, lon2, lat2);
//       const distance = calculateDistance(userLat, userLon, closest.y, closest.x);

//       if (distance <= STREET_PROXIMITY_THRESHOLD) {
//         return true;
//       }
//     }
//     return false;
//   };

//   // Function to save visited street to database
//   const saveVisitedStreetToDB = async (visitedStreet: VisitedStreet) => {
//     try {
//       // Replace with your actual API endpoint
//       const response = await fetch('/api/visited-streets', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           streetId: visitedStreet.streetId,
//           coordinates: visitedStreet.coordinates,
//           visitedAt: visitedStreet.visitedAt,
//           isCompleted: visitedStreet.isCompleted,
//           // Add user ID if you have authentication
//           // userId: currentUser.id,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to save visited street');
//       }

//       const result = await response.json();
//       console.log('Visited street saved successfully:', result);
//     } catch (error) {
//       console.error('Error saving visited street:', error);
//     }
//   };

//   // Function to save current route to database
//   const saveCurrentRouteToDB = async (route: CurrentRoute) => {
//     try {
//       // Replace with your actual API endpoint
//       const response = await fetch('/api/current-routes', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           streetId: route.streetId,
//           coordinates: route.coordinates,
//           startTime: route.startTime,
//           // Add user ID if you have authentication
//           // userId: currentUser.id,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to save current route');
//       }

//       const result = await response.json();
//       console.log('Current route saved successfully:', result);
//     } catch (error) {
//       console.error('Error saving current route:', error);
//     }
//   };

//   // Function to update current route coordinates
//   const updateCurrentRoute = (newCoords: { latitude: number; longitude: number }) => {
//     if (currentRoute && currentStreetId) {
//       const updatedRoute = {
//         ...currentRoute,
//         coordinates: [...currentRoute.coordinates, [newCoords.longitude, newCoords.latitude]]
//       };
//       setCurrentRoute(updatedRoute);

//       // Save updated route to database
//       saveCurrentRouteToDB(updatedRoute);
//     }
//   };

//   // Function to handle user location updates
//   const handleLocationUpdate = (location: any) => {
//     const { coords } = location;
//     const newUserCoords = {
//       latitude: coords.latitude,
//       longitude: coords.longitude,
//     };

//     // Check if user has moved significantly
//     if (previousUserCoords) {
//       const movementDistance = calculateDistance(
//         previousUserCoords.latitude,
//         previousUserCoords.longitude,
//         newUserCoords.latitude,
//         newUserCoords.longitude
//       );

//       if (movementDistance < MIN_MOVEMENT_DISTANCE) {
//         return; // Don't update if movement is too small
//       }
//     }

//     setUserCoords(newUserCoords);

//     // Check which street the user is currently on
//     let foundStreetId: number | null = null;

//     for (const street of sofiaStreets) {
//       if (isUserOnStreet(newUserCoords.latitude, newUserCoords.longitude, street.coordinates)) {
//         foundStreetId = street.id;
//         break;
//       }
//     }

//     // Handle street changes
//     if (foundStreetId !== currentStreetId) {
//       // User left previous street
//       if (currentStreetId && currentRoute) {
//         // Mark previous street as completed and save to visited streets
//         const completedStreet: VisitedStreet = {
//           streetId: currentRoute.streetId,
//           coordinates: currentRoute.coordinates,
//           visitedAt: currentRoute.startTime,
//           isCompleted: true,
//         };

//         setVisitedStreets(prev => {
//           const updated = [...prev, completedStreet];
//           saveVisitedStreetToDB(completedStreet);
//           return updated;
//         });

//         setCurrentRoute(null);
//       }

//       // User entered new street
//       if (foundStreetId) {
//         const newRoute: CurrentRoute = {
//           streetId: foundStreetId,
//           coordinates: [[newUserCoords.longitude, newUserCoords.latitude]],
//           startTime: new Date().toISOString(),
//         };

//         setCurrentRoute(newRoute);
//         saveCurrentRouteToDB(newRoute);
//       }

//       setCurrentStreetId(foundStreetId);
//     } else if (foundStreetId && currentRoute) {
//       // User is still on the same street, update route
//       updateCurrentRoute(newUserCoords);
//     }

//     setPreviousUserCoords(newUserCoords);
//   };

//   // Function to get line color based on distance walked
//   const getLineColor = (distance: number) => {
//     if (distance < 800) return "#FF6B6B"; // Red for short walks
//     if (distance < 1500) return "#4ECDC4"; // Teal for medium walks
//     if (distance < 2000) return "#45B7D1"; // Blue for long walks
//     return "#96CEB4"; // Green for very long walks
//   };

//   // Function to get line width based on distance
//   const getLineWidth = (distance: number) => {
//     if (distance < 800) return 2;
//     if (distance < 1500) return 3;
//     if (distance < 2000) return 4;
//     return 5;
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.mapContainer}>
//         <MapView
//           style={styles.map}
//           styleURL={Mapbox.StyleURL.Street}
//           zoomEnabled
//           rotateEnabled
//         >
//           <Camera
//             zoomLevel={13}
//             centerCoordinate={
//               userCoords
//                 ? [userCoords.longitude, userCoords.latitude]
//                 : [23.3219, 42.6977] // Sofia city center
//             }
//           />

//           {/* Render all Sofia streets */}
//           {sofiaStreets.map((street) => (
//             <ShapeSource
//               key={`street-${street.id}`}
//               id={`street-source-${street.id}`}
//               shape={{
//                 type: "Feature",
//                 properties: {
//                   name: street.name,
//                   distance: street.distance,
//                   walkedAt: street.walkedAt,
//                 },
//                 geometry: {
//                   type: "LineString",
//                   coordinates: street.coordinates,
//                 },
//               }}
//             >
//               <LineLayer
//                 id={`street-layer-${street.id}`}
//                 style={{
//                   lineColor: getLineColor(street.distance),
//                   lineWidth: getLineWidth(street.distance),
//                   lineOpacity: 0.8,
//                 }}
//               />
//             </ShapeSource>
//           ))}

//           {/* Render visited streets */}
//           {visitedStreets.map((visitedStreet, index) => (
//             <ShapeSource
//               key={`visited-${visitedStreet.streetId}-${index}`}
//               id={`visited-source-${visitedStreet.streetId}-${index}`}
//               shape={{
//                 type: "Feature",
//                 properties: {
//                   visited: true,
//                 },
//                 geometry: {
//                   type: "LineString",
//                   coordinates: visitedStreet.coordinates,
//                 },
//               }}
//             >
//               <LineLayer
//                 id={`visited-layer-${visitedStreet.streetId}-${index}`}
//                 style={{
//                   lineColor: "#FFD700", // Gold color for visited streets
//                   lineWidth: 4,
//                   lineOpacity: 0.9,
//                 }}
//               />
//             </ShapeSource>
//           ))}

//           {/* Render current route */}
//           {currentRoute && currentRoute.coordinates.length > 1 && (
//             <ShapeSource
//               key="current-route"
//               id="current-route-source"
//               shape={{
//                 type: "Feature",
//                 properties: {
//                   current: true,
//                 },
//                 geometry: {
//                   type: "LineString",
//                   coordinates: currentRoute.coordinates,
//                 },
//               }}
//             >
//               <LineLayer
//                 id="current-route-layer"
//                 style={{
//                   lineColor: "#0066FF", // Blue color for current route
//                   lineWidth: 5,
//                   lineOpacity: 1,
//                   lineDasharray: [2, 2], // Dashed line for current route
//                 }}
//               />
//             </ShapeSource>
//           )}

//           {destinationCoords && (
//             <PointAnnotation
//               id="destinationPoint"
//               coordinate={destinationCoords}
//             >
//               <View style={styles.destinationIcon}>
//                 <Entypo name="location-pin" size={24} color="black" />
//               </View>
//             </PointAnnotation>
//           )}

//           <UserLocation
//             visible={true}
//             onUpdate={handleLocationUpdate}
//           />
//         </MapView>
//       </View>

//       {userCoords && (
//         <View style={styles.info}>
//           <Text>Lat: {userCoords.latitude}</Text>
//           <Text>Lng: {userCoords.longitude}</Text>
//           {currentStreetId && (
//             <Text>Current Street ID: {currentStreetId}</Text>
//           )}
//           <Text>Visited Streets: {visitedStreets.length}</Text>
//         </View>
//       )}

//       {/* Enhanced Legend */}
//       <View style={styles.legend}>
//         <Text style={styles.legendTitle}>Street Walking Legend</Text>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendLine, { backgroundColor: "#FF6B6B" }]} />
//           <Text style={styles.legendText}>more 800m</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendLine, { backgroundColor: "#4ECDC4" }]} />
//           <Text style={styles.legendText}>800m - 1.5km</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendLine, { backgroundColor: "#45B7D1" }]} />
//           <Text style={styles.legendText}>1.5km - 2km</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendLine, { backgroundColor: "#96CEB4" }]} />
//           <Text style={styles.legendText}>less 2km</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendLine, { backgroundColor: "#FFD700" }]} />
//           <Text style={styles.legendText}>Visited</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendLine, { backgroundColor: "#0066FF", borderStyle: 'dashed' }]} />
//           <Text style={styles.legendText}>Current Route</Text>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   mapContainer: { flex: 1 },
//   map: { flex: 1 },
//   info: {
//     position: "absolute",
//     bottom: 30,
//     left: 20,
//     right: 20,
//     backgroundColor: "white",
//     padding: 10,
//     borderRadius: 10,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   destinationIcon: {
//     width: 30,
//     height: 30,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   legend: {
//     position: "absolute",
//     top: 60,
//     right: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.9)",
//     padding: 12,
//     borderRadius: 8,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.22,
//     shadowRadius: 2.22,
//   },
//   legendTitle: {
//     fontSize: 12,
//     fontWeight: "bold",
//     marginBottom: 8,
//     color: "#333",
//   },
//   legendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   legendLine: {
//     width: 20,
//     height: 3,
//     marginRight: 8,
//     borderRadius: 1.5,
//   },
//   legendText: {
//     fontSize: 10,
//     color: "#666",
//   },
// });

// -- Visited Streets Table
// CREATE TABLE visited_streets (
//   id SERIAL PRIMARY KEY,
//   user_id INTEGER REFERENCES users(id),
//   street_id INTEGER,
//   coordinates JSONB,
//   visited_at TIMESTAMP,
//   is_completed BOOLEAN,
//   created_at TIMESTAMP DEFAULT NOW()
// );

// -- Current Routes Table
// CREATE TABLE current_routes (
//   id SERIAL PRIMARY KEY,
//   user_id INTEGER REFERENCES users(id),
//   street_id INTEGER,
//   coordinates JSONB,
//   start_time TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT NOW()
// );

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Alert, Text, Platform, PermissionsAndroid } from "react-native";
import Mapbox, { Camera, MapView, UserLocation } from "@rnmapbox/maps";
import * as turf from "@turf/turf";

// Set your Mapbox access token
const mapToken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
Mapbox.setAccessToken(mapToken!);

interface UserCoords {
  latitude: number;
  longitude: number;
}

interface Street {
  id: string;
  name: string;
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
  duration?: number; // Time spent on street in seconds
}

interface CurrentRoute {
  streetId: number;
  coordinates: number[][];
  startTime: string;
}

const ProductionStreetTrackingMap = () => {
  const [userLocation, setUserLocation] = useState<UserCoords | null>(null);
  const [highlightedStreets, setHighlightedStreets] = useState<string[]>([]);
  const [streetData, setStreetData] = useState<StreetData | null>(null);
  const [currentStreetId, setCurrentStreetId] = useState<string | null>(null);
  const [visitedStreets, setVisitedStreets] = useState<VisitedStreet[]>([]);
  const [isLoadingStreets, setIsLoadingStreets] = useState(false);
  
  const mapRef = useRef(null);
  const locationRef = useRef(null);
  const streetEntryTimeRef = useRef<number | null>(null);
  const lastLocationUpdateRef = useRef<number>(0);
  const [currentRoute, setCurrentRoute] = useState<CurrentRoute | null>(null);
  const [previousUserCoords, setPreviousUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);



// Add this function to request permissions
const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show your position on the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; // iOS permissions are handled differently
};

// Call this in useEffect
useEffect(() => {
  requestLocationPermission();
}, []);
  // Fetch street data from Mapbox around user location
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

      // Use Mapbox Tilesets API to get road data
      // Alternative: Use Overpass API for OpenStreetMap data
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
      
      // Convert Overpass data to GeoJSON format
      const features: Street[] = data.elements
        .filter((element: any) => element.type === 'way' && element.geometry)
        .map((way: any) => ({
          id: way.id.toString(),
          name: way.tags?.name || way.tags?.highway || `Street ${way.id}`,
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

  // // Handle user location updates
  // const handleLocationUpdate = useCallback((feature: any) => {
  //   console.log('Location update received:', feature);
    
  //   const now = Date.now();
    
  //   // Throttle location updates to avoid excessive API calls
  //   if (now - lastLocationUpdateRef.current < 2000) return; // 2 second throttle
  //   lastLocationUpdateRef.current = now;

  //   const { coordinates } = feature.geometry;
  //   const [longitude, latitude] = coordinates;
  //   const newCoords = { longitude, latitude };

  //   console.log('Setting user location:', newCoords);
  //   setUserLocation(newCoords);

  //   // Check if user is on any street
  //   checkStreetProximity(newCoords);

  //   // Fetch new street data if user moved significantly
  //   if (!streetData || shouldRefreshStreetData(newCoords)) {
  //     fetchStreetData(newCoords);
  //   }
  // }, [streetData, fetchStreetData]);

//   // Distance threshold for considering user "on street" (in meters)
  const STREET_PROXIMITY_THRESHOLD = 50;

  // Minimum movement distance to update route (in meters)
  const MIN_MOVEMENT_DISTANCE = 10;

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

  // Function to find the closest point on a line segment to a given point
  const closestPointOnLineSegment = (
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number
  ) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) return { x: x1, y: y1 };

    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));

    const xx = x1 + param * C;
    const yy = y1 + param * D;

    return { x: xx, y: yy };
  };

  // Function to check if user is on a specific street
  const isUserOnStreet = (userLat: number, userLon: number, streetCoordinates: number[][]): boolean => {
    for (let i = 0; i < streetCoordinates.length - 1; i++) {
      const [lon1, lat1] = streetCoordinates[i];
      const [lon2, lat2] = streetCoordinates[i + 1];

      const closest = closestPointOnLineSegment(userLon, userLat, lon1, lat1, lon2, lat2);
      const distance = calculateDistance(userLat, userLon, closest.y, closest.x);

      if (distance <= STREET_PROXIMITY_THRESHOLD) {
        return true;
      }
    }
    return false;
  };

  const handleLocationUpdate = (location: any) => {
    const { coords } = location;
    const newUserCoords = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    // Check if user has moved significantly
    if (previousUserCoords) {
      const movementDistance = calculateDistance(
        previousUserCoords.latitude,
        previousUserCoords.longitude,
        newUserCoords.latitude,
        newUserCoords.longitude
      );

      if (movementDistance < MIN_MOVEMENT_DISTANCE) {
        return; // Don't update if movement is too small
      }
    }

    setUserLocation(newUserCoords);

    // Check which street the user is currently on
    let foundStreetId: number | null = null;

    for (const street of sofiaStreets) {
      if (isUserOnStreet(newUserCoords.latitude, newUserCoords.longitude, street.coordinates)) {
        foundStreetId = street.id;
        break;
      }
    }

    // Handle street changes
    if (foundStreetId !== currentStreetId) {
      // User left previous street
      if (currentStreetId && currentRoute) {
        // Mark previous street as completed and save to visited streets
        const completedStreet: VisitedStreet = {
          streetId: currentRoute.streetId,
          coordinates: currentRoute.coordinates,
          visitedAt: currentRoute.startTime,
          isCompleted: true,
        };

        setVisitedStreets(prev => {
          const updated = [...prev, completedStreet];
          saveVisitedStreetToDB(completedStreet);
          return updated;
        });

        setCurrentRoute(null);
      }

      // User entered new street
      if (foundStreetId) {
        const newRoute: CurrentRoute = {
          streetId: foundStreetId,
          coordinates: [[newUserCoords.longitude, newUserCoords.latitude]],
          startTime: new Date().toISOString(),
        };

        setCurrentRoute(newRoute);
        saveCurrentRouteToDB(newRoute);
      }

      setCurrentStreetId(foundStreetId);
    } else if (foundStreetId && currentRoute) {
      // User is still on the same street, update route
      updateCurrentRoute(newUserCoords);
    }

    setPreviousUserCoords(newUserCoords);
  };

  // Check if we need to refresh street data based on user movement
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

  // Handle when user enters/exits a street
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
      const streetName = street?.properties?.name || street?.name || `Unknown Street ${newStreetId}`;
      
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

  // Save visited streets to database
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

  // Auto-save to database periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (visitedStreets.length > 0) {
        saveVisitedStreetsToDatabase();
      }
    }, 60000); // Save every minute

    return () => clearInterval(interval);
  }, [visitedStreets]);

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

  // Get current street name
  const getCurrentStreetName = (): string => {
    if (!currentStreetId || !streetData) return "Not on a street";
    
    const street = streetData.features.find(s => s.id === currentStreetId);
    return street?.properties?.name || street?.name || "Unknown Street";
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
                : [23.3219, 42.6977] // Sofia city center
            }
          />

  <UserLocation
  visible={true}
  onUpdate={(location) => {
    console.log('UserLocation onUpdate:', location);
    handleLocationUpdate(location);
  }}
  showsUserHeadingIndicator={false}
  animated={true}
/>

        {/* Render streets */}
        {streetData && (
          <Mapbox.ShapeSource id="streetsSource" shape={streetData}>
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
          </Mapbox.ShapeSource>
        )}
      </MapView>

      {/* Info panel */}
      <View style={styles.infoPanel}>
     
        
        {userLocation && (
          <>
            <Text style={styles.infoText}>
              Lat: {userLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.infoText}>
              Lng: {userLocation.longitude.toFixed(6)}
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
});

export default ProductionStreetTrackingMap;