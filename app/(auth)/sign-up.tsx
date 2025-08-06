import { Text, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import InputBox from "@/components/inputBox";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<any[]>([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onEmailChange = (val: string) => {
    setEmailAddress(val);
    setErrors((prev) => prev.filter((e) => e.paramName !== "email_address"));
  };

  const onPasswordChange = (val: string) => {
    setPassword(val);
    setErrors((prev) => prev.filter((e) => e.paramName !== "password"));
  };

  const onSignUpPress = async () => {
    setErrors([]);

    if (!isLoaded) return;

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
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
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setErrors([{ longMessage: "Invalid verification code or other error." }]);
    }
  };

  const emailErrors = errors?.filter((e) => e.paramName === "email_address");
  const passwordErrors = errors?.filter((e) => e.paramName === "password");
  const generalErrors = errors?.filter(
    (e) =>
      !e.paramName ||
      (e.paramName !== "email_address" && e.paramName !== "password")
  );

  if (pendingVerification) {
    return (
      <SafeAreaView>
        <View className="flex-1 p-8 justify-center bg-lightBackground">
          <Text className="mb-6 text-2xl font-bold text-center text-lightBlackText">
            Verify your email
          </Text>

          <InputBox
            val={code}
            valSetFunc={setCode}
            placeholderTest="Verification code"
            icon={
              <MaterialIcons name="verified-user" size={24} color="black" />
            }
          />

          <TouchableOpacity
            onPress={onVerifyPress}
            className="flex justify-center items-center bg-lightPrimaryAccent py-3 rounded-lg mt-4"
          >
            <Text className="text-lg font-medium text-lightBlackText">
              Verify
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleShowPassword = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <SafeAreaView>
      <View className="flex-1 p-8 justify-center bg-lightBackground">
        <Text className="mb-6 text-2xl font-bold text-center text-lightBlackText">
          Create your account
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
          onPress={onSignUpPress}
          className="bg-lightPrimaryAccent py-4 rounded-lg flex items-center justify-center mt-3"
        >
          <Text className="text-base font-semibold text-lightBlackText">
            Continue
          </Text>
        </TouchableOpacity>

        <View className="flex flex-row justify-center items-center mt-6">
          <Text className="text-sm text-lightBlackText">
            Already have an account?
          </Text>
          <Link href="/sign-in">
            <Text className="text-sm text-lightPrimaryAccent"> Sign in</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
