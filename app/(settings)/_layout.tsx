import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function SettingsRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={"/(auth)/sign-in"} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="acknowledgements"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="advanced"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="appearance"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="dataAndPrivacy"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="editProfile"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="language"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="support"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="whatsNew"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="account"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="contentAndSocial"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="devices"
        options={{
          headerShown: false,
        }}
      />

   <Stack.Screen
        name="connections"
        options={{
          headerShown: false,
        }}
      />
         <Stack.Screen
        name="accessibility"
        options={{
          headerShown: false,
        }}
      />

          <Stack.Screen
        name="notifications"
        options={{
          headerShown: false,
        }}
      />

      

      
    </Stack>
  );
}
