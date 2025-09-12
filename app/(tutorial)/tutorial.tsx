import {
  CityResult,
  CitySearchSelector,
} from "@/components/citySearchSelector";
import {
  BodyText,
  IconContainer,
  PageContainer,
  PageTitle,
  SectionSpacing,
} from "@/components/dev";
import Loader from "@/components/Loader";
import { useUserData } from "@/Providers/UserDataProvider";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Dimensions,
  Image,
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
import { Alert, useCustomAlert, AlertHelpers } from '@/components/alert';
const { width } = Dimensions.get("window");
const OnboardingScreen = () => {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  
  const { showAlert, AlertComponent } = useCustomAlert();
  if (!isSignedIn) {
    router.replace("/(auth)/sign-up");
  }

  if (!isLoaded) {
    return <Loader purpose="loading" />;
  }

  const { updateUserDetails } = useUserData();

  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    selectedCity: null as CityResult | null,
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
    if (!userDetails.firstName.trim()) {
      showAlert(AlertHelpers.error(
        "Missing Information", 
        "Please enter your first name to continue"
      ));
      return;
    }
    
    if (!userDetails.userName.trim()) {
      showAlert(AlertHelpers.error(
        "Missing Information", 
        "Please enter a username to continue"
      ));
      return;
    }
    
    if (!userDetails.selectedCity) {
      showAlert(AlertHelpers.error(
        "Missing Information", 
        "Please select your city to personalize your experience"
      ));
      return;
    }

    try {
          const updatedDetails = {
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      userName: userDetails.userName,
      imageUrl: userDetails.imageURL, 
      completedTutorial: userDetails.completedTutorial,
      selectedCity: {
        name: userDetails.selectedCity.name,
        country: userDetails.selectedCity.country,
        state: userDetails.selectedCity.state,
        lat: userDetails.selectedCity.lat,
        lon: userDetails.selectedCity.lon,
        display_name: `${userDetails.selectedCity.name}, ${userDetails.selectedCity.country}${userDetails.selectedCity.state ? `, ${userDetails.selectedCity.state}` : ''}`
      }
    };

        await updateUserDetails(updatedDetails);
      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);
      showAlert(AlertHelpers.error(
        "Save Failed", 
        "Unable to save your details. Please check your connection and try again."
      ));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleCitySelect = (city: CityResult) => {
    setUserDetails((prev) => ({ ...prev, selectedCity: city }));
  };

  const canProceedFromPage = (page: number) => {
    switch (page) {
      case 0:
        return true; // Welcome page
      case 1:
        return userDetails.firstName.trim() && userDetails.lastName.trim();
      case 2:
        return userDetails.userName.trim();
      case 3:
        return userDetails.selectedCity !== null;
      default:
        return false;
    }
  };

  return (
    <PageContainer>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        {/* Welcome Page */}
        <View className="w-screen px-6 justify-center items-center">
          <SectionSpacing className="flex-1 justify-center items-center">
            <IconContainer size="large" color="accent" className="mb-24">
              <Image
                source={require("../../assets/images/icon.png")}
                className="w-48 h-48"
              />
            </IconContainer>
            <PageTitle className="text-center">Welcome to CityStat</PageTitle>
            <BodyText className="text-center text-textGray leading-6 max-w-xs">
              Let's get you set up with your profile to personalize your street
              exploration experience.
            </BodyText>
          </SectionSpacing>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-screen px-6 justify-center items-center"
        >
          <View className="w-full max-w-sm">
            <SectionSpacing>
              <PageTitle className="text-center mb-2">
                Tell us about you
              </PageTitle>
              <BodyText className="text-center text-textGray mb-8">
                We'll use this to personalize your experience
              </BodyText>
            </SectionSpacing>

            <CustomTextInput
              placeholder="First Name"
              value={userDetails.firstName}
              onChangeText={(text) => handleInputChange("firstName", text)}
            />
            <CustomTextInput
              placeholder="Last Name"
              value={userDetails.lastName}
              onChangeText={(text) => handleInputChange("lastName", text)}
            />

            {canProceedFromPage(1) && (
              <PrimaryButton
                onPress={() => goToPage(2)}
                title="Continue"
                className="mt-4"
              />
            )}
          </View>
        </KeyboardAvoidingView>

        {/* Username Page */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-screen px-6 justify-center items-center"
        >
          <View className="w-full max-w-sm">
            <SectionSpacing>
              <PageTitle className="text-center mb-2">
                Choose a Username
              </PageTitle>
              <BodyText className="text-center text-textGray mb-8">
                This is how other users will see you
              </BodyText>
            </SectionSpacing>

            <CustomTextInput
              placeholder="Username"
              value={userDetails.userName}
              onChangeText={(text) => handleInputChange("userName", text)}
            />

            {canProceedFromPage(2) && (
              <PrimaryButton
                onPress={() => goToPage(3)}
                title="Continue"
                className="mt-4"
              />
            )}
          </View>
        </KeyboardAvoidingView>

        {/* City Selection Page */}
        <View className="w-screen px-6 pt-12 pb-6">
          <CitySearchSelector
            selectedCity={userDetails.selectedCity}
            onCitySelect={handleCitySelect}
          />

          {canProceedFromPage(3) && (
            <View className="mt-6">
              <PrimaryButton onPress={handleGetStarted} title="Get Started" />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Page Indicators */}
      <View className="flex-row justify-center items-center absolute bottom-8 left-0 right-0">
        {[0, 1, 2, 3].map((index) => (
          <TouchableOpacity
            key={index}
            onPress={() => canProceedFromPage(index - 1) && goToPage(index)}
            className={`w-3 h-3 rounded-full mx-1 ${
              currentPage === index
                ? "bg-accent scale-110"
                : currentPage > index
                  ? "bg-accent/60"
                  : "bg-gray-300"
            }`}
          />
        ))}
      </View>
    </PageContainer>
  );
};

export default OnboardingScreen;

const PrimaryButton = ({
  onPress,
  title,
  disabled = false,
  className = "",
}: {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  className?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`bg-accent px-8 py-4 rounded-2xl items-center shadow-sm ${
      disabled ? "opacity-50" : ""
    } ${className}`}
  >
    <Text className="text-white font-bold text-lg">{title}</Text>
  </TouchableOpacity>
);

// Custom Input Component
const CustomTextInput = ({
  placeholder,
  value,
  onChangeText,
  className = "",
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
}) => (
  <TextInput
    className={`w-full border border-gray-200 rounded-2xl px-6 py-4 text-lg bg-white text-textDark mb-4 ${className}`}
    placeholder={placeholder}
    placeholderTextColor="#9CA3AF"
    value={value}
    onChangeText={onChangeText}
  />
);
