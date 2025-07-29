import React from "react";
import { TextInput, View, StyleSheet, TouchableOpacity } from "react-native";

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
    <View style={styles.container}>
      {props.icon && <View style={styles.iconWrapper}>{props.icon}</View>}

      <TextInput
        value={props.val}
        placeholder={props.placeholderTest}
        onChangeText={props.valSetFunc}
        placeholderTextColor="#aaa"
        style={styles.input}
        secureTextEntry={props.secureTextEntry}
      />

      {props.icon2 && (
        <TouchableOpacity
          onPress={props.icon2PressFunc}
          style={styles.icon2Wrapper}
        >
          {props.icon2}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  iconWrapper: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  icon2Wrapper: {
    marginLeft: 8,
  },
});
