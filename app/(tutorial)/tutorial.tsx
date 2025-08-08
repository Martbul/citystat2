import Loader from "@/components/Loader";
import { useUserData } from "@/Providers/UserDataProvider";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  ScrollView as ScrollViewType,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const TutorialScreen = () => {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  if (!isSignedIn) {
    router.replace("/(auth)/sign-up");
  }

  if (!isLoaded) {
    <Loader purpose="loading"/>;
  }
  const { updateUserDetails } = useUserData();
  //TODO: Add a coice for a city to play, then set the default coords to that city center,
  //TODO: then fetch how many streets are in this city to calculate % coverage
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    imageURL:
      "https://48htuluf59.ufs.sh/f/1NvBfFppWcZeWF2WCCi3zDay6IgjQLVNYHEhKiCJ8OeGwTon",
    completedTutorial: true,
  });

  const [currentPage, setCurrentPage] = useState<number>(0);
  const scrollViewRef = useRef<ScrollViewType>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentPage(roundIndex);
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    scrollViewRef.current?.scrollTo({ x: pageIndex * width, animated: true });
  };

  const handleGetStarted = async () => {
    console.log(userDetails.firstName);

    try {
      await updateUserDetails(userDetails);
    } catch (error) {
      console.log(error);
    }
    //TODO: FIX THE PUT METHOD IN THE SERVER!! AND PROBABLY IN THE CLIENT
    router.replace("/(tabs)");
  };

  const handleInputChange = (field: string, value: string) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View className="flex-1 bg-lightBackground">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="w-screen px-6 justify-center items-center bg-lightBackground">
          <Text className="text-2xl font-bold text-lightBlackText mb-4 text-center">
            Welcome to CityStat
          </Text>
          <Text className="text-base text-lightBlackText text-center leading-6 max-w-xs">
            Let&quots get you set up with your profile to personalize your
            experience.
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-screen px-6 justify-center items-center bg-lightBackground"
        >
          <Text className="text-2xl font-bold text-lightBlackText mb-4 text-center">
            Tell us about you
          </Text>
          <TextInput
            className="w-full border border-lightNeutralGray rounded-xl px-4 py-3 text-base bg-lightSurface text-lightBlackText mb-3"
            placeholder="First Name"
            placeholderTextColor="#999"
            value={userDetails.firstName}
            onChangeText={(text) => handleInputChange("firstName", text)}
          />
          <TextInput
            className="w-full border border-lightNeutralGray rounded-xl px-4 py-3 text-base bg-lightSurface text-lightBlackText mb-3"
            placeholder="Last Name"
            placeholderTextColor="#999"
            value={userDetails.lastName}
            onChangeText={(text) => handleInputChange("lastName", text)}
          />
        </KeyboardAvoidingView>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-screen px-6 justify-center items-center bg-lightBackground"
        >
          <TextInput
            className="w-full border border-lightNeutralGray rounded-xl px-4 py-3 text-base bg-lightSurface text-lightBlackText mb-3"
            placeholder="Username"
            placeholderTextColor="#999"
            value={userDetails.userName}
            onChangeText={(text) => handleInputChange("userName", text)}
          />
          <TouchableOpacity
            onPress={handleGetStarted}
            className="bg-lightSecondaryAccent px-10 py-3 rounded-full mt-4"
          >
            <Text className="text-lightBlackText font-bold text-base">
              Get Started
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>

      {/* Page Indicators */}
      <View className="flex-row justify-center items-center absolute bottom-20 left-0 right-0">
        {[0, 1, 2].map((index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToPage(index)}
            className={`w-3 h-3 rounded-full mx-1 ${
              currentPage === index ? "bg-text scale-110" : "bg-muted"
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default TutorialScreen;
