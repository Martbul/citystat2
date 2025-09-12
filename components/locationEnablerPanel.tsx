import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface LocationEnablerPanelProps {
  requestLocationPermission: () => Promise<boolean>;
}

const LocationEnablerPanel = memo(
  ({ requestLocationPermission }: LocationEnablerPanelProps) => {
    return (
      <View className="absolute inset-0 bg-black/30 justify-center items-center z-50">
        <View className="w-[90%] max-h-[80%]">
          <View className="bg-gray-800 rounded-2xl p-5 shadow-2xl">
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center">
                <View className="bg-white/10 rounded-lg p-1.5 mr-2">
                  <MaterialIcons name="navigation" size={20} color="#c8f751" />
                </View>
                <View>
                  <Text className="text-white text-base font-bold">
                    Location Access
                  </Text>
                  <Text className="text-gray-300 text-xs">
                    Enable to start exploration
                  </Text>
                </View>
              </View>
              <Text className="text-lime-300 text-lg font-semibold">
                DISABLED
              </Text>
            </View>

            <TouchableOpacity
              onPress={requestLocationPermission}
              className="flex flex-row justify-center items-center bg-white/5 border border-white/10 rounded-xl p-3 mb-3"
            >
              <View className="flex-row items-center gap-1">
                <Ionicons name="location" size={20} color="#c8f751" />
                <View className="flex flex-row items-center justify-center ">
                  <Text className="text-white text-sm font-medium">
                    Enable Location Tracking
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
);

LocationEnablerPanel.displayName = "LocationEnablerPanel";

export default LocationEnablerPanel;
