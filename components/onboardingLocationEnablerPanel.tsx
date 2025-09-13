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
        <View className="w-[90%]">
          <TouchableOpacity
            onPress={handlePress}
            disabled={enabled}
            className={`rounded-2xl p-6 shadow-2xl ${
              enabled ? "bg-green-50 border-2 border-green-200" : "bg-white"
            }`}
          >
            {/* Header Section */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View className={`rounded-lg p-3 mr-3 ${
                  enabled ? "bg-green-100" : "bg-gray-200"
                }`}>
                  <MaterialIcons 
                    name="navigation" 
                    size={24} 
                    color={enabled ? "#22c55e" : "#c8f751"} 
                  />
                </View>
                <View>
                  <Text className="text-textDark text-lg font-bold">
                    Location Access
                  </Text>
                  <Text className="text-textGray text-sm">
                    Required for accurate stats
                  </Text>
                </View>
              </View>
              
              <View className={`px-3 py-1 rounded-full ${
                enabled ? "bg-green-100" : "bg-red-100"
              }`}>
                <Text
                  className={`text-sm font-semibold ${
                    enabled ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {enabled ? "ENABLED" : "DISABLED"}
                </Text>
              </View>
            </View>

            {/* Main Action Area */}
            <View className={`rounded-xl p-4 border-2 border-dashed ${
              enabled 
                ? "border-green-300 bg-green-50" 
                : "border-gray-300 bg-gray-50"
            }`}>
              <View className="items-center">
                <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                  enabled ? "bg-green-100" : "bg-accent/20"
                }`}>
                  <Ionicons 
                    name={enabled ? "checkmark" : "location"} 
                    size={32} 
                    color={enabled ? "#22c55e" : "#c8f751"} 
                  />
                </View>
                
                <Text className={`text-center text-lg font-semibold mb-2 ${
                  enabled ? "text-green-700" : "text-textDark"
                }`}>
                  {enabled ? "Location Access Granted!" : "Enable Location Tracking"}
                </Text>
                
                <Text className={`text-center text-sm ${
                  enabled ? "text-green-600" : "text-textGray"
                }`}>
                  {enabled 
                    ? "You're all set! We can now provide accurate location-based stats."
                    : "Tap anywhere on this card to allow location access and get personalized city insights."
                  }
                </Text>

                {!enabled && (
                  <View className="flex-row items-center mt-4 bg-white px-4 py-2 rounded-full shadow-sm">
                    <MaterialIcons name="tap-and-play" size={16} color="#c8f751" />
                    <Text className="text-textDark text-xs font-medium ml-2">
                      Tap to Enable
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Benefits Section */}
            {!enabled && (
              <View className="mt-4 space-y-2">
                <Text className="text-textGray text-xs font-medium uppercase tracking-wide">
                  What you'll get:
                </Text>
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 bg-accent rounded-full mr-3" />
                  <Text className="text-textGray text-sm">
                    Personalized city-specific recommendations
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 bg-accent rounded-full mr-3" />
                  <Text className="text-textGray text-sm">
                    Local weather and activity suggestions
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 bg-accent rounded-full mr-3" />
                  <Text className="text-textGray text-sm">
                    Better health insights for your area
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

OnboardingLocationEnablerPanel.displayName = "LocationEnablerPanel";
export default OnboardingLocationEnablerPanel;