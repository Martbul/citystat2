import {
  AntDesign,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState, memo, useCallback } from "react";
import { GestureResponderEvent, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from "./spinner";
import { StreetData } from "@/types/world";
import { useUserData } from "@/Providers/UserDataProvider";

type StatusIndicatorProps = {
  isActive: "Active" | "Inactive";
};

type MapTrackingPanelProps = {
  isLocationSubscrActive: "Active" | "Inactive";
  currentStreetId: string | null;
  streetData: StreetData | null;
  sessionCountVisitedStreets: number;
  allCountVisitedStreets: number;
  onClose: () => void;
};

const MapTrackingPanel = memo(({ 
  isLocationSubscrActive, 
  currentStreetId, 
  streetData, 
  sessionCountVisitedStreets,
  allCountVisitedStreets,
  onClose 
}: MapTrackingPanelProps) => {
   const {
      fetchVisitedStreets,
      // isLoading,
    } = useUserData();
  const [totalVisited] = useState(156);
  const [currentStreet, setCurrentStreet] = useState("Unknown Street");
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentStreetName = useCallback((currentStreetId: string | null, streetData: StreetData | null): string => {
    if (!currentStreetId || !streetData) return "Not on a street";

    const street = streetData.features.find((s) => s.id === currentStreetId);
    return street?.properties?.name || "Unknown Street";
  }, []);

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
  }, [fetchLocation, getCurrentStreetName, currentStreetId, streetData,fetchVisitedStreets]);
  



  const handleOverlayPress = useCallback(() => {
    onClose();
  }, [onClose]);

  const handlePanelPress = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation();
  }, []);

  const StatCard = memo(({
    title,
    value,
    subtitle,
    icon,
    trend,
  }: {
    title: string;
    value: number;
    subtitle: string;
    icon: any;
    trend: any;
  }) => (
    <View className="bg-white/90 rounded-xl p-3 flex-1 mx-1 shadow">
      <View className="flex-row justify-between items-start mb-2">
        <View className="bg-lime-300 rounded-lg p-1.5 shadow">{icon}</View>
        {trend && (
          <View className="flex-row items-center">
            <View className="w-1 h-1 bg-lime-300 rounded-full mr-1" />
            <Text className="text-lime-300 text-[10px] font-semibold">
              +{trend}%
            </Text>
          </View>
        )}
      </View>
      <View>
        <Text className="text-xl font-bold text-gray-900 mb-0.5">{value}</Text>
        <Text className="text-[10px] font-semibold tracking-wide text-gray-500 mb-0.5">
          {title.toUpperCase()}
        </Text>
        <Text className="text-xs text-gray-600">{subtitle}</Text>
      </View>
    </View>
  ));

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
            <Text className="text-lime-300 text-lg font-semibold">
              LIVE
            </Text>
          </View>

          <View className="flex-row justify-between mb-5">
            <StatCard
              title="Distance"
              value={847.3}
              subtitle="km total"
              trend="12"
              icon={<FontAwesome5 name="walking" size={16} color="#1F2937" />}
            />
            <StatCard
              title="Coverage"
              value={23.7}
              subtitle="of Sofia"
              trend="5"
              icon={<MaterialIcons name="explore" size={16} color="#1F2937" />}
            />
            <StatCard
              title="Days Active"
              value={156}
              subtitle="in 2025"
              trend="8"
              icon={<AntDesign name="calendar" size={16} color="#1F2937" />}
            />
          </View>

          <View className="flex flex-row justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
          
            <View className="flex-row items-center">
              <Ionicons name="location" size={14} color="#c8f751" />
              <View className="ml-1.5">
                <Text className="text-gray-400 text-xs">Current location:</Text>
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
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-xl font-bold text-lime-300 mb-0.5">
                  {sessionCountVisitedStreets}
                </Text>
                <Text className="text-[10px] text-gray-400 font-semibold tracking-wide">
                  SESSION STREETS
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xl font-bold text-lime-300 mb-0.5">
                  {allCountVisitedStreets}
                </Text>
                <Text className="text-[10px] text-gray-400 font-semibold tracking-wide">
                  TOTAL STREETS
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

MapTrackingPanel.displayName = 'MapTrackingPanel';

export default MapTrackingPanel;