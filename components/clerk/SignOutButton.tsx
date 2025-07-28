// app/components/SignOutButton.tsx
import { useClerk } from "@clerk/clerk-expo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Optional: Redirect to a sign-in page or another route
      router.replace("/sign-in"); // Example redirect
    } catch (err) {
      console.error("Sign out error", err);
      // Handle sign-out errors appropriately
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className="flex-row items-center justify-between bg-red-600 rounded-xl px-4 py-4 mb-2"
    >
      <View className="flex flex-row gap-4">
        <FontAwesome name="sign-out" size={24} color="black" />
        <Text>Sign out</Text>
      </View>

      <AntDesign name="right" size={16} color="#999" />
    </TouchableOpacity>
  );
};
