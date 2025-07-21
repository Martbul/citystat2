import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, SafeAreaView, Text } from "react-native";
import Mapbox, { Camera, LineLayer, MapView, PointAnnotation, ShapeSource, UserLocation } from "@rnmapbox/maps";
import Entypo from '@expo/vector-icons/Entypo';

// Mock data for 20 streets in Sofia, Bulgaria
const sofiaStreets = [
  {
    id: 1,
    name: "Vitosha Boulevard",
    distance: 1200,
    walkedAt: "2024-01-15",
    coordinates: [
      [23.3219, 42.6977],
      [23.3225, 42.6965],
      [23.3230, 42.6952],
      [23.3235, 42.6940],
      [23.3240, 42.6928]
    ]
  },
  {
    id: 2,
    name: "Graf Ignatiev Street",
    distance: 800,
    walkedAt: "2024-01-16",
    coordinates: [
      [23.3245, 42.6975],
      [23.3255, 42.6968],
      [23.3265, 42.6960],
      [23.3275, 42.6953]
    ]
  },
  {
    id: 3,
    name: "Hristo Belchev Street",
    distance: 650,
    walkedAt: "2024-01-17",
    coordinates: [
      [23.3180, 42.6990],
      [23.3190, 42.6985],
      [23.3200, 42.6980],
      [23.3210, 42.6975]
    ]
  },
  {
    id: 4,
    name: "Patriarch Evtimiy Boulevard",
    distance: 1500,
    walkedAt: "2024-01-18",
    coordinates: [
      [23.3150, 42.6960],
      [23.3165, 42.6955],
      [23.3180, 42.6950],
      [23.3195, 42.6945],
      [23.3210, 42.6940]
    ]
  },
  {
    id: 5,
    name: "Tsar Osvoboditel Boulevard",
    distance: 2000,
    walkedAt: "2024-01-19",
    coordinates: [
      [23.3280, 42.6970],
      [23.3300, 42.6975],
      [23.3320, 42.6980],
      [23.3340, 42.6985],
      [23.3360, 42.6990]
    ]
  },
  {
    id: 6,
    name: "Maria Luiza Boulevard",
    distance: 1800,
    walkedAt: "2024-01-20",
    coordinates: [
      [23.3100, 42.7000],
      [23.3120, 42.7005],
      [23.3140, 42.7010],
      [23.3160, 42.7015],
      [23.3180, 42.7020]
    ]
  },
  {
    id: 7,
    name: "Georgi S. Rakovski Street",
    distance: 900,
    walkedAt: "2024-01-21",
    coordinates: [
      [23.3250, 42.6950],
      [23.3260, 42.6955],
      [23.3270, 42.6960],
      [23.3280, 42.6965]
    ]
  },
  {
    id: 8,
    name: "Vasil Levski Boulevard",
    distance: 2200,
    walkedAt: "2024-01-22",
    coordinates: [
      [23.3200, 42.7030],
      [23.3220, 42.7025],
      [23.3240, 42.7020],
      [23.3260, 42.7015],
      [23.3280, 42.7010],
      [23.3300, 42.7005]
    ]
  },
  {
    id: 9,
    name: "Ivan Vazov Street",
    distance: 700,
    walkedAt: "2024-01-23",
    coordinates: [
      [23.3290, 42.6940],
      [23.3300, 42.6945],
      [23.3310, 42.6950],
      [23.3320, 42.6955]
    ]
  },
  {
    id: 10,
    name: "Knyaz Boris I Street",
    distance: 1100,
    walkedAt: "2024-01-24",
    coordinates: [
      [23.3120, 42.6920],
      [23.3135, 42.6925],
      [23.3150, 42.6930],
      [23.3165, 42.6935],
      [23.3180, 42.6940]
    ]
  },
  {
    id: 11,
    name: "Han Asparuh Street",
    distance: 850,
    walkedAt: "2024-01-25",
    coordinates: [
      [23.3350, 42.6920],
      [23.3360, 42.6925],
      [23.3370, 42.6930],
      [23.3380, 42.6935]
    ]
  },
  {
    id: 12,
    name: "Stamboliyski Boulevard",
    distance: 2500,
    walkedAt: "2024-01-26",
    coordinates: [
      [23.3050, 42.6980],
      [23.3080, 42.6975],
      [23.3110, 42.6970],
      [23.3140, 42.6965],
      [23.3170, 42.6960],
      [23.3200, 42.6955]
    ]
  },
  {
    id: 13,
    name: "Slivnitsa Boulevard",
    distance: 1600,
    walkedAt: "2024-01-27",
    coordinates: [
      [23.3100, 42.7050],
      [23.3125, 42.7045],
      [23.3150, 42.7040],
      [23.3175, 42.7035],
      [23.3200, 42.7030]
    ]
  },
  {
    id: 14,
    name: "Todor Alexandrov Boulevard",
    distance: 1900,
    walkedAt: "2024-01-28",
    coordinates: [
      [23.3400, 42.6950],
      [23.3420, 42.6955],
      [23.3440, 42.6960],
      [23.3460, 42.6965],
      [23.3480, 42.6970]
    ]
  },
  {
    id: 15,
    name: "Cherni Vrah Boulevard",
    distance: 1300,
    walkedAt: "2024-01-29",
    coordinates: [
      [23.3180, 42.6890],
      [23.3195, 42.6895],
      [23.3210, 42.6900],
      [23.3225, 42.6905],
      [23.3240, 42.6910]
    ]
  },
  {
    id: 16,
    name: "Gen. Gurko Street",
    distance: 750,
    walkedAt: "2024-01-30",
    coordinates: [
      [23.3260, 42.7000],
      [23.3270, 42.7005],
      [23.3280, 42.7010],
      [23.3290, 42.7015]
    ]
  },
  {
    id: 17,
    name: "Pico Boulevard",
    distance: 950,
    walkedAt: "2024-01-31",
    coordinates: [
      [23.3080, 42.6900],
      [23.3095, 42.6905],
      [23.3110, 42.6910],
      [23.3125, 42.6915]
    ]
  },
  {
    id: 18,
    name: "Ivan Shishman Street",
    distance: 680,
    walkedAt: "2024-02-01",
    coordinates: [
      [23.3320, 42.6900],
      [23.3330, 42.6905],
      [23.3340, 42.6910],
      [23.3350, 42.6915]
    ]
  },
  {
    id: 19,
    name: "Hristo Smirnenski Boulevard",
    distance: 1400,
    walkedAt: "2024-02-02",
    coordinates: [
      [23.3450, 42.6900],
      [23.3465, 42.6905],
      [23.3480, 42.6910],
      [23.3495, 42.6915],
      [23.3510, 42.6920]
    ]
  },
  {
    id: 20,
    name: "Bulgaria Boulevard",
    distance: 3000,
    walkedAt: "2024-02-03",
    coordinates: [
      [23.3000, 42.6800],
      [23.3050, 42.6820],
      [23.3100, 42.6840],
      [23.3150, 42.6860],
      [23.3200, 42.6880],
      [23.3250, 42.6900],
      [23.3300, 42.6920]
    ]
  }
];

interface MapboxMap {
  on: (event: string, layerIdOrCallback: string | Function, callback?: Function) => void;
  remove: () => void;
  addSource: (id: string, source: any) => void;
  addLayer: (layer: any) => void;
  setPaintProperty: (layerId: string, property: string, value: any) => void;
  getCanvas: () => HTMLCanvasElement;
}

interface MapboxGL {
  accessToken: string;
  Map: new (options: any) => MapboxMap;
  Marker: new (options?: any) => any;
  Popup: new (options?: any) => any;
}

const mapToken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
Mapbox.setAccessToken(mapToken!);

export default function MapsScreen() {
  // Sofia city center coordinates
  const [coords, setCoords] = useState<[number, number]>([23.3219, 42.6977]);
  const [destinationCoords, setDestinationCoords] = useState<[number, number]>([
    23.3219, 42.6977,
  ]);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Function to get line color based on distance walked
  const getLineColor = (distance: number) => {
    if (distance < 800) return "#FF6B6B"; // Red for short walks
    if (distance < 1500) return "#4ECDC4"; // Teal for medium walks
    if (distance < 2000) return "#45B7D1"; // Blue for long walks
    return "#96CEB4"; // Green for very long walks
  };

  // Function to get line width based on distance
  const getLineWidth = (distance: number) => {
    if (distance < 800) return 2;
    if (distance < 1500) return 3;
    if (distance < 2000) return 4;
    return 5;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          zoomEnabled
          rotateEnabled
        >
          <Camera
            zoomLevel={13}
            centerCoordinate={
              userCoords
                ? [userCoords.longitude, userCoords.latitude]
                : [23.3219, 42.6977] // Sofia city center
            }
          />
          
          {/* Render all Sofia streets */}
          {sofiaStreets.map((street) => (
            <ShapeSource
              key={`street-${street.id}`}
              id={`street-source-${street.id}`}
              shape={{
                type: "Feature",
                properties: {
                  name: street.name,
                  distance: street.distance,
                  walkedAt: street.walkedAt,
                },
                geometry: {
                  type: "LineString",
                  coordinates: street.coordinates,
                },
              }}
            >
              <LineLayer
                id={`street-layer-${street.id}`}
                style={{
                  lineColor: getLineColor(street.distance),
                  lineWidth: getLineWidth(street.distance),
                  lineOpacity: 0.8,
                }}
              />
            </ShapeSource>
          ))}

          {destinationCoords && (
            <PointAnnotation
              id="destinationPoint"
              coordinate={destinationCoords}
            >
              <View style={styles.destinationIcon}>
                <Entypo name="location-pin" size={24} color="black" />
              </View>
            </PointAnnotation>
          )}
          
          <UserLocation
            visible={true}
            onUpdate={(location) => {
              const { coords } = location;
              setUserCoords({
                latitude: coords.latitude,
                longitude: coords.longitude,
              });
            }}
          />
        </MapView>
      </View>
      
      {userCoords && (
        <View style={styles.info}>
          <Text>Lat: {userCoords.latitude}</Text>
          <Text>Lng: {userCoords.longitude}</Text>
        </View>
      )}
      
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Street Walking Legend</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: "#FF6B6B" }]} />
          <Text style={styles.legendText}>800m</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: "#4ECDC4" }]} />
          <Text style={styles.legendText}>800m - 1.5km</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: "#45B7D1" }]} />
          <Text style={styles.legendText}>1.5km - 2km</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: "#96CEB4" }]} />
          <Text style={styles.legendText}> 2km</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  info: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  destinationIcon: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  legend: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  legendLine: {
    width: 20,
    height: 3,
    marginRight: 8,
    borderRadius: 1.5,
  },
  legendText: {
    fontSize: 10,
    color: "#666",
  },
});


// import React, { useEffect, useRef, useState } from "react";
// import { StyleSheet, View, SafeAreaView, Text } from "react-native";
// import Mapbox,{Camera, LineLayer, MapView, PointAnnotation, ShapeSource, UserLocation } from "@rnmapbox/maps";
// import { mockedStrrets } from "@/mockData/mocks";
// import Entypo from '@expo/vector-icons/Entypo';
// interface MapboxMap {
//   on: (event: string, layerIdOrCallback: string | Function, callback?: Function) => void;
//   remove: () => void;
//   addSource: (id: string, source: any) => void;
//   addLayer: (layer: any) => void;
//   setPaintProperty: (layerId: string, property: string, value: any) => void;
//   getCanvas: () => HTMLCanvasElement;
// }

// interface MapboxGL {
//   accessToken: string;
//   Map: new (options: any) => MapboxMap;
//   Marker: new (options?: any) => any;
//   Popup: new (options?: any) => any;
// }

// const mapToken = process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN;
// Mapbox.setAccessToken(mapToken!);

// export default function MapsScreen() {
//   const [coords, setCoords] = useState<[number, number]>([12.48839, 50.72724]);
//  const [destinationCoords, setDestinationCoords] = useState<[number, number]>([
//    12.48839, 50.72724,
//  ]);
//  const [routeDirections, setRouteDirections] = useState<[number, number]>([
//    12.58839, 50.82724,
//  ]);



//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<MapboxMap | null>(null);
//   const [userCoords, setUserCoords] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);


//   useEffect(() => {
//     mockedStrrets.forEach((street, index) => {
//       if (!map.current) return;

//       const sourceId = `walked-street-${street.id}`;
//       const layerId = `walked-street-layer-${street.id}`;

//       // Add source
//       map.current.addSource(sourceId, {
//         type: "geojson",
//         data: {
//           type: "Feature",
//           properties: {
//             name: street.name,
//             distance: street.distance,
//             walkedAt: street.walkedAt,
//           },
//           geometry: {
//             type: "LineString",
//             coordinates: street.coordinates,
//           },
//         },
//       });

//     }
// ) }, []);

//     //TODO: Fetch user waked streets from the database and display them on the map


//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.mapContainer}>
//           <MapView
//             style={styles.map}
//             styleURL={Mapbox.StyleURL.Street}
//             zoomEnabled
//             rotateEnabled
//           >
//             <Camera
//               zoomLevel={11}
//               centerCoordinate={
//                 userCoords
//                   ? [userCoords.longitude, userCoords.latitude]
//                   : [-122.4194, 37.7749]
//               }
//             />
//             {routeDirections && (
//               // <ShapeSource id="line1" shape={routeDirections}>
//               <ShapeSource id="line1">
//                 <LineLayer
//                   id="routerLine01"
//                   style={{
//                     lineColor: "#FA9E14",
//                     lineWidth: 4,
//                   }}
//                 />
//               </ShapeSource>
//             )}
//             {destinationCoords && (
//               <PointAnnotation
//                 id="destinationPoint"
//                 coordinate={destinationCoords}
//               >
//                 <View style={styles.destinationIcon}>
//                   <Entypo name="location-pin" size={24} color="black" />
//                 </View>
//               </PointAnnotation>
//             )}
//             <UserLocation
//               visible={true}
//               onUpdate={(location) => {
//                 const { coords } = location;
//                 setUserCoords({
//                   latitude: coords.latitude,
//                   longitude: coords.longitude,
//                 });
//               }}
//             />
//           </MapView>
//         </View>
//         {userCoords && (
//           <View style={styles.info}>
//             <Text>Lat: {userCoords.latitude}</Text>
//             <Text>Lng: {userCoords.longitude}</Text>
//           </View>
//         )}
//       </SafeAreaView>
//     );
//   }


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
//   },
//   destinationIcon: {
//     width: 30,
//     height: 30,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
