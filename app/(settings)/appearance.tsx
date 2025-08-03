import Header from "@/components/ui/header";
import Panel from "@/components/ui/panel";
import SettingsSection from "@/components/ui/settingsSection";
import { useUserData } from "@/Providers/UserDataProvider";
import { useEffect, useState } from "react";
import { StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Appearance() {
  const { userData } = useUserData();
  const [themeOptions, setThemeOptions] = useState<any[]>([]);
  const [displaySettings, setDisplaySettings] = useState<any[]>([]);
  const [previewSettings, setPreviewSettings] = useState<any[]>([]);

  useEffect(() => {
    if (userData) {
      setThemeOptions([
        {
          label: "Light Theme",
          route: "/(settings)/lightTheme",
          seconLabel: "Default bright appearance",
        },
        {
          label: "Dark Theme",
          route: "/(settings)/darkTheme",
          seconLabel: "Easy on the eyes",
        },
        {
          label: "Auto (System)",
          route: "/(settings)/autoTheme",
          seconLabel: "Match device settings",
        },
      ]);

      setDisplaySettings([
        {
          label: "Text Size",
          route: "/(settings)/textSize",
          seconLabel: "Medium",
        },
        {
          label: "Zoom Level",
          route: "/(settings)/zoomLevel",
          seconLabel: "100%",
        },
        {
          label: "Font Style",
          route: "/(settings)/fontStyle",
          seconLabel: "System Default",
        },
      ]);

      setPreviewSettings([
        {
          label: "Show All Messages",
          route: "/(settings)/showAllMessages",
          seconLabel: "Preview all message content",
        },
        {
          label: "Unread Messages Only",
          route: "/(settings)/unreadOnly",
          seconLabel: "Show previews for unread DMs",
        },
        {
          label: "Hide Previews",
          route: "/(settings)/hidepreviews",
          seconLabel: "Show sender name only",
        },
      ]);
    }
  }, [userData]);

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Appearance" />
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Theme Section */}
        <SettingsSection
          title="Theme"
          data={themeOptions}
        />

        {/* Display Settings Section */}
        <SettingsSection
          title="Display Settings"
          data={displaySettings}
          containerStyle="mt-8 mx-4"
        />

        {/* Message Preview Section */}
        <SettingsSection
          title="Message Previews"
          data={previewSettings}
          containerStyle="mt-8 mx-4"
        />

        {/* Additional Appearance Options */}
        <AppearanceExtrasSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const AppearanceExtrasSection = () => {
  const appearanceExtras = [
    {
      label: "Animations",
      route: "/(settings)/animations",
      seconLabel: "Reduce motion effects",
    },
    {
      label: "App Icon",
      route: "/(settings)/appIcon",
      seconLabel: "Choose your app icon",
    },
    {
      label: "Color Accent",
      route: "/(settings)/colorAccent",
      seconLabel: "Customize accent colors",
    },
    {
      label: "Navigation Style",
      route: "/(settings)/navigationStyle",
      seconLabel: "Tab bar or side menu",
    },
  ];

  return (
    <SettingsSection
      title="Customization"
      data={appearanceExtras}
      containerStyle="mt-8 mx-4"
    />
  );
};