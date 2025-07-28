import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import InputBox from "@/components/inputBox";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  //TODO: hanler error state

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="flex-1 p-8 justify-center bg-lightBackground ">
      <Text className="mb-3 text-3xl justify-center text-center text-lightBlackText mb-6 text-2xl font-bold">
        Sign in
      </Text>
      <View className="flex gap-2">
        <InputBox
          val={emailAddress}
          valSetFunc={(emailAddress) => setEmailAddress(emailAddress)}
          placeholderTest="Email"
        />

        <InputBox
          val={password}
          valSetFunc={(password) => setPassword(password)}
          placeholderTest="Password"
        />
      </View>

      <TouchableOpacity
        onPress={onSignInPress}
        className="bg-lightPrimaryAccent py-4 rounded-lg flex items-center justify-center mt-3"
      >
        <Text className="text-base font-semibold text-lightBlackText">
          Continue
        </Text>
      </TouchableOpacity>
      <View className="flex flex-row justify-center items-center mt-6">
        <Text className="font-sm ">Don't have an account?</Text>
        <Link href="/sign-up">
          <Text className="font-sm text-lightPrimaryAccent"> Sign up</Text>
        </Link>
      </View>
    </View>
  );
}
