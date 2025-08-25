import { UserCoords } from "@/types/world";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface CenterCameraOnUserButtonProps {
  userLocation: UserCoords | null;
  centerOnUser: () => void;
}

const CenterCameraOnUserButton = memo(({ userLocation, centerOnUser }: CenterCameraOnUserButtonProps) => {
  // Memoize the computed values
  const isLocationAvailable = useMemo(() => !!userLocation, [userLocation]);
  
  const buttonStyle = useMemo(() => [
    styles.controlButton,
    isLocationAvailable ? styles.controlButtonActive : styles.controlButtonDisabled,
  ], [isLocationAvailable]);
  
  const iconColor = useMemo(() => 
    isLocationAvailable ? "#007AFF" : "#999", 
    [isLocationAvailable]
  );

  return (
    <View style={styles.mapControls}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={centerOnUser}
        disabled={!isLocationAvailable}
        activeOpacity={0.7}
      >
        <Ionicons
          name="locate"
          size={20}
          color={iconColor}
        />
      </TouchableOpacity>
    </View>
  );
});

// Set display name for debugging
CenterCameraOnUserButton.displayName = 'CenterCameraOnUserButton';

const styles = StyleSheet.create({
  mapControls: {
    position: "absolute",
    top: 120,
    right: 20,
    zIndex: 100,
  },
  controlButton: {
    backgroundColor: "white",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  controlButtonActive: {
    backgroundColor: "white",
  },
  controlButtonDisabled: {
    backgroundColor: "#F5F5F5",
  },
});

export default CenterCameraOnUserButton;