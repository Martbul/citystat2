import { Entypo } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";

export default function InputEditor(props: {
  data: string;
  className?: string;
  clearDataFunc: () => void;
  setDataFunc: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <View
      className={
        props.className ||
        "flex flex-row bg-lightSurface items-center justify-between px-5 rounded-lg mx-4 my-1"
      }
    >
      <TextInput
        className="flex flex-row flex-1 text-lightPrimaryText"
        value={props.data}
        onChangeText={props.setDataFunc} // Changed from onChange to onChangeText
      />
      <TouchableOpacity onPress={() => props.clearDataFunc()}>
        <Entypo name="circle-with-cross" size={24} color="#bddc62" />
      </TouchableOpacity>
    </View>
  );
}
