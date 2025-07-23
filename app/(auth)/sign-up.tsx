import { Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useSignUp  } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { isClerkRuntimeError } from "@clerk/clerk-expo";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<any>();

  const onSignUpPress = async () => {
        setErrors(undefined);

    if (!isLoaded) return

    try {
      await signUp.create({ emailAddress, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)

    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
  if (isClerkRuntimeError(err)) {
    setErrors(err.message); 
  }
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }


  if (pendingVerification) {
    return (
      <View className="flex-1 p-8 justify-center bg-lightBackground">
        <Text
          className="mb-3 text-3xl justify-center text-center text-lightBlackText  mb-6  text-2xl
 font-bold"
        >
          Verify your email
        </Text>{" "}
        <TextInput
          value={code}
          placeholder="Verification code"
          onChangeText={setCode}
          className="bg-white px-4 py-3 rounded-lg mb-4 font-medium text-base border border-neutral-300"
          placeholderTextColor="#aaa"
        />
        {errors &&
          errors.map((error:any, index:number) => (
            <Text key={index}>{error.longMessage}</Text>
          ))}
        <TouchableOpacity
          onPress={onVerifyPress}
          className="flex justify-center items-center bg-lightPrimaryAccent py-3 rounded-lg "
        >
          <Text
            className="text-lg
 font-medium text-lightBlackText"
          >
            Verify
          </Text>
        </TouchableOpacity>
        {/* <GoogleOneTap /> */}
      </View>
    );
  }

  return (
    <View className="flex-1 p-8 justify-center bg-lightBackground ">

      <Text
        className="mb-3 text-3xl justify-center text-center text-lightBlackText  mb-6  text-2xl
 font-bold"
      >
        Create your account
      </Text>

      <TextInput
        value={emailAddress}
        placeholder="Email"
        onChangeText={setEmailAddress}
        className="bg-white px-4 py-3 rounded-lg font-medium mb-4 text-base border border-neutral-300"
        placeholderTextColor="#aaa"
      />

      <TextInput
        value={password}
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
        className="bg-white px-4 py-3 rounded-lg mb-4 font-medium text-base border border-neutral-300"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        onPress={onSignUpPress}
        className="bg-lightPrimaryAccent py-4 rounded-lg flex items-center justify-center mt-1"
      >
        <Text
          className="text-base font-semibold text-lightBlackText


"
        >
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
