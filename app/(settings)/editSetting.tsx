import Header from "@/components/ui/header";
import { useUserData } from "@/Providers/UserDataProvider";
import { useLocalSearchParams } from "expo-router";
import { StatusBar, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditSetting() {
  const { data, header } = useLocalSearchParams();


  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title={header as string} />

      <View>
        <Text>{header}</Text>

        <TextInput className="w-full p-2 bg-gray-100">{data}</TextInput>
      </View>
    </SafeAreaView>
  );
}
