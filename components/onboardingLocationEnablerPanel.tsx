import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface LocationEnablerPanelProps {
  requestLocationPermission: () => Promise<void>;
}

const OnboardingLocationEnablerPanel = memo(
  ({ requestLocationPermission }: LocationEnablerPanelProps) => {
    const [enabled, setEnabled] = useState(false);

    const handlePress = async () => {
      await requestLocationPermission();
      setEnabled(true); 
    };

    return (
      <View className="flex justify-center items-center my-6">
        <View className="w-[90%] max-h-[80%] ">
          <View className="bg-white rounded-2xl p-5 shadow-2xl ">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="bg-gray-200 rounded-lg p-3 mr-2">
                  <MaterialIcons name="navigation" size={20} color="#c8f751" />
                </View>
                <View>
                  <Text className="text-textDark text-base font-bold">
                    Location Access
                  </Text>
                </View>
              </View>

              <Text
                className={`text-lg font-semibold ${
                  enabled ? "text-accent" : "text-lime-300"
                }`}
              >
                {enabled ? "ENABLED" : "DISABLED"}
              </Text>
            </View>

            {!enabled && (
              <TouchableOpacity
                onPress={handlePress}
                className="flex flex-row justify-center items-center bg-gray-100 border border-white/10 rounded-xl p-3 mb-3"
              >
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location" size={20} color="#c8f751" />
                  <View className="flex flex-row items-center justify-center ">
                    <Text className="text-textDark text-sm font-medium">
                      Enable Location Tracking
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }
);

OnboardingLocationEnablerPanel.displayName = "LocationEnablerPanel";

export default OnboardingLocationEnablerPanel;
