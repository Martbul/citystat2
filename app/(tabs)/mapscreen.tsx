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

import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert } from "react-native";
import Mapbox from "@rnmapbox/maps";
import * as turf from "@turf/turf"; // For geospatial calculations

// Set your Mapbox access token
Mapbox.setAccessToken("YOUR_MAPBOX_ACCESS_TOKEN");

const StreetTrackingMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [highlightedStreets, setHighlightedStreets] = useState([]);
  const [streetData, setStreetData] = useState(null);
  const mapRef = useRef(null);
  const locationRef = useRef(null);

  // Sample street data - in real app, fetch from Mapbox or your API
  const sampleStreets = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "street_1",
        properties: {
          name: "Main Street",
          highlighted: false,
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-122.4194, 37.7749], // San Francisco coordinates example
            [-122.4094, 37.7849],
            [-122.4, 37.795],
          ],
        },
      },
      // Add more streets here
    ],
  };

  useEffect(() => {
    setStreetData(sampleStreets);
  }, []);

  // Handle user location updates
  const handleLocationUpdate = (feature) => {
    const { coordinates } = feature.geometry;
    const [longitude, latitude] = coordinates;

    setUserLocation({ longitude, latitude });

    // Check if user is on any street
    checkStreetProximity({ longitude, latitude });
  };

  // Check if user is near/on a street
  const checkStreetProximity = (userCoords) => {
    if (!streetData) return;

    const userPoint = turf.point([userCoords.longitude, userCoords.latitude]);
    const proximityThreshold = 0.01; // ~10 meters in km

    streetData.features.forEach((street) => {
      const streetLine = turf.lineString(street.geometry.coordinates);
      const distance = turf.pointToLineDistance(userPoint, streetLine, {
        units: "kilometers",
      });

      if (distance <= proximityThreshold) {
        // User is on this street
        highlightStreet(street.id);
      } else {
        // User is not on this street
        unhighlightStreet(street.id);
      }
    });
  };

  // Highlight a street
  const highlightStreet = (streetId) => {
    setHighlightedStreets((prev) => {
      if (!prev.includes(streetId)) {
        console.log(`User entered street: ${streetId}`);
        return [...prev, streetId];
      }
      return prev;
    });
  };

  // Remove highlight from a street
  const unhighlightStreet = (streetId) => {
    setHighlightedStreets((prev) => {
      const filtered = prev.filter((id) => id !== streetId);
      if (filtered.length !== prev.length) {
        console.log(`User left street: ${streetId}`);
      }
      return filtered;
    });
  };

  // Generate street style based on highlight status
  const getStreetStyle = (streetId) => {
    const isHighlighted = highlightedStreets.includes(streetId);
    return {
      lineColor: isHighlighted ? "#FF0000" : "#0000FF", // Red when highlighted, blue otherwise
      lineWidth: isHighlighted ? 8 : 4,
      lineOpacity: isHighlighted ? 1 : 0.7,
    };
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        onDidFinishLoadingMap={() => console.log("Map loaded")}
      >
        {/* Camera to follow user */}
        <Mapbox.Camera
          followUserLocation={true}
          followUserMode="normal"
          zoomLevel={16}
        />

        {/* User location tracking */}
        <Mapbox.UserLocation
          ref={locationRef}
          visible={true}
          onUpdate={handleLocationUpdate}
          showsUserHeadingIndicator={true}
        />

        {/* Render streets */}
        {streetData && (
          <Mapbox.ShapeSource id="streetsSource" shape={streetData}>
            {streetData.features.map((street) => (
              <Mapbox.LineLayer
                key={street.id}
                id={`street_layer_${street.id}`}
                filter={["==", ["get", "id"], street.id]}
                style={{
                  ...getStreetStyle(street.id),
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            ))}
          </Mapbox.ShapeSource>
        )}

        {/* User location marker */}
        {userLocation && (
          <Mapbox.PointAnnotation
            id="userLocation"
            coordinate={[userLocation.longitude, userLocation.latitude]}
          >
            <View style={styles.userMarker} />
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>
    </View>
  );
};

// Alternative approach using Mapbox Geofencing API (if available)
const GeofencingApproach = () => {
  const [geofences, setGeofences] = useState([]);

  // Create geofences for streets
  const createStreetGeofences = (streets) => {
    const streetGeofences = streets.map((street) => {
      // Create a buffer around the street line
      const buffered = turf.buffer(
        turf.lineString(street.geometry.coordinates),
        0.01,
        {
          units: "kilometers",
        }
      );

      return {
        id: street.id,
        geometry: buffered.geometry,
        properties: street.properties,
      };
    });

    setGeofences(streetGeofences);
  };

  // Handle geofence enter/exit events
  const handleGeofenceEvent = (event) => {
    const { type, geofenceId } = event;

    if (type === "enter") {
      console.log(`Entered street geofence: ${geofenceId}`);
      // Highlight street
    } else if (type === "exit") {
      console.log(`Exited street geofence: ${geofenceId}`);
      // Remove highlight
    }
  };

  return null; // Implementation depends on geofencing SDK availability
};

// Enhanced version with real-time street data fetching
const EnhancedStreetTracking = () => {
  // Fetch street data from Mapbox Vector Tiles or Streets API
  const fetchStreetData = async (bounds) => {
    try {
      // Example using Mapbox Vector Tiles API
      const response = await fetch(
        `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.mvt?access_token=YOUR_TOKEN`
      );
      // Process vector tile data
      // This requires additional processing libraries
    } catch (error) {
      console.error("Error fetching street data:", error);
    }
  };

  // Alternative: Use Mapbox Isochrone API to get road network
  const fetchRoadNetwork = async (center) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/isochrone/v1/mapbox/driving/${center.longitude},${center.latitude}?contours_minutes=1&access_token=YOUR_TOKEN`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching road network:", error);
    }
  };

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    borderWidth: 3,
    borderColor: "white",
  },
});

export default StreetTrackingMap;