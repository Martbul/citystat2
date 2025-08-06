import React, { useState } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type SliderProps = {
  minimumValue: number;
  maximumValue: number;
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void; // ✅ Added
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  disabled?: boolean;
};

const Slider: React.FC<SliderProps> = ({
  minimumValue,
  maximumValue,
  value,
  onValueChange,
  onSlidingComplete, // ✅ Added
  step = 1,
  minimumTrackTintColor = "#bddc62",
  maximumTrackTintColor = "#e0e0e0",
  thumbTintColor = "#bddc62",
  disabled = false,
}) => {
  const [sliderWidth, setSliderWidth] = useState<number>(0);

  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;

    const { locationX } = event.nativeEvent;
    const relative = locationX / sliderWidth;
    const newValue = minimumValue + relative * (maximumValue - minimumValue);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));

    onValueChange(clampedValue);

    if (onSlidingComplete) {
      onSlidingComplete(clampedValue); // ✅ Fire complete callback
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLayout={handleLayout}
      activeOpacity={1}
      disabled={disabled}
      style={[
        styles.container,
        disabled && { opacity: 0.5 },
      ]}
    >
      <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
        <View
          style={[
            styles.filledTrack,
            {
              width: `${percentage}%`,
              backgroundColor: minimumTrackTintColor,
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: `${percentage}%`,
              backgroundColor: thumbTintColor,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  filledTrack: {
    height: 4,
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 0,
  },
  thumb: {
    position: "absolute",
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
  },
});

export default Slider;
