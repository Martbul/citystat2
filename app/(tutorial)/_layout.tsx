import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="tutorial" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
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
