import { useUser } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function OnboardingLayout() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    router.replace("/(tabs)");
  }
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
