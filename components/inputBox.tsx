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

    // <View className="px-4 mb-3 mt-8">
    //         <RowLayout className="bg-white rounded-2xl px-4 py-3 border border-gray-100">
    //           <AntDesign name="search1" size={20} color="#6B7280" />
    //           <TextInput
    //             placeholder="Search"
    //             placeholderTextColor="#9ca3af"
    //             className="flex-1 text-lg ml-3 text-textDark"
    //           />
    //         </RowLayout>
    //       </View>

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
        placeholderTextColor="#9CA3AF"
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
