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
      <Stack.Screen
        name="friends"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="editNote"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="addFriends"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="addByUsername"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="userProfile"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
