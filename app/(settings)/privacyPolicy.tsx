import Header from "@/components/ui/header";
import { View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />

      <Header title="CityStat Privacy Policy" />
      <ScrollView className="bg-lightSurface px-4 py-6">
        <View className="flex flex-row items-center justify-evenly">
             <Text className="text-lightPrimaryText">Effective: April 15, 2024</Text> 
             <Text className="text-lightPrimaryText">Last Updated: March 15, 2024</Text>
        </View>
    
     <View></View>
      </ScrollView>
    </SafeAreaView>
  );
}
