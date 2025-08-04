import { Entypo, Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";

export default function InformativeToggle(props: {
  heading: string;
  description?: string;
  toggleFunc: () => void;
}) {
  const [toggled, setToggled] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.timing(rotation, {
      toValue: toggled ? 0 : 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    setToggled(!toggled);
    props.toggleFunc();
  };

  const rotateY = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View className="mx-3 my-2">
      <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <View className="bg-lightSurface rounded-3xl">
          <View className="py-4 px-4">
            <View className="flex-row items-center justify-between">
              <View className="flex w-3/4">
                <Text className="text-lightBlackText text-base">
                  {props.heading}
                </Text>
                {props.description && (
                  <Text className="text-lightPrimaryText text-sm mt-2">
                    {props.description}
                  </Text>
                )}
              </View>

              <TouchableOpacity onPress={toggle} activeOpacity={0.8}>
                <Animated.View
                  style={{
                    transform: [{ rotateY }],
                  }}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    toggled ? "bg-lightPrimaryAccent" : "bg-lightBlackText"
                  } shadow-md`}
                >
                  {/* Icon gets flipped back with scaleX: -1 if needed */}
                  <View style={{ transform: [{ scaleX: toggled ? -1 : 1 }] }}>
                    {toggled ? (
                      <Entypo name="check" size={24} color="black" />
                    ) : (
                      <Feather name="x" size={24} color="white" />
                    )}
                  </View>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
