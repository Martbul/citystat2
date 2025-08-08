import InformativeToggle from "@/components/informativeToggle";
import SettingsRoutingSection from "@/components/settingsRoutingSection";
import Header from "@/components/header";
import { useUserData } from "@/Providers/UserDataProvider";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DataAndPrivacy() {
  const { userData } = useUserData();
  const [dataPreferences, setDataPreferences] = useState<any[]>([]);
  const [policiesData, setPoliciesData] = useState<any[]>([]);

  useEffect(() => {
    if (userData) {
      setDataPreferences([
        {
          label: "Use data to improve CityStat",
          dscr: "Allows us to use and process your information to understand and improve our services",
          isEnabled: userData?.userName,
        },
        {
          label: "Use data to personalise my CityStat experience",
          dscr: "Allows us to use information, such as who you walk to and where you go, to personalise CityStat for you.",
          isEnabled: `${userData?.firstName} ${userData?.lastName || ""}`,
        },
        {
          label: "In app rewards",
          dscr: "Use your CityStat activity to show friends the rewards you get.",
          isEnabled: false,
        },
        {
          label: "Analytics & Performance",
          dscr: "Help us understand how you use the app to improve performance and fix issues.",
          isEnabled: true,
        },
      ]);

      setPoliciesData([
        {
          label: "Terms of Service",
          route: "/(settings)/termsOfService",
        },
        {
          label: "Privacy Policy",
          route: "/(settings)/privacyPolicy",
        },
        {
          label: "Cookie Policy",
          route: "/(settings)/cookiePolicy",
        },
        {
          label: "Data Processing Agreement",
          route: "/(settings)/dataProcessing",
        },
      ]);
    }
  }, [userData]);

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Data & Privacy" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Data Preferences Section */}
        <DataPreferencesSection dataPreferences={dataPreferences} />

        {/* Privacy Controls Section */}
        <PrivacyControlsSection />

        {/* Policies Section */}
        <SettingsRoutingSection
          title="Policies & Disclosures"
          data={policiesData}
          containerStyle="mt-8 mx-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const DataPreferencesSection = ({
  dataPreferences,
}: {
  dataPreferences: any[];
}) => {
  const toggle = (index: number) => {
    console.log(`Toggling preference ${index}`);
    // Add your toggle logic here
  };

  return (
    <View className="mt-6 mx-4">
      <Text className="text-lg font-bold text-gray-900 mb-2">
        Data Preferences
      </Text>
      <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {dataPreferences.map((item, index) => (
          <View
            className={`bg-lightSurface ${index === 0 ? "rounded-t-3xl" : ""} ${
              index === dataPreferences.length - 1 ? "rounded-b-3xl" : ""
            }`}
            key={item.label}
          >
            <InformativeToggle
              heading={item.label}
              description={item.dscr}
              toggleFunc={() => toggle(index)}
              isEnabled={item.isEnabled}
            />
            {index < dataPreferences.length - 1 && (
              <View className="h-px bg-gray-100 ml-4" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const PrivacyControlsSection = () => {
  const privacyControls = [
    {
      label: "Download Your Data",
      route: "/(settings)/downloadData",
    },
    {
      label: "Delete Your Data",
      route: "/(settings)/deleteData",
    },
    {
      label: "Data Retention Settings",
      route: "/(settings)/dataRetention",
    },
  ];

  return (
    <SettingsRoutingSection
      title="Privacy Controls"
      data={privacyControls}
      containerStyle="mt-8 mx-4"
    />
  );
};
