import { Stack } from "expo-router";

export default function TutorialRoutesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="tutorial"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
