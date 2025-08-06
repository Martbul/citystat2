import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavingLoader() {
  return (
    <SafeAreaView className="flex-1 bg-lightBackground justify-center items-center">
      <ActivityIndicator size="large" color="#bddc62" />
      <Text className="mt-2 text-lightPrimaryAccent">Saving...</Text>
    </SafeAreaView>
  );
}
