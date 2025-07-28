import { TextInput } from "react-native";

export default function InputBox(props: {
  val: any;
  valSetFunc: React.Dispatch<React.SetStateAction<any>>;
  placeholderTest: string;
}) {
  return (
    <TextInput
      value={props.val}
      placeholder={props.placeholderTest}
      onChangeText={props.valSetFunc}
      placeholderTextColor="#aaa"
      style={{
        backgroundColor: "#fff",
        paddingLeft: 48,
        paddingRight: 16,
        paddingVertical: 12,
        borderRadius: 8,
        fontWeight: "400",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#d4d4d4",
        color: "#000",
      }}
    />
  );
}
