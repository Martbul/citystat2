import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function screensRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={"/(auth)/sign-in"} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: false,
        }}
      />

         <Stack.Screen
        name="martketplace"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
