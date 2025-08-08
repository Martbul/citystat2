import { Text, TouchableOpacity, View } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import InputBox from "@/components/inputBox";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<any[]>([]);
  const [pendingReset, setPendingReset] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccessful, setResetSuccessful] = useState(false);

  //TODO: After successfult password reset the user's image iss fucked up

  const onEmailChange = (val: string) => {
    setEmailAddress(val);
    setErrors((prev) => prev.filter((e) => e.paramName !== "email_address"));
  };

  const onCodeChange = (val: string) => {
    setCode(val);
    setErrors((prev) => prev.filter((e) => e.paramName !== "code"));
  };

  const onNewPasswordChange = (val: string) => {
    setNewPassword(val);
    setErrors((prev) => prev.filter((e) => e.paramName !== "new_password"));
  };

  // Step 1: Request password reset
  const onRequestResetPress = async () => {
    setErrors([]);
    setLoading(true);

    if (!isLoaded) {
      setLoading(false);
      return;
    }

    try {
      // Use Clerk's password reset flow
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setPendingReset(true);
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
            longMessage: err?.message || "Failed to send reset email. Please try again.",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete password reset
  const onResetPasswordPress = async () => {
    setErrors([]);
    setLoading(true);

    if (!isLoaded) {
      setLoading(false);
      return;
    }

    try {
      // Complete the password reset using Clerk's attemptFirstFactor
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        // Set the active session
        await setActive({ session: result.createdSessionId });
        setResetSuccessful(true);
        
        // Navigate to main app after showing success
        setTimeout(() => {
          router.replace("/(tabs)"); // Adjust this to your main app route
        }, 2000);
      } else {
        console.error(JSON.stringify(result, null, 2));
        setErrors([{ longMessage: "Password reset incomplete. Please try again." }]);
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
            longMessage: err?.message || "Failed to reset password. Please try again.",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const emailErrors = errors?.filter((e) => e.paramName === "email_address");
  const codeErrors = errors?.filter((e) => e.paramName === "code");
  const passwordErrors = errors?.filter((e) => e.paramName === "new_password");
  const generalErrors = errors?.filter(
    (e) =>
      !e.paramName ||
      !["email_address", "code", "new_password"].includes(e.paramName)
  );

  // Success screen
  if (resetSuccessful) {
    return (
      <SafeAreaView className="flex-1 p-8 justify-center bg-lightBackground">
        <View className="items-center">
          <MaterialIcons name="check-circle" size={80} color="green" />
          <Text className="mt-4 text-2xl font-bold text-center text-lightBlackText">
            Password Reset Successful!
          </Text>
          <Text className="mt-2 text-base text-center text-gray-600">
            Your password has been changed and you're now signed in.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Enter code and new password
  if (pendingReset) {
    return (
      <SafeAreaView className="flex-1 p-8 justify-center bg-lightBackground">
        <Text className="mb-2 text-2xl font-bold text-center text-lightBlackText">
          Enter Reset Code
        </Text>
        <Text className="mb-6 text-sm text-center text-gray-600">
          We've sent a reset code to {emailAddress}
        </Text>

        <View className="flex gap-2">
          <InputBox
            val={code}
            valSetFunc={onCodeChange}
            placeholderTest="Reset code"
            icon={<MaterialIcons name="verified-user" size={24} color="black" />}
          />
          {codeErrors?.map((error, index) => (
            <Text key={`code-${index}`} className="text-red-500 text-sm">
              {error.longMessage || error.message}
            </Text>
          ))}

          <InputBox
            val={newPassword}
            valSetFunc={onNewPasswordChange}
            placeholderTest="New Password"
            icon={<Feather name="lock" size={24} color="black" />}
            icon2={
              isPasswordVisible ? (
                <FontAwesome name="eye-slash" size={24} color="black" />
              ) : (
                <FontAwesome name="eye" size={24} color="black" />
              )
            }
            icon2PressFunc={() => setIsPasswordVisible(prev => !prev)}
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
          onPress={onResetPasswordPress}
          disabled={loading}
          className={`py-4 rounded-lg flex items-center justify-center mt-3 ${
            loading ? "bg-gray-400" : "bg-lightPrimaryAccent"
          }`}
        >
          <Text className="text-base font-semibold text-lightBlackText">
            {loading ? "Resetting..." : "Reset Password"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPendingReset(false)}
          className="py-3 rounded-lg flex items-center justify-center mt-2 border border-lightPrimaryAccent"
        >
          <Text className="text-base font-medium text-lightPrimaryAccent">
            Back to Email
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Step 1: Enter email address
  return (
    <SafeAreaView className="flex-1 p-8 justify-center bg-lightBackground">
      <Text className="mb-2 text-2xl font-bold text-center text-lightBlackText">
        Reset Password
      </Text>
      <Text className="mb-6 text-sm text-center text-gray-600">
        Enter your email address and we'll send you a code to reset your password.
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
      </View>

      {generalErrors?.map((error, index) => (
        <Text key={`gen-${index}`} className="text-red-500 text-sm mt-1">
          {error.longMessage || error.message}
        </Text>
      ))}

      <TouchableOpacity
        onPress={onRequestResetPress}
        disabled={loading}
        className={`py-4 rounded-lg flex items-center justify-center mt-3 ${
          loading ? "bg-gray-400" : "bg-lightPrimaryAccent"
        }`}
      >
        <Text className="text-base font-semibold text-lightBlackText">
          {loading ? "Sending..." : "Send Reset Code"}
        </Text>
      </TouchableOpacity>

      <View className="flex flex-row justify-center items-center mt-6">
        <Text className="text-sm text-lightBlackText">
          Remember your password?
        </Text>
        <Link href="/sign-in">
          <Text className="text-sm text-lightPrimaryAccent"> Sign in</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
