import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Loader(props: { purpose: "saving" | "loading" }) {
  return (
    <SafeAreaView className="flex-1 bg-lightBackground justify-center items-center">
      {props.purpose === "saving" && (
        <>
          <ActivityIndicator size="large" color="#bddc62" />
          <Text className="mt-2 text-lightPrimaryAccent">Saving...</Text>
        </>
      )}

      {props.purpose === "loading" && (
        <>
          <ActivityIndicator size="large" color="#bddc62" />
          <Text className="mt-2 text-lightPrimaryAccent">Loading...</Text>
        </>
      )}
    </SafeAreaView>
  );
}
