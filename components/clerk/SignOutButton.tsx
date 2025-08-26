import { useClerk } from "@clerk/clerk-expo";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CardTitle, ClickableCard, IconContainer, RowLayout, SectionSpacing } from "../dev";

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (err) {
      console.error("Sign out error", err);
      // Handle sign-out errors appropriately
    }
  };

  return (

       <SectionSpacing className="">
          <ClickableCard onPress={handleSignOut}>
            <RowLayout>
              <IconContainer color="red">
                 <FontAwesome name="sign-out" size={24} color="black" />
              </IconContainer>
              <CardTitle className="ml-4">Sign out</CardTitle>
            </RowLayout>
          </ClickableCard>
        </SectionSpacing>
  );
};
