import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function TutorialRoutesLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen
          name="tutorial"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
