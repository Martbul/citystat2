import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { TailwindProvider } from "tailwindcss-react-native";
import { SideMenuDrawerProvider } from "@/Providers/SideMenuDrawerProvider";
import { UserDataProvider } from "@/Providers/UserDataProvider";
import "react-native-reanimated";

import "../global.css";
import ErrorBoundary from "@/components/errorBoundary";


export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ErrorBoundary>
 <ClerkProvider tokenCache={tokenCache}>
      <UserDataProvider>
        <TailwindProvider>
          <SideMenuDrawerProvider>
                <Stack>
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
                    name="(tutorial)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
          </SideMenuDrawerProvider>
        </TailwindProvider>
      </UserDataProvider>
    </ClerkProvider>
    </ErrorBoundary>
   
  );
}
