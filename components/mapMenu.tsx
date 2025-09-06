import {
  AntDesign,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState, memo, useCallback } from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from "./spinner";
import { MapTrackingPanelProps, StreetData } from "@/types/world";
import { useUserData } from "@/Providers/UserDataProvider";

type StatusIndicatorProps = {
  isActive: "Active" | "Inactive";
};

const MapTrackingPanel = memo(
  ({
    isLocationSubscrActive,
    currentStreetId,
    streetData,
    sessionCountVisitedStreets,
    allCountVisitedStreets,
    mostVisitedStreets = [],
    currentStreetVisitData,
    streetsByTimeSpent,
    onClose,
  }: MapTrackingPanelProps) => {
    const {
      fetchVisitedStreets,
      // isLoading,
    } = useUserData();
    const [totalVisited] = useState(156);
    const [currentStreet, setCurrentStreet] = useState("Unknown Street");
    const [location, setLocation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getCurrentStreetName = useCallback(
      (
        currentStreetId: string | null,
        streetData: StreetData | null
      ): string => {
        if (!currentStreetId || !streetData) return "Not on a street";

        const street = streetData.features.find(
          (s) => s.id === currentStreetId
        );
        return street?.properties?.name || "Unknown Street";
      },
      []
    );

    const fetchLocation = useCallback(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocation("Permission denied");
          return;
        }

        const pos = await Location.getCurrentPositionAsync({});
        const geo = await Location.reverseGeocodeAsync(pos.coords);
        const place = geo[0];
        const readable =
          [place.city].filter(Boolean).join(", ") || "Unknown Location";
        setLocation(readable);
      } catch (err) {
        setLocation("Location unavailable");
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchLocation();
      const currStreetName = getCurrentStreetName(currentStreetId, streetData);
      setCurrentStreet(currStreetName);
      console.log("zzzzzzzzz "+allCountVisitedStreets)
    }, [
      fetchLocation,
      getCurrentStreetName,
      currentStreetId,
      streetData,
      fetchVisitedStreets,
    ]);

    const handleOverlayPress = useCallback(() => {
      onClose();
    }, [onClose]);

    const handlePanelPress = useCallback((e: GestureResponderEvent) => {
      e.stopPropagation();
    }, []);

    const StatusIndicator = memo(({ isActive }: StatusIndicatorProps) => (
      <View className="flex-row items-center mb-2">
        <View
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            isActive === "Active" ? "bg-lime-300" : "bg-gray-400"
          }`}
        />
        <Text
          className={`text-xs font-medium ${
            isActive === "Active" ? "text-lime-300" : "text-gray-500"
          }`}
        >
          Tracking: {isActive}
        </Text>
      </View>
    ));

    if (isLoading) {
      return (
        <SafeAreaView className="absolute inset-0 bg-black/40 justify-center items-center z-50">
          <View className="bg-gray-900 px-6 py-6 rounded-2xl items-center space-y-3 shadow-lg">
            <Spinner />
            <Text className="text-gray-400 text-lg">Loading menu...</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <TouchableOpacity
        className="absolute inset-0 bg-black/30 justify-center items-center z-50"
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <TouchableOpacity
          className="w-[90%] max-h-[80%]"
          activeOpacity={1}
          onPress={handlePanelPress}
        >
          <View className="bg-gray-800 rounded-2xl p-5 shadow-2xl">
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center">
                <View className="bg-white/10 rounded-lg p-1.5 mr-2">
                  <MaterialIcons name="navigation" size={20} color="#c8f751" />
                </View>
                <View>
                  <Text className="text-white text-base font-bold">
                    Tracking Stats
                  </Text>
                  <Text className="text-gray-300 text-xs">
                    {location} exploration
                  </Text>
                </View>
              </View>
              <Text className="text-accent text-lg font-semibold">LIVE</Text>
            </View>

            <View className="flex flex-row justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
              <View className="flex-row items-center">
                <Ionicons name="location" size={14} color="#c8f751" />
                <View className="ml-1.5">
                  <Text className="text-gray-400 text-xs">
                    Current location:
                  </Text>
                  <Text className="text-white text-sm font-medium">
                    {currentStreet}
                  </Text>
                </View>
              </View>
              <View>
                <StatusIndicator isActive={isLocationSubscrActive} />
              </View>
            </View>

            <View className="border-t border-white/10 pt-3">
              <View className="flex gap-4">
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <Text className="text-xl font-bold text-accent mb-0.5">
                      {sessionCountVisitedStreets}
                    </Text>
                    <Text className="text-[10px] text-gray-400 font-semibold tracking-wide">
                      SESSION STREETS
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-xl font-bold text-accent mb-0.5">
                      {allCountVisitedStreets}
                    </Text>
                    <Text className="text-[10px] text-gray-400 font-semibold tracking-wide">
                      TOTAL STREETS
                    </Text>
                  </View>
                </View>

                {mostVisitedStreets.length > 0 && (
                  <View className="items-center">
                    <Text className="text-xl font-bold text-lime-300 mb-0.5">
                      {mostVisitedStreets
                        .slice(0, 3)
                        .map(({ streetId, visitData }) => {
                          const street = streetData?.features.find(
                            (f) => f.id === streetId
                          );
                          const streetName =
                            street?.properties?.name || `Street ${streetId}`;

                          return (
                            <View
                              key={streetId}
                              className="flex flex-row gap-4"
                            >
                              <Text
                                numberOfLines={1}
                                className="text-xl font-bold text-accent mb-0.5"
                              >
                                {streetName}
                              </Text>
                              <Text className="text-xl font-bold text-accent mb-0.5">
                                x{visitData.visitCount}
                              </Text>
                            </View>
                          );
                        })}
                    </Text>
                    <Text className="text-[10px] text-gray-400 font-semibold tracking-wide">
                      MOST VISITED
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
);

MapTrackingPanel.displayName = "MapTrackingPanel";

export default MapTrackingPanel;

//  const MapTrackingPanel: React.FC<MapTrackingPanelProps> = ({
//   isLocationSubscrActive,
//   currentStreetId,
//   streetData,
//   sessionCountVisitedStreets,
//   allCountVisitedStreets,
//   mostVisitedStreets = [],
//   currentStreetVisitData,
//   onClose,
// }) => {
//   return (
//     <View style={styles.panel}>
//       {/* Your existing panel content */}
//       <View style={styles.statsContainer}>
//         <Text style={styles.title}>Street Tracking Stats</Text>

//         <View style={styles.statRow}>
//           <Text style={styles.label}>Status:</Text>
//           <Text style={styles.value}>{isLocationSubscrActive}</Text>
//         </View>

//         <View style={styles.statRow}>
//           <Text style={styles.label}>Session Streets:</Text>
//           <Text style={styles.value}>{sessionCountVisitedStreets}</Text>
//         </View>

//         <View style={styles.statRow}>
//           <Text style={styles.label}>Total Streets:</Text>
//           <Text style={styles.value}>{allCountVisitedStreets}</Text>
//         </View>

//         {/* Current street visit info */}
//         {currentStreetVisitData && (
//           <View style={styles.currentStreetInfo}>
//             <Text style={styles.sectionTitle}>Current Street</Text>
//             <Text style={styles.visitInfo}>
//               Visit #{currentStreetVisitData.visitCount}
//             </Text>
//             <Text style={styles.visitInfo}>
//               Avg: {Math.floor(currentStreetVisitData.averageTimeSpent / 60)}min
//             </Text>
//             <Text style={styles.visitInfo}>
//               Total: {Math.floor(currentStreetVisitData.totalTimeSpent / 60)}min
//             </Text>
//           </View>
//         )}

//         {/* Most visited streets */}
//         {mostVisitedStreets.length > 0 && (
//           <View style={styles.statsSection}>
//             <Text style={styles.sectionTitle}>Most Visited</Text>
//             {mostVisitedStreets.slice(0, 3).map(({ streetId, visitData }) => {
//               const street = streetData?.features.find(
//                 (f) => f.id === streetId
//               );
//               const streetName =
//                 street?.properties?.name || `Street ${streetId}`;

//               return (
//                 <View key={streetId} style={styles.statItem}>
//                   <Text style={styles.statStreetName} numberOfLines={1}>
//                     {streetName}
//                   </Text>
//                   <Text style={styles.statCount}>{visitData.visitCount}x</Text>
//                 </View>
//               );
//             })}
//           </View>
//         )}
//       </View>

//       <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//         <Text style={styles.closeButtonText}>Close</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };
// export default MapTrackingPanel;
// const styles = StyleSheet.create({
//   panel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "white",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     maxHeight: "50%",
//   },
//   statsContainer: {
//     flex: 1,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   statRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   label: {
//     fontSize: 14,
//     color: "#666",
//   },
//   value: {
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   currentStreetInfo: {
//     marginTop: 15,
//     padding: 10,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 8,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   visitInfo: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 2,
//   },
//   statsSection: {
//     marginTop: 15,
//   },
//   statItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     marginBottom: 4,
//     backgroundColor: "#f8f8f8",
//     borderRadius: 4,
//   },
//   statStreetName: {
//     fontSize: 12,
//     flex: 1,
//     marginRight: 8,
//   },
//   statCount: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: "#8B00FF",
//   },
//   closeButton: {
//     backgroundColor: "#c8f751",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 15,
//   },
//   closeButtonText: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });
