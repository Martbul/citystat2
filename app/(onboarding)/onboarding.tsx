import React, { useRef, useState } from "react";
import {
  Alert,
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
import {
  BodyText,
  MutedText,
  PageContainer,
  PageTitle,
  SectionSpacing,
} from "@/components/dev";
import {  Ionicons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  CityResult,
  CitySearchSelector,
} from "@/components/citySearchSelector";
import { AlertHelpers, useCustomAlert } from "@/components/alert";
import { useLocationTracking } from "@/Providers/LocationTrackingProvider";
import OnboardingLocationEnablerPanel from "@/components/onboardingLocationEnablerPanel";
import { UserDetailsUpdateReq } from "@/types/user";

const { width } = Dimensions.get("window");

const OnboardingScreen = () => {
  const router = useRouter();
  const { showAlert } = useCustomAlert();
  const { requestFullLocationPermissions} =
    useLocationTracking();
  const scrollViewRef = useRef<ScrollViewType>(null);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    selectedCity: null as CityResult | null,
    imageURL:
      "https://48htuluf59.ufs.sh/f/1NvBfFppWcZeWF2WCCi3zDay6IgjQLVNYHEhKiCJ8OeGwTon",
    completedTutorial: true,
    isLocationTrackingEnabled: false,
  });

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

  const handleComplete = () => {
    if (!userDetails.firstName.trim()) {
      showAlert(
        AlertHelpers.error(
          "Missing Information",
          "Please enter your first name to continue"
        )
      );
      return;
    }

    if (!userDetails.userName.trim()) {
      showAlert(
        AlertHelpers.error(
          "Missing Information",
          "Please enter a username to continue"
        )
      );
      return;
    }

    if (!userDetails.selectedCity) {
      showAlert(
        AlertHelpers.error(
          "Missing Information",
          "Please select your city to personalize your experience"
        )
      );
      return;
    }

    const updatedDetails: UserDetailsUpdateReq = {
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      userName: userDetails.userName,
      imageUrl: userDetails.imageURL,
      completedTutorial: userDetails.completedTutorial,
      isLocationTrackingEnabled: userDetails.isLocationTrackingEnabled,
      selectedCity: {
        name: userDetails.selectedCity.name,
        country: userDetails.selectedCity.country,
        state: userDetails.selectedCity.state,
        lat: userDetails.selectedCity.lat,
        lng: userDetails.selectedCity.lon,
        display_name: `${userDetails.selectedCity.name}, ${userDetails.selectedCity.country}${userDetails.selectedCity.state ? `, ${userDetails.selectedCity.state}` : ""}`,
      },
    };

    console.log(updatedDetails);

    router.replace({
      pathname: "/(auth)/sign-up",
      params: {
        onboardingUserDetails: JSON.stringify(updatedDetails),
      },
    });
  };

  const canProceed = (page: number) => {
    switch (page) {
      case 0:
        return true; 
      case 1:
        return userDetails.selectedCity !== null;
      case 2:
        return (
          userDetails.firstName.trim() !== "" &&
          userDetails.lastName.trim() !== ""
        );
      case 3:
        return userDetails.userName.trim() !== "";
      case 4:
        return userDetails.isLocationTrackingEnabled;
      case 5:
        return true; 
      default:
        return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleCitySelect = (city: CityResult) => {
    setUserDetails((prev) => ({ ...prev, selectedCity: city }));
  };

  const handleLocPerm = async () => {
    try {
      const granted = await requestFullLocationPermissions();

      if (granted) {
        setUserDetails((prev) => ({
          ...prev,
          isLocationTrackingEnabled: true,
        }));
      } else {
        Alert.alert(
          "Permission Denied",
          "You need to enable location tracking for better results."
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert("Error", "Failed to request location permission.");
    }
  };

  const ContinueButton = ({ pageIndex }: { pageIndex: number }) => {
    const isEnabled = canProceed(pageIndex);

    const handlePress = () => {
      if (pageIndex === 5) {
        handleComplete();
      } else {
        goToPage(pageIndex + 1);
      }
    };

    return (
      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white">
        <TouchableOpacity
          onPress={handlePress}
          disabled={!isEnabled}
          className={`w-full py-4 rounded-2xl ${
            isEnabled ? "bg-accent" : "bg-gray-300"
          }`}
        >
          <Text
            className={`text-center font-semibold text-lg ${
              isEnabled ? "text-white" : "text-gray-500"
            }`}
          >
            {pageIndex === 5 ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <PageContainer>
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() =>
              currentPage > 0 ? goToPage(currentPage - 1) : router.back()
            }
            className="w-10 h-10 bg-accent rounded-full items-center justify-center"
          >
            <AntDesign name="arrowleft" size={20} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1 mx-4 h-1 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${((currentPage + 1) / 6) * 100}%` }}
            />
          </View>
        </View>
      </View>

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
        <View className="w-screen px-6 justify-center items-center pb-24">
          <View className="flex-1 justify-center items-center max-w-sm">
            {/* Phone Mockup */}
            <View className="relative mb-12">
              <View className="w-64 h-80 bg-gray-900 rounded-3xl p-2 shadow-xl">
                <View className="flex-1 bg-white rounded-2xl overflow-hidden relative">
                  {/* Status Bar */}
                  <View className="flex-row justify-between items-center px-6 py-2 bg-black">
                    <Text className="text-white text-sm font-medium">2:10</Text>
                    <View className="flex-row items-center space-x-1">
                      <View className="w-4 h-2 bg-white rounded-sm" />
                      <View className="w-4 h-2 bg-white rounded-sm" />
                      <View className="w-6 h-2 bg-accent rounded-sm" />
                    </View>
                  </View>

                  <View>
                    <Image
                      source={require("../../assets/images/onboarding_home_screen_example.jpg")}
                      className="w-full h-64 rounded"
                    />
                  </View>
                </View>
              </View>
            </View>

            <PageTitle className="text-center mb-4">
              {` Get interesting and helpful stats for \n your city life`}
            </PageTitle>

            <View className="flex-row justify-center mt-8">
              <Text className="text-textGray text-base">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
                <Text className="text-accent text-base font-medium">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <ContinueButton pageIndex={0} />
        </View>

        <View className="w-screen px-6 py-16 pb-24">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            <View className="flex-1">
              <PageTitle className="mb-4">
                Select the city you want to get stats for
              </PageTitle>
              <MutedText className="mb-12">
                Search for any city worldwide to start exploring
              </MutedText>

              <View className="flex-1 pt-12 pb-6">
                <CitySearchSelector
                  selectedCity={userDetails.selectedCity}
                  onCitySelect={handleCitySelect}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
          <ContinueButton pageIndex={1} />
        </View>

        <View className="w-screen px-6 py-8 pb-24">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            <View className="flex-1 justify-center items-center">
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
              </View>
            </View>
          </KeyboardAvoidingView>
          <ContinueButton pageIndex={2} />
        </View>

        <View className="w-screen px-6 py-8 pb-24">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            <View className="flex-1 justify-center items-center">
              <View className="w-full max-w-sm">
                <SectionSpacing>
                  <PageTitle className="text-center mb-2">
                    Choose Username to be known with
                  </PageTitle>
                  <BodyText className="text-center text-textGray mb-8">
                    We'll use this to personalize your experience
                  </BodyText>
                </SectionSpacing>

                <CustomTextInput
                  placeholder="Username"
                  value={userDetails.userName}
                  onChangeText={(text) => handleInputChange("userName", text)}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
          <ContinueButton pageIndex={3} />
        </View>

        <View className="w-screen px-6 py-8 pb-24">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            <View className="flex-1 justify-center">
              <PageTitle className="text-center mb-12">
                For accurate stats please allow background location tracking
              </PageTitle>

              <OnboardingLocationEnablerPanel
                requestLocationPermission={handleLocPerm}
              />
            </View>
          </KeyboardAvoidingView>
          <ContinueButton pageIndex={4} />
        </View>

        <View className="w-screen px-6 py-8 pb-24">
          <View className="flex-1 justify-center items-center">
            <View className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-12 items-center justify-center">
              <View className="w-32 h-32 items-center justify-center">
                <Ionicons
                  name="hand-right-outline"
                  size={100}
                  color="#c8f751"
                />
              </View>
            </View>

            <PageTitle className="text-center mb-4">
              Thank you for trusting us!
            </PageTitle>

            <View className="flex items-center justify-center bg-gray-50 rounded-2xl p-6 px-2 mb-12 max-w-sm">
              <View className="flex-row items-center mb-4 justify-center">
                <View className="w-8 h-8 bg-accent rounded-lg items-center justify-center mr-3">
                  <Ionicons name="lock-closed" size={16} color="#ffffffff" />
                </View>
                <Text className="text-textDark text-lg font-semibold">
                  Your privacy and security matter to us.
                </Text>
              </View>
              <Text className="text-textGray text-base leading-6">
                We promise to always keep your personal information private and
                secure.
              </Text>
            </View>
          </View>
          <ContinueButton pageIndex={5} />
        </View>


      </ScrollView>
    </PageContainer>
  );
};

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

export default OnboardingScreen;
