import React, { useCallback, useRef, useState } from "react";
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
  IconContainer,
  MutedText,
  PageContainer,
  PageTitle,
  SectionSpacing,
} from "@/components/dev";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserData } from "@/Providers/UserDataProvider";
import PrimaryButton from "@/components/primaryButton";
import {
  CityResult,
  CitySearchSelector,
} from "@/components/citySearchSelector";
import { AlertHelpers, useCustomAlert } from "@/components/alert";
import { useLocationTracking } from "@/Providers/LocationTrackingProvider";
import LocationEnablerPanel from "@/components/locationEnablerPanel";
import OnboardingLocationEnablerPanel from "@/components/onboardingLocationEnablerPanel";

const { width } = Dimensions.get("window");

interface OnboardingData {
  workoutFrequency: string;
  allowNotifications: boolean;
  rolloverCalories: boolean;
}

const OnboardingScreen = () => {
  const router = useRouter();
  const { updateUserDetails } = useUserData();
  const { showAlert, AlertComponent } = useCustomAlert();
  const {
    requestFullLocationPermissions,
    checkExistingPermissions,
    completeLocationOnboarding,
    initializeForOnboarding,
  } = useLocationTracking();
  const scrollViewRef = useRef<ScrollViewType>(null);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    workoutFrequency: "",
    allowNotifications: false,
    rolloverCalories: false,
  });

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

  const handleComplete = async () => {
    //! redirect the user to sign up and then after he sins in complete this req(send the data to the sign-up via params)
    //! then concurently (withoutwaithing make a server req after the sign up)

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
          display_name: `${userDetails.selectedCity.name}, ${userDetails.selectedCity.country}${userDetails.selectedCity.state ? `, ${userDetails.selectedCity.state}` : ""}`,
        },
      };
      // await updateUserDetails(updatedDetails);

      router.replace({
        pathname: "/(auth)/sign-up",
        params: {
          onboardingUserDetails: JSON.stringify(updatedDetails),
        },
      });
    } catch (error) {
      console.log("Error completing onboarding:", error);
    }
  };

  const canProceed = (page: number) => {
    switch (page) {
      case 0:
        return true; // Welcome page
      case 1:
        return userDetails.selectedCity !== null;
      case 2:
        return true; // Info page
      case 3:
        return true; // Privacy page
      case 4:
        return true; // Notifications page
      case 5:
        return true; // Rollover page
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

  const initializeOnboarding = async () => {
    try {
      // Initialize the location service for onboarding
      await initializeForOnboarding();
    } catch (error) {
      console.error("Failed to initialize onboarding:", error);
      Alert.alert(
        "Initialization Error",
        "Failed to check permissions. Please try again.",
        [{ text: "OK" }]
      );
    }
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

  return (
    <PageContainer>
      {/* Back Button & Progress Bar */}
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
              style={{ width: `${((currentPage + 1) / 7) * 100}%` }}
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
        <View className="w-screen px-6 justify-center items-center">
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

            <View className="w-3/4 mt-8">
              <PrimaryButton
                heading="Get Started"
                onPressAction={() => goToPage(1)}
              />
              <View className="flex-row justify-center mt-4">
                <Text className="text-textGray text-base">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/sign-in")}
                >
                  <Text className="text-accent text-base font-medium">
                    Sign in
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="w-screen px-6 py-16">
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

            {canProceed(1) && (
              <View className="mt-8">
                <PrimaryButton
                  heading="Continue"
                  onPressAction={() => goToPage(2)}
                />
              </View>
            )}
          </View>
        </View>

        {/* Results Info Page */}
        <View className="w-screen px-6 py-8">
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

               <PrimaryButton
              heading="Continue"
              onPressAction={() => goToPage(3)}
            />
            </View>
          </KeyboardAvoidingView>
        </View>

        {/* Privacy Page */}
        <View className="w-screen px-6 py-8">
          <View className="flex-1 justify-center items-center">
            {/* Hand Icon */}
            <View className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-12 items-center justify-center">
              <View className="w-32 h-32 items-center justify-center">
                <Ionicons name="hand-right-outline" size={64} color="#6366F1" />
              </View>
            </View>

            <PageTitle className="text-center mb-4">
              Thank you for trusting us!
            </PageTitle>
            <MutedText className="text-center mb-12 max-w-xs">
              Now let's personalize Cal AI for you...
            </MutedText>

            <View className="bg-gray-50 rounded-2xl p-6 mb-12 max-w-sm">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-yellow-100 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="lock-closed" size={16} color="#F59E0B" />
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

            <PrimaryButton
              heading="Continue"
              onPressAction={() => goToPage(4)}
            />
          </View>
        </View>

        <View className="w-screen px-6 py-8">
          <View className="flex-1 justify-center">
            <PageTitle className="text-center mb-12">
              For accurate stats please allow background location traking
            </PageTitle>

            <OnboardingLocationEnablerPanel
              requestLocationPermission={handleLocPerm}
            />
            {/* <View className="bg-gray-100 rounded-2xl p-6 mb-8 max-w-sm mx-auto">
              <Text className="text-center text-textDark text-lg font-semibold mb-6">
                Cal AI would like to send you Notifications
              </Text>

              <View className="flex-row">
                <TouchableOpacity
                  onPress={() =>
                    setOnboardingData((prev) => ({
                      ...prev,
                      allowNotifications: false,
                    }))
                  }
                  className={`flex-1 py-4 rounded-l-xl items-center ${!onboardingData.allowNotifications ? "bg-gray-300" : "bg-gray-200"}`}
                >
                  <Text className="text-textDark text-base font-medium">
                    Don't Allow
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setOnboardingData((prev) => ({
                      ...prev,
                      allowNotifications: true,
                    }))
                  }
                  className={`flex-1 py-4 rounded-r-xl items-center ${onboardingData.allowNotifications ? "bg-textDark" : "bg-gray-200"}`}
                >
                  <Text
                    className={`text-base font-medium ${onboardingData.allowNotifications ? "text-white" : "text-textDark"}`}
                  >
                    Allow
                  </Text>
                </TouchableOpacity>
              </View>
            </View> */}

            <PrimaryButton
              heading="Continue"
              onPressAction={() => goToPage(5)}
            />
          </View>
        </View>

        {/* Rollover Calories Page */}
        <View className="w-screen px-6 py-8">
          <View className="flex-1">
            <PageTitle className="mb-4">
              Rollover extra calories to the next day?
            </PageTitle>
            <View className="flex-row items-center mb-8">
              <Text className="text-accent text-base font-medium bg-accent/10 px-3 py-1 rounded-full">
                Rollover up to 200 cals
              </Text>
            </View>

            <View className="flex-1 flex-row justify-between space-x-4">
              <CalorieCard
                title="Yesterday"
                calories={350}
                totalCalories={500}
                leftover={150}
                variant="light"
              />

              <CalorieCard
                title="Today"
                calories={350}
                totalCalories={650}
                bonus={150}
                leftover={300}
                variant="dark"
              />
            </View>

            <View className="flex-row space-x-4 mt-8">
              <SecondaryButton
                title="No"
                onPress={() => {
                  setOnboardingData((prev) => ({
                    ...prev,
                    rolloverCalories: false,
                  }));
                  goToPage(6);
                }}
              />
              <PrimaryButton
                heading="Yes"
                onPressAction={() => {
                  setOnboardingData((prev) => ({
                    ...prev,
                    rolloverCalories: true,
                  }));
                  goToPage(6);
                }}
                className="flex-1"
              />
            </View>
          </View>
        </View>

        {/* Final Setup Page */}
        <View className="w-screen px-6 py-8">
          <View className="flex-1 justify-center items-center">
            <Text className="text-6xl font-bold text-textDark mb-8">100%</Text>
            <PageTitle className="text-center mb-4">
              Everything is set. Sign up and start traking
            </PageTitle>

            {/* Progress Bar */}
            <View className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
              <View className="w-full h-full bg-gradient-to-r from-red-400 via-purple-500 to-blue-500 rounded-full" />
            </View>

            {/* <MutedText className="text-center mb-12">
              Finalizing results...
            </MutedText> */}

            {/* Results Panel */}
            <View className="bg-textDark rounded-2xl p-6 w-full max-w-sm mb-8">
              <Text className="text-white text-lg font-semibold mb-4">
                Daily recommendation for
              </Text>

              <View className="space-y-3">
                {["Calories", "Carbs", "Protein", "Fats", "Health score"].map(
                  (item) => (
                    <View
                      key={item}
                      className="flex-row items-center justify-between"
                    >
                      <Text className="text-white text-base">• {item}</Text>
                      <View className="w-6 h-6 bg-white rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={16} color="#1F2937" />
                      </View>
                    </View>
                  )
                )}
              </View>
            </View>

            <PrimaryButton
              heading="Get Started"
              onPressAction={handleComplete}
            />
          </View>
        </View>
      </ScrollView>
    </PageContainer>
  );
};

// Helper Components
// const PrimaryButton = ({ title, onPress, className = "" }: { title: string, onPress: () => void, className?: string }) => (
//   <TouchableOpacity
//     onPress={onPress}
//     className={`bg-textDark px-8 py-4 rounded-full items-center ${className}`}
//   >
//     <Text className="text-white text-lg font-semibold">{title}</Text>
//   </TouchableOpacity>
// );

const SecondaryButton = ({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-1 bg-gray-100 px-8 py-4 rounded-full items-center"
  >
    <Text className="text-textDark text-lg font-semibold">{title}</Text>
  </TouchableOpacity>
);

const WorkoutOption = ({
  icon,
  title,
  subtitle,
  selected,
  onPress,
  variant = "light",
}: {
  icon: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  variant?: "light" | "dark";
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`p-6 rounded-2xl border-2 ${
      selected
        ? "border-accent bg-accent/5"
        : variant === "dark"
          ? "border-textDark bg-textDark"
          : "border-gray-200 bg-white"
    }`}
  >
    <View className="flex-row items-center">
      <View
        className={`w-8 h-8 rounded-full items-center justify-center mr-4 ${
          variant === "dark" ? "bg-white" : "bg-textDark"
        }`}
      >
        <View
          className={`w-3 h-3 rounded-full ${
            selected
              ? "bg-accent"
              : variant === "dark"
                ? "bg-textDark"
                : "bg-white"
          }`}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-xl font-bold mb-1 ${
            variant === "dark" ? "text-white" : "text-textDark"
          }`}
        >
          {title}
        </Text>
        <Text
          className={`text-base ${
            variant === "dark" ? "text-gray-300" : "text-textGray"
          }`}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const CalorieCard = ({
  title,
  calories,
  totalCalories,
  leftover,
  bonus,
  variant = "light",
}: {
  title: string;
  calories: number;
  totalCalories: number;
  leftover: number;
  bonus?: number;
  variant?: "light" | "dark";
}) => (
  <View
    className={`flex-1 p-6 rounded-2xl ${
      variant === "dark" ? "bg-gray-100" : "bg-white border border-gray-200"
    }`}
  >
    <View className="flex-row items-center mb-4">
      <View className="w-6 h-6 bg-textDark rounded-full mr-2" />
      <Text className="text-textDark text-base font-medium">{title}</Text>
    </View>

    <Text className="text-3xl font-bold text-textDark mb-1">
      {calories}
      <Text className="text-lg text-textGray">/{totalCalories}</Text>
    </Text>

    {bonus && (
      <Text className="text-accent text-base font-medium mb-2">+{bonus}</Text>
    )}

    {/* Progress Circle */}
    <View className="w-16 h-16 bg-textDark rounded-full items-center justify-center">
      <Text className="text-white text-xs font-bold">Cals left</Text>
      <Text className="text-white text-sm font-bold">
        {leftover}
        {bonus && ` + ${bonus}`}
      </Text>
    </View>
  </View>
);

export default OnboardingScreen;




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
