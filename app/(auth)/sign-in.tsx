import { Text, TouchableOpacity, View } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import InputBox from "@/components/inputBox";
import Feather from "@expo/vector-icons/Feather";
import { FontAwesome } from "@expo/vector-icons";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any[]>([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onEmailChange = (val: string) => {
    setEmailAddress(val);
    setErrors((prev) => prev.filter((e) => e.paramName !== "identifier"));
  };

  const onPasswordChange = (val: string) => {
    setPassword(val);
    setErrors((prev) => prev.filter((e) => e.paramName !== "password"));
  };

  const onSignInPress = async () => {
    setErrors([]);
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
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      if (err?.errors && Array.isArray(err.errors)) {
        const formattedErrors = err.errors.map((e: any) => ({
          ...e,
          longMessage: e.longMessage || e.message || "An error occurred.",
          paramName: e.meta?.paramName || e.paramName,
        }));
        setErrors(formattedErrors);
      } else {
        setErrors([
          {
            longMessage:
              err?.message || "Something went wrong. Please try again.",
          },
        ]);
      }
    }
  };

  const emailErrors = errors?.filter((e) => e.paramName === "identifier");
  const passwordErrors = errors?.filter((e) => e.paramName === "password");
  const generalErrors = errors?.filter(
    (e) =>
      !e.paramName ||
      (e.paramName !== "identifier" && e.paramName !== "password")
  );

  const toggleShowPassword = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View className="flex-1 p-8 justify-center bg-lightBackground">
      <Text className="mb-6 text-2xl font-bold text-center text-lightBlackText">
        Sign in
      </Text>

      <View className="flex gap-2">
        <InputBox
          val={emailAddress}
          valSetFunc={onEmailChange}
          placeholderTest="Email"
          icon={<Feather name="mail" size={20} color="black" />}
        />
        {emailErrors?.map((error, index) => (
          <Text key={`email-${index}`} className="text-red-500 text-sm">
            {error.longMessage || error.message}
          </Text>
        ))}

        <InputBox
          val={password}
          valSetFunc={onPasswordChange}
          placeholderTest="Password"
          icon={<Feather name="lock" size={24} color="black" />}
          icon2={
            isPasswordVisible ? (
              <FontAwesome name="eye-slash" size={24} color="black" />
            ) : (
              <FontAwesome name="eye" size={24} color="black" />
            )
          }
          icon2PressFunc={toggleShowPassword}
          secureTextEntry={!isPasswordVisible}
        />

        {passwordErrors?.map((error, index) => (
          <Text key={`pass-${index}`} className="text-red-500 text-sm">
            {error.longMessage || error.message}
          </Text>
        ))}
      </View>

      {generalErrors?.map((error, index) => (
        <Text key={`gen-${index}`} className="text-red-500 text-sm mt-1">
          {error.longMessage || error.message}
        </Text>
      ))}

      <TouchableOpacity
        onPress={onSignInPress}
        className="bg-lightPrimaryAccent py-4 rounded-lg flex items-center justify-center mt-3"
      >
        <Text className="text-base font-semibold text-lightBlackText">
          Continue
        </Text>
      </TouchableOpacity>

      <View className="flex flex-row justify-center items-center mt-6">
        <Text className="text-sm text-lightBlackText">
          Don't have an account?
        </Text>
        <Link href="/sign-up">
          <Text className="text-sm text-lightPrimaryAccent"> Sign up</Text>
        </Link>
      </View>
    </View>
  );
}
