import { Text, TouchableOpacity, View } from "react-native";

export default function TabSelector(props: {
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
  tabOne: string;
  tabTwo: string;
}) {
  return (
    <View className="flex-row justify-evenly mt-3 ">
      <TouchableOpacity
        onPress={() => props.setTab(props.tabOne)}
        className={`px-14 py-2 rounded-full  ${
          props.tab === props.tabOne
            ? "bg-lightSecondaryAccent"
            : "bg-lightSurface border border-lightMutedText"
        }`}
      >
        <Text
          className={`font-anybodyBold ${
            props.tab === props.tabOne ? "text-darkText" : "text-muted"
          }`}
        >
          {props.tabOne}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => props.setTab(props.tabTwo)}
        className={`px-14 py-2 rounded-full ${
          props.tab === props.tabTwo
            ? "bg-lightSecondaryAccent"
            : "bg-lightSurface border border-lightMutedText"
        }`}
      >
        <Text
          className={`font-anybodyBold ${
            props.tab === props.tabTwo ? "text-darkText" : "text-muted"
          }`}
        >
          {props.tabTwo}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
