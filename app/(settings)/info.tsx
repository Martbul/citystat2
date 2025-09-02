import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import {
  Ionicons,
  AntDesign,
  Feather,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Import your existing components
import {
  PageContainer,
  Card,
  IconContainer,
  CardTitle,
  BodyText,
  MutedText,
  RowLayout,
  SectionSpacing,
  SpaceBetweenRow,
} from "@/components/dev";
import Header from "@/components/header";

// Info Section Component
const InfoSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Card className="mb-4">
      <CardTitle className="mb-3">{title}</CardTitle>
      {children}
    </Card>
  );
};

// Feature Item Component
const FeatureItem = ({
  icon,
  title,
  description,
  color = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: "blue" | "green" | "accent" | "neutral" | "red";
}) => {
  return (
    <View className="flex-row items-start mb-4 last:mb-0">
      <IconContainer size="small" color={color} className="mt-1">
        {icon}
      </IconContainer>
      <View className="ml-3 flex-1">
        <BodyText className="font-semibold mb-1">{title}</BodyText>
        <MutedText className="text-sm leading-5">{description}</MutedText>
      </View>
    </View>
  );
};


// Quick Action Button Component
const QuickActionButton = ({
  icon,
  title,
  subtitle,
  onPress,
  color = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  color?: "blue" | "green" | "accent" | "neutral" | "red";
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-50 p-4 rounded-2xl border border-gray-100"
    >
      <RowLayout className="justify-between">
        <RowLayout>
          <IconContainer size="medium" color={color}>
            {icon}
          </IconContainer>
          <View className="ml-4">
            <BodyText className="font-semibold">{title}</BodyText>
            <MutedText className="text-sm">{subtitle}</MutedText>
          </View>
        </RowLayout>
        <AntDesign name="right" size={16} color="#6B7280" />
      </RowLayout>
    </TouchableOpacity>
  );
};

// Version Info Component
const VersionInfo = () => {
  return (
    <View className="bg-gray-50 p-4 rounded-2xl">
      <RowLayout className="justify-between items-center">
        <View>
          <BodyText className="font-semibold">Street Explorer</BodyText>
          <MutedText className="text-sm">Version 2.1.3</MutedText>
        </View>
        <View className="items-end">
          <Text className="text-xs font-medium text-green-600">Up to date</Text>
          <MutedText className="text-xs">Build 2024.12.15</MutedText>
        </View>
      </RowLayout>
    </View>
  );
};

// Main Info Component
const Info: React.FC = () => {
  const router = useRouter();

  const handleContactSupport = () => {
    Alert.alert("Contact Support", "Choose how you'd like to contact us:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Email",
        onPress: () => Linking.openURL("mailto:support@streetexplorer.app"),
      },
      {
        text: "Website",
        onPress: () => Linking.openURL("https://streetexplorer.app/support"),
      },
    ]);
  };

  const handleRateApp = () => {
    Alert.alert(
      "Rate Street Explorer",
      "Love the app? Please consider leaving us a review!",
      [
        { text: "Maybe Later", style: "cancel" },
        {
          text: "Rate Now",
          onPress: () =>
            Linking.openURL("https://apps.apple.com/app/street-explorer"),
        },
      ]
    );
  };

  const handleShareApp = () => {
    Alert.alert(
      "Share Street Explorer",
      "Help your friends discover new streets!",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Share", onPress: () => console.log("Share functionality") },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://streetexplorer.app/privacy");
  };

  const handleTermsOfService = () => {
    Linking.openURL("https://streetexplorer.app/terms");
  };

  return (
    <PageContainer>
      <StatusBar barStyle="light-content" backgroundColor="#fafafa" />
      <Header title="Info" />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* App Overview */}
        <SectionSpacing className="mt-6">
          <InfoSection title="About Street Explorer">
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="map" size={32} color="white" />
              </View>
              <Text className="text-lg font-bold text-gray-900 text-center mb-2">
                Discover Your City
              </Text>
              <MutedText className="text-center leading-5">
                Street Explorer helps you discover new places in your city by
                tracking your walks and encouraging exploration of uncharted
                streets and neighborhoods.
              </MutedText>
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* Key Features */}
        <SectionSpacing>
          <InfoSection title="Key Features">
            <View>
              <FeatureItem
                icon={<Ionicons name="map-outline" size={16} color="white" />}
                title="Street Mapping"
                description="Track and visualize every street you've explored with detailed maps"
                color="blue"
              />
              <FeatureItem
                icon={<Ionicons name="stats-chart" size={16} color="white" />}
                title="Progress Analytics"
                description="Detailed statistics and insights about your exploration habits"
                color="green"
              />
              <FeatureItem
                icon={<Ionicons name="trophy" size={16} color="white" />}
                title="Achievements"
                description="Unlock badges and milestones as you explore more areas"
                color="accent"
              />
              <FeatureItem
                icon={<Ionicons name="people" size={16} color="white" />}
                title="Social Features"
                description="Share your discoveries and compete with friends"
                color="neutral"
              />
              <FeatureItem
                icon={
                  <Ionicons name="shield-checkmark" size={16} color="white" />
                }
                title="Privacy First"
                description="Your location data stays private and secure on your device"
                color="green"
              />
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* How It Works */}
        <SectionSpacing>
          <InfoSection title="How It Works">
            <View className="space-y-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-4">
                  <Text className="text-white font-bold text-sm">1</Text>
                </View>
                <View className="flex-1">
                  <BodyText className="font-semibold">Start Walking</BodyText>
                  <MutedText className="text-sm">
                    Open the app and begin your exploration journey
                  </MutedText>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center mr-4">
                  <Text className="text-white font-bold text-sm">2</Text>
                </View>
                <View className="flex-1">
                  <BodyText className="font-semibold">
                    Discover Streets
                  </BodyText>
                  <MutedText className="text-sm">
                    Walk down new streets to mark them as explored
                  </MutedText>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-yellow-500 rounded-full items-center justify-center mr-4">
                  <Text className="text-white font-bold text-sm">3</Text>
                </View>
                <View className="flex-1">
                  <BodyText className="font-semibold">Track Progress</BodyText>
                  <MutedText className="text-sm">
                    View your stats and unlock achievements
                  </MutedText>
                </View>
              </View>
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* Quick Actions */}
        <SectionSpacing>
          <InfoSection title="Quick Actions">
            <View className="space-y-3">
              <QuickActionButton
                icon={<Ionicons name="help-circle" size={20} color="white" />}
                title="Help & Support"
                subtitle="Get help or contact our support team"
                onPress={handleContactSupport}
                color="blue"
              />

              <QuickActionButton
                icon={<Ionicons name="star" size={20} color="white" />}
                title="Rate This App"
                subtitle="Share your experience on the App Store"
                onPress={handleRateApp}
                color="accent"
              />

              <QuickActionButton
                icon={<Ionicons name="share" size={20} color="white" />}
                title="Share with Friends"
                subtitle="Invite others to explore with you"
                onPress={handleShareApp}
                color="green"
              />
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* Tips & Tricks */}
        <SectionSpacing>
          <InfoSection title="Tips & Tricks">
            <View className="space-y-3">
              <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <RowLayout className="mb-2">
                  <Ionicons name="bulb" size={16} color="#3B82F6" />
                  <BodyText className="font-semibold ml-2 text-blue-800">
                    Pro Tip
                  </BodyText>
                </RowLayout>
                <MutedText className="text-sm text-blue-700">
                  Enable location services for the best tracking experience and
                  more accurate street detection.
                </MutedText>
              </View>

              <View className="bg-green-50 p-4 rounded-xl border border-green-100">
                <RowLayout className="mb-2">
                  <Ionicons name="leaf" size={16} color="#10B981" />
                  <BodyText className="font-semibold ml-2 text-green-800">
                    Battery Tip
                  </BodyText>
                </RowLayout>
                <MutedText className="text-sm text-green-700">
                  Use power saving mode during long explorations to extend
                  battery life.
                </MutedText>
              </View>

              <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <RowLayout className="mb-2">
                  <Ionicons name="trophy" size={16} color="#F59E0B" />
                  <BodyText className="font-semibold ml-2 text-yellow-800">
                    Achievement Tip
                  </BodyText>
                </RowLayout>
                <MutedText className="text-sm text-yellow-700">
                  Explore different neighborhoods to unlock area-specific
                  achievements faster.
                </MutedText>
              </View>
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* FAQ Section */}
        <SectionSpacing>
          <InfoSection title="Frequently Asked Questions">
            <View>
              <FAQItem
                question="How does street tracking work?"
                answer="Street Explorer uses GPS to detect when you walk along new streets. The app automatically marks streets as explored when you spend enough time walking on them."
              />
              <FAQItem
                question="Does the app work offline?"
                answer="Yes! Street Explorer can track your exploration offline. Your data will sync when you're back online, but maps may have limited functionality."
              />
              <FAQItem
                question="How accurate is the step counting?"
                answer="Step counting uses your device's built-in sensors and is calibrated for walking. Accuracy may vary based on device and walking style."
              />
              <FAQItem
                question="Can I export my exploration data?"
                answer="Yes, you can export your data as CSV files or share summary reports from the Statistics page."
              />
              <FAQItem
                question="How is my privacy protected?"
                answer="All location data is stored locally on your device. We don't share your location or personal exploration data with third parties."
              />
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* App Statistics */}
        <SectionSpacing>
          <InfoSection title="App Statistics">
            <View className="space-y-3">
              <SpaceBetweenRow className="bg-gray-50 p-3 rounded-xl">
                <RowLayout>
                  <IconContainer size="small" color="blue">
                    <Ionicons name="download" size={16} color="#3B82F6" />
                  </IconContainer>
                  <BodyText className="ml-3">Downloads</BodyText>
                </RowLayout>
                <BodyText className="font-bold">500K+</BodyText>
              </SpaceBetweenRow>

              <SpaceBetweenRow className="bg-gray-50 p-3 rounded-xl">
                <RowLayout>
                  <IconContainer size="small" color="green">
                    <Ionicons name="people" size={16} color="#10B981" />
                  </IconContainer>
                  <BodyText className="ml-3">Active Explorers</BodyText>
                </RowLayout>
                <BodyText className="font-bold">50K+</BodyText>
              </SpaceBetweenRow>

              <SpaceBetweenRow className="bg-gray-50 p-3 rounded-xl">
                <RowLayout>
                  <IconContainer size="small" color="accent">
                    <Ionicons name="map" size={16} color="#F59E0B" />
                  </IconContainer>
                  <BodyText className="ml-3">Streets Mapped</BodyText>
                </RowLayout>
                <BodyText className="font-bold">2M+</BodyText>
              </SpaceBetweenRow>
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* Safety & Guidelines */}
        <SectionSpacing>
          <InfoSection title="Safety Guidelines">
            <View className="space-y-3">
              <View className="bg-red-50 p-4 rounded-xl border border-red-100">
                <RowLayout className="mb-2">
                  <Ionicons name="warning" size={16} color="#EF4444" />
                  <BodyText className="font-semibold ml-2 text-red-800">
                    Safety First
                  </BodyText>
                </RowLayout>
                <MutedText className="text-sm text-red-700">
                  Always stay aware of your surroundings and follow traffic
                  rules when exploring.
                </MutedText>
              </View>

              <View className="space-y-2">
                <BodyText className="font-medium">Remember to:</BodyText>
                <View className="ml-4">
                  <MutedText className="text-sm mb-1">
                    • Stay on sidewalks and pedestrian areas
                  </MutedText>
                  <MutedText className="text-sm mb-1">
                    • Be aware of weather conditions
                  </MutedText>
                  <MutedText className="text-sm mb-1">
                    • Inform someone of your exploration route
                  </MutedText>
                  <MutedText className="text-sm mb-1">
                    • Carry water and stay hydrated
                  </MutedText>
                  <MutedText className="text-sm">
                    • Avoid exploring alone in unfamiliar areas
                  </MutedText>
                </View>
              </View>
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* Credits & Acknowledgments */}
        <SectionSpacing>
          <InfoSection title="Credits & Acknowledgments">
            <View className="space-y-4">
              <View>
                <BodyText className="font-semibold mb-2">
                  Development Team
                </BodyText>
                <MutedText className="text-sm mb-1">
                  • UI/UX Design: Sarah Chen
                </MutedText>
                <MutedText className="text-sm mb-1">
                  • Lead Developer: Alex Rodriguez
                </MutedText>
                <MutedText className="text-sm mb-1">
                  • Data Science: Dr. Michael Park
                </MutedText>
                <MutedText className="text-sm">
                  • QA Testing: Jessica Liu
                </MutedText>
              </View>

              <View>
                <BodyText className="font-semibold mb-2">
                  Special Thanks
                </BodyText>
                <MutedText className="text-sm mb-1">
                  • OpenStreetMap contributors
                </MutedText>
                <MutedText className="text-sm mb-1">
                  • Beta testing community
                </MutedText>
                <MutedText className="text-sm">
                  • Our amazing user community
                </MutedText>
              </View>
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* Data & Privacy */}
        <SectionSpacing>
          <InfoSection title="Data & Privacy">
            <View className="space-y-3">
              <FeatureItem
                icon={<Ionicons name="lock-closed" size={16} color="white" />}
                title="Local Storage"
                description="All your exploration data is stored securely on your device"
                color="green"
              />
              <FeatureItem
                icon={<Ionicons name="eye-off" size={16} color="white" />}
                title="No Tracking"
                description="We don't track your location or share data with advertisers"
                color="blue"
              />
              <FeatureItem
                icon={
                  <Ionicons name="shield-checkmark" size={16} color="white" />
                }
                title="GDPR Compliant"
                description="Full compliance with data protection regulations"
                color="accent"
              />
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* Legal Links */}
        <SectionSpacing>
          <InfoSection title="Legal & Policies">
            <View className="space-y-2">
              <TouchableOpacity
                onPress={handlePrivacyPolicy}
                className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-xl"
              >
                <RowLayout>
                  <IconContainer size="small" color="neutral">
                    <Ionicons name="document-text" size={16} color="#6B7280" />
                  </IconContainer>
                  <BodyText className="ml-3">Privacy Policy</BodyText>
                </RowLayout>
                <AntDesign name="right" size={16} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTermsOfService}
                className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-xl"
              >
                <RowLayout>
                  <IconContainer size="small" color="neutral">
                    <Ionicons name="document" size={16} color="#6B7280" />
                  </IconContainer>
                  <BodyText className="ml-3">Terms of Service</BodyText>
                </RowLayout>
                <AntDesign name="right" size={16} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                <RowLayout>
                  <IconContainer size="small" color="neutral">
                    <Ionicons
                      name="information-circle"
                      size={16}
                      color="#6B7280"
                    />
                  </IconContainer>
                  <BodyText className="ml-3">Open Source Licenses</BodyText>
                </RowLayout>
                <AntDesign name="right" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* Version Information */}
        <SectionSpacing>
          <InfoSection title="Version Information">
            <VersionInfo />
            <View className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <RowLayout className="mb-2">
                <Ionicons name="gift" size={16} color="#3B82F6" />
                <BodyText className="font-semibold ml-2 text-blue-800">
                  What's New
                </BodyText>
              </RowLayout>
              <MutedText className="text-sm text-blue-700 mb-1">
                • Enhanced statistics with new chart types
              </MutedText>
              <MutedText className="text-sm text-blue-700 mb-1">
                • Improved street detection accuracy
              </MutedText>
              <MutedText className="text-sm text-blue-700 mb-1">
                • New achievement badges
              </MutedText>
              <MutedText className="text-sm text-blue-700">
                • Performance optimizations
              </MutedText>
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* Contact & Feedback */}
        <SectionSpacing>
          <InfoSection title="Contact & Feedback">
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleContactSupport}
                className="bg-blue-50 p-4 rounded-xl border border-blue-100"
              >
                <RowLayout className="justify-between">
                  <RowLayout>
                    <IconContainer size="small" color="blue">
                      <Ionicons name="mail" size={16} color="#3B82F6" />
                    </IconContainer>
                    <View className="ml-3">
                      <BodyText className="font-semibold text-blue-800">
                        Get Support
                      </BodyText>
                      <MutedText className="text-sm text-blue-600">
                        support@streetexplorer.app
                      </MutedText>
                    </View>
                  </RowLayout>
                  <AntDesign name="right" size={16} color="#3B82F6" />
                </RowLayout>
              </TouchableOpacity>

              <View className="flex-row space-x-3">
                <TouchableOpacity className="flex-1 bg-gray-50 p-4 rounded-xl items-center">
                  <IconContainer size="small" color="neutral" className="mb-2">
                    <FontAwesome5 name="twitter" size={16} color="#6B7280" />
                  </IconContainer>
                  <MutedText className="text-xs">@StreetExplorer</MutedText>
                </TouchableOpacity>

                <TouchableOpacity className="flex-1 bg-gray-50 p-4 rounded-xl items-center">
                  <IconContainer size="small" color="neutral" className="mb-2">
                    <FontAwesome5 name="instagram" size={16} color="#6B7280" />
                  </IconContainer>
                  <MutedText className="text-xs">@streetexplorer</MutedText>
                </TouchableOpacity>

                <TouchableOpacity className="flex-1 bg-gray-50 p-4 rounded-xl items-center">
                  <IconContainer size="small" color="neutral" className="mb-2">
                    <Ionicons name="globe" size={16} color="#6B7280" />
                  </IconContainer>
                  <MutedText className="text-xs">Website</MutedText>
                </TouchableOpacity>
              </View>
            </View>
          </InfoSection>
        </SectionSpacing>

        {/* Debug Information (Hidden in production) */}
        <SectionSpacing className="mb-8">
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Debug Info",
                "Device: iPhone 14 Pro\nOS: iOS 17.2\nBuild: Development\nLocation Services: Enabled"
              );
            }}
          >
            <View className="border border-dashed border-gray-300 p-4 rounded-xl">
              <RowLayout className="justify-center">
                <Ionicons name="bug" size={16} color="#6B7280" />
                <MutedText className="ml-2 text-xs">
                  Debug Information
                </MutedText>
              </RowLayout>
            </View>
          </TouchableOpacity>
        </SectionSpacing>
      </ScrollView>
    </PageContainer>
  );
};


const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="border-b border-gray-100 last:border-b-0">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="py-4"
      >
        <SpaceBetweenRow>
          <BodyText className="font-medium flex-1 mr-3">{question}</BodyText>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </SpaceBetweenRow>
      </TouchableOpacity>
      {isExpanded && (
        <View className="pb-4">
          <MutedText className="text-sm leading-5">{answer}</MutedText>
        </View>
      )}
    </View>
  );
};



export default Info;
