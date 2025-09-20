import {
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState, memo, useCallback } from "react";
import {
  GestureResponderEvent,
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
    streetsByTimeSpent = [],
    onClose,
  }: MapTrackingPanelProps) => {
    const {
      fetchVisitedStreets,
    } = useUserData();
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
          setIsLoading(false);
          return;
        }

        console.log("=== MAP MENU DEBUG INFO ===");
        console.log("mostVisitedStreets length:", mostVisitedStreets.length);
        console.log("streetsByTimeSpent length:", streetsByTimeSpent.length);
        console.log("currentStreetId:", currentStreetId);
        console.log("sessionCountVisitedStreets:", sessionCountVisitedStreets);
        console.log("allCountVisitedStreets:", allCountVisitedStreets);

        const pos = await Location.getCurrentPositionAsync({});
        const geo = await Location.reverseGeocodeAsync(pos.coords);
        const place = geo[0];
        const readable =
          [place.city].filter(Boolean).join(", ") || "Unknown Location";
        setLocation(readable);
      } catch (err) {
        console.error("Error fetching location:", err);
        setLocation("Location unavailable");
      } finally {
        setIsLoading(false);
      }
    }, [mostVisitedStreets.length, streetsByTimeSpent.length, currentStreetId, sessionCountVisitedStreets, allCountVisitedStreets]);

    useEffect(() => {
      fetchLocation();
      const currStreetName = getCurrentStreetName(currentStreetId, streetData);
      setCurrentStreet(currStreetName);
      
      console.log("=== MAP MENU STATE UPDATE ===");
      console.log("Current street name:", currStreetName);
      console.log("Session streets:", sessionCountVisitedStreets);
      console.log("Total streets:", allCountVisitedStreets);
      
    }, [
      fetchLocation,
      getCurrentStreetName,
      currentStreetId,
      streetData,
      fetchVisitedStreets,
      sessionCountVisitedStreets,
      allCountVisitedStreets
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
                    {mostVisitedStreets.length > 0 && (
                  <View className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <Text className="text-gray-400 text-xs mb-2 font-semibold tracking-wide">
                      MOST VISITED STREETS
                    </Text>
                    {mostVisitedStreets.slice(0, 3).map(({ streetId, visitData }) => {
                      const street = streetData?.features.find(
                        (f) => f.id === streetId
                      );
                      const streetName =
                        street?.properties?.name || `Street ${streetId}`;

                      return (
                        <View
                          key={streetId}
                          className="flex flex-row justify-between items-center py-1"
                        >
                          <Text
                            numberOfLines={1}
                            className="text-white text-sm flex-1 mr-2"
                          >
                            {streetName}
                          </Text>
                          <Text className="text-lime-300 text-sm font-bold">
                            {visitData.visitCount}x
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {streetsByTimeSpent.length > 0 && (
                  <View className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <Text className="text-gray-400 text-xs mb-2 font-semibold tracking-wide">
                      MOST TIME SPENT
                    </Text>
                    {streetsByTimeSpent.slice(0, 3).map(({ streetId, visitData }: { streetId: string }) => {
                      console.log("-----------------+ ", visitData)
                      const street = streetData?.features.find(
                        (f) => f.id === streetId
                      );
                      const streetName =
                        street?.properties?.name || `Street ${streetId}`;
                      const timeInMinutes = Math.floor(visitData.totalTimeSpent / 60);

                      return (
                        <View
                          key={streetId}
                          className="flex flex-row justify-between items-center py-1"
                        >
                          <Text
                            numberOfLines={1}
                            className="text-white text-sm flex-1 mr-2"
                          >
                            {streetName}
                          </Text>
                          <Text className="text-lime-300 text-sm font-bold">
                            {timeInMinutes}m
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Show message if no data available */}
                {mostVisitedStreets.length === 0 && streetsByTimeSpent.length === 0 && (
                  <View className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <Text className="text-gray-400 text-sm text-center">
                      Start exploring to see your street statistics!
                    </Text>
                  </View>
                )}

                 <View className="flex-row justify-around border-t border-white/10 pt-3">
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