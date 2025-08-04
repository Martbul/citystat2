import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Panel(props: {
  route?: any;
  pressFunc?: () => void;
  label: string;
  icon?: React.ReactNode;
  seconLabel?: string;
  border?: boolean;
  borderColor?: string;
  openPopup?: any;
}) {
  const router = useRouter();

  const borderClasses = props.border
    ? `border ${props.borderColor ?? "border-gray-300"}`
    : "";

  const handlePress = () => {
    if (props.pressFunc) {
      props.pressFunc();
    } else if (props.route) {
      router.push(props.route);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-center justify-between bg-lightSurface rounded-xl px-4 py-4 mb-2 ${borderClasses}`}
    >
      <View className="flex-row items-center space-x-4 gap-2">
        {props.icon}
        <Text className="text-lightBlackText text-base">{props.label}</Text>
      </View>
      <View className="flex flex-row items-center gap-1">
        <Text className="text-lightMutedText">{props.seconLabel}</Text>
        <AntDesign name="right" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );
}
