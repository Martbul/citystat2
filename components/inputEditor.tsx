import { AntDesign, Entypo } from "@expo/vector-icons";
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
      {!props.data && (
      <AntDesign name="search1" size={20} color="#6B7280" />

      )}

      <TextInput
        className="flex flex-row flex-1 text-lightPrimaryText"
        value={props.data}
        onChangeText={props.setDataFunc}
      />
      <TouchableOpacity onPress={() => props.clearDataFunc()}>
        <Entypo name="circle-with-cross" size={24} color="#bddc62" />
      </TouchableOpacity>
    </View>
  );
}

{
  /* <RowLayout className="bg-white rounded-2xl px-4 py-3 border border-gray-100">
              <AntDesign name="search1" size={20} color="#6B7280" />
              <TextInput
                placeholder="Search"
                placeholderTextColor="#9ca3af"
                className="flex-1 text-lg ml-3 text-textDark"
              />
            </RowLayout> */
}
