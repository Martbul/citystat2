import React, { useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";

const Spinner = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
      style={{ transform: [{ rotate: spin }] }}
    />
  );
};

export default Spinner;
