import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { RelativePathString, useRouter } from "expo-router";

export default function PrimaryButton(props: {
  heading: string;
  icon?: React.ReactNode;
  routingPath?: RelativePathString;
  onPressAction?: () => void;
}) {
  const router = useRouter();

  const handlePress = () => {
    if (props.routingPath) {
      router.push(props.routingPath);
    } else if (props.onPressAction) {
      props.onPressAction();
    }
  };

  return (
    <View>
      <TouchableOpacity
        className="w-full bg-lightPrimaryAccent mt-6 py-3 rounded-lg flex flex-row items-center justify-center gap-2 font-semibold"
        onPress={handlePress}
      >
        {props.icon && props.icon}
        <Text className="text-lightPrimaryText font-semibold">
          {props.heading}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
