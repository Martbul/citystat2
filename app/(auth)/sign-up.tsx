import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { isClerkRuntimeError } from "@clerk/clerk-expo";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import InputBox from "@/components/inputBox";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<any>();

  //TODO: Hnadle errors

  const onSignUpPress = async () => {
    setErrors(undefined);

    if (!isLoaded) return;

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      if (isClerkRuntimeError(err)) {
        setErrors(err.message);
      }
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tutorial)/tutorial");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 p-8 justify-center bg-lightBackground">
        <Text className="mb-3 text-3xl justify-center text-center text-lightBlackText mb-6 text-2xl font-bold">
          Verify your email
        </Text>

        <InputBox
          val={code}
          valSetFunc={setCode}
          placeholderTest="Verification code"
        />

        <TouchableOpacity
          onPress={onVerifyPress}
          className="flex justify-center items-center bg-lightPrimaryAccent py-3 rounded-lg"
        >
          <Text className="text-lg font-medium text-lightBlackText">
            Verify
          </Text>
        </TouchableOpacity>
        {/* <GoogleOneTap /> */}
      </View>
    );
  }

  return (
    <View className="flex-1 p-8 justify-center bg-lightBackground ">
      <Text className="mb-3 text-3xl justify-center text-center text-lightBlackText  mb-6  text-2xl font-bold">
        Create your account
      </Text>

      <View className="flex gap-2">
        <InputBox
          val={emailAddress}
          valSetFunc={setEmailAddress}
          placeholderTest="Email"
        />

        <InputBox
          val={password}
          valSetFunc={setPassword}
          placeholderTest="Password"
        />
      </View>
      {errors &&
        errors.map((error: any, index: number) => (
          <Text key={index}>{error.longMessage}</Text>
        ))}

      <TouchableOpacity
        onPress={onSignUpPress}
        className="bg-lightPrimaryAccent py-4 rounded-lg flex items-center justify-center mt-3"
      >
        <Text className="text-base font-semibold text-lightBlackText">
          Continue
        </Text>
      </TouchableOpacity>

      <View className="flex flex-row justify-center items-center mt-6">
        <Text className="font-sm ">Already have an account?</Text>
        <Link href="/sign-in">
          <Text className="font-sm text-lightPrimaryAccent"> Sign in</Text>
        </Link>
      </View>
    </View>
  );
}
