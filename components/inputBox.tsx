import React from "react";
import { TextInput, View, TouchableOpacity } from "react-native";

export default function InputBox(props: {
  val: any;
  valSetFunc: React.Dispatch<React.SetStateAction<any>>;
  placeholderTest: string;
  icon?: React.ReactNode;
  icon2?: React.ReactNode;
  icon2PressFunc?: () => void;
  secureTextEntry?: boolean;
}) {
  return (
    <View className="flex flex-row items-center bg-white rounded-3xl px-4 py-3 border border-gray-200 shadow-sm">
      {props.icon && (
        <View className="flex items-center justify-center mr-1 ">
          {props.icon}
        </View>
      )}

      <TextInput
        value={props.val}
        placeholder={props.placeholderTest}
        onChangeText={props.valSetFunc}
        placeholderTextColor="#9CA3AF" // text-gray-400
        className="flex-1 text-base text-textBlack"
        secureTextEntry={props.secureTextEntry}
      />

      {props.icon2 && (
        <TouchableOpacity
          onPress={props.icon2PressFunc}
          className="ml-3 flex items-center justify-center"
          activeOpacity={0.7}
        >
          {props.icon2}
        </TouchableOpacity>
      )}
    </View>
  );
}
