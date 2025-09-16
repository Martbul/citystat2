import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useAuth, useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import InputBox from "@/components/inputBox";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useUserData } from "@/Providers/UserDataProvider";
import { UserDetailsUpdateReq } from "@/types/user";
import { apiService } from "@/services/api";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<any[]>([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { getToken } = useAuth();

  const { onboardingUserDetails } = useLocalSearchParams();

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
        console.log("successful signup");

        const onboardingDetailsObject: UserDetailsUpdateReq = Array.isArray(
          onboardingUserDetails
        )
          ? typeof onboardingUserDetails[0] === "string"
            ? JSON.parse(onboardingUserDetails[0])
            : onboardingUserDetails[0]
          : typeof onboardingUserDetails === "string"
            ? JSON.parse(onboardingUserDetails)
            : onboardingUserDetails;

        console.log(
          "Setting pending onboarding data:",
          onboardingDetailsObject
        );

        // Use the user ID from the sign up attempt
        const userId = signUpAttempt.createdUserId;
        console.log("Using user ID from signup:", userId);

        // Retry logic for API call
        const maxRetries = 3;
        const retryDelay = 1000; // 1 second

        const attemptApiCall = async (attempt: number): Promise<boolean> => {
          try {
            console.log(
              `Attempt ${attempt}/${maxRetries} to update user details`
            );

            const token = await getToken();
            if (!token) {
              console.log(`No token available on attempt ${attempt}`);
              return false;
            }

            if (!userId) {
              console.log(`No user ID available on attempt ${attempt}`);
              return false;
            }

            await apiService.updateUserDetails(onboardingDetailsObject, token);
            console.log("User details updated successfully");
            return true;
          } catch (error) {
            console.error(`API call failed on attempt ${attempt}:`, error);
            return false;
          }
        };

        // Try the API call with retries
        let success = false;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          success = await attemptApiCall(attempt);

          if (success) {
            break;
          }

          // Wait before next attempt (except for the last attempt)
          if (attempt < maxRetries) {
            console.log(`Waiting ${retryDelay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }

        if (!success) {
          console.error("Failed to update user details after all retries");
          // You could set pending data as fallback here
          // setPendingOnboardingUpdate(onboardingDetailsObject);
        }

        // Navigate regardless of API success since server processes in background
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("❌ Verification error:", JSON.stringify(err, null, 2));
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: 32,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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

            {errors?.map((error, index) => (
              <Text
                key={`error-${index}`}
                className="text-red-500 text-sm mt-1"
              >
                {error.longMessage || error.message}
              </Text>
            ))}

            <TouchableOpacity
              onPress={onVerifyPress}
              className="flex justify-center items-center bg-accent py-3 rounded-lg mt-4"
            >
              <Text className="text-lg font-medium text-lightBlackText">
                Verify
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const toggleShowPassword = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
            className="bg-accent py-4 rounded-lg flex items-center justify-center mt-3"
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
              <Text className="text-sm text-accent"> Sign in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
