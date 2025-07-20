import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function TutorialRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/(tabs)'} />
  }

  

  return (<Stack >
        <Stack.Screen 
        name="tutorial" 
        options={{ 
          headerShown: false 
        }} 
      />
  </Stack>)
}
