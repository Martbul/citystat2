import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { TailwindProvider } from "tailwindcss-react-native";
import { UserDataProvider } from "@/Providers/UserDataProvider";
import "react-native-reanimated";

import "../global.css";
import ErrorBoundary from "@/components/errorBoundary";
import { StatusBar } from "react-native";
import { LocationTrackingProvider } from "@/Providers/LocationTrackingProvider";
import { DrawerProvider } from "@/Providers/MenuDrawerProvider";


export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  
  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ErrorBoundary>
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={clerkPublishableKey}
      >
        <UserDataProvider>
          <LocationTrackingProvider>
            <TailwindProvider>
              <DrawerProvider>
                <Stack>
                   <Stack.Screen
                    name="(onboarding)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(screens)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(settings)"
                    options={{ headerShown: false }}
                  />
                   
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar />
              </DrawerProvider>
            </TailwindProvider>
          </LocationTrackingProvider>
        </UserDataProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
