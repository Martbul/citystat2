import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import ErrorBoundary from "@/components/errorBoundary";

export default function RootLayout() {
  return (
     <ErrorBoundary>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="CityStat" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}


// import { Stack } from "expo-router";

// export default function TutorialRoutesLayout() {
//   return (
//     <Stack>
//       <Stack.Screen
//         name="tutorial"
//         options={{
//           headerShown: false,
//         }}
//       />
//     </Stack>
//   );
// }
