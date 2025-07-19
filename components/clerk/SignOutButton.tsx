// app/components/SignOutButton.tsx
import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Optional: Redirect to a sign-in page or another route
      router.replace('/sign-in') // Example redirect
    } catch (err) {
      console.error('Sign out error', err)
      // Handle sign-out errors appropriately
    }
  }

  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Text>Sign out</Text>
    </TouchableOpacity>
  )
}