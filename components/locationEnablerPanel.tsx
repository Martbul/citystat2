import React, { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface LocationEnablerPanelProps {
  requestLocationPermission: () => Promise<boolean>;
}

const LocationEnablerPanel = memo(({ requestLocationPermission }: LocationEnablerPanelProps) => {
  return (
    <View className="absolute top-12 left-2.5 right-2.5 bg-white/90 p-4 rounded-2xl shadow-lg">
      <View>
        <Text className="text-sm text-red-500 text-center font-bold">
          Location tracking is disabled
        </Text>
        <TouchableOpacity onPress={requestLocationPermission}>
          <Text className="text-sm text-blue-500 text-center mt-1 underline">
            Enable Location Tracking
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

LocationEnablerPanel.displayName = 'LocationEnablerPanel';

export default LocationEnablerPanel;