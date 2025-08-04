import Header from "@/components/ui/header";
import InformativeToggle from "@/components/ui/informativeToggle";
import SettingsRoutingSection from "@/components/ui/settingsRoutingSection";
import { useUserData } from "@/Providers/UserDataProvider";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Notifications() {
  const { userData } = useUserData();
  const [appNotificationToggles, setAppNotificationToggles] = useState<any[]>(
    []
  );
  const [systemNotificationSettings, setSystemNotificationSettings] = useState<
    any[]
  >([]);
  const [contentNotifications, setContentNotifications] = useState<any[]>([]);
  const [reactionNotifications, setReactionNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (userData) {
      setAppNotificationToggles([
        {
          label: "Enable In-App Notifications",
          dscr: "Get notifications within CityStat while using the app",
          isEnabled: true,
        },
        {
          label: "Sound Effects",
          dscr: "Play sounds for notifications and interactions",
          isEnabled: true,
        },
        {
          label: "Vibration",
          dscr: "Vibrate device for important notifications",
          isEnabled: false,
        },
      ]);

      setSystemNotificationSettings([
        {
          label: "Push Notifications",
          route: "/(settings)/pushNotifications",
          seconLabel: "Manage system notifications",
        },
        {
          label: "Notification Categories",
          route: "/(settings)/notificationCategories",
          seconLabel: "Customize notification types",
        },
        {
          label: "Quiet Hours",
          route: "/(settings)/quietHours",
          seconLabel: "Set do not disturb schedule",
        },
        {
          label: "Badge Count",
          route: "/(settings)/badgeCount",
          seconLabel: "Show unread count on app icon",
        },
      ]);

      setContentNotifications([
        {
          label: "Messages",
          route: "/(settings)/messageNotifications",
          seconLabel: "All conversations",
        },
        {
          label: "Friend Requests",
          route: "/(settings)/friendRequests",
          seconLabel: "New connection requests",
        },
        {
          label: "Activity Updates",
          route: "/(settings)/activityUpdates",
          seconLabel: "Location and status changes",
        },
        {
          label: "System Announcements",
          route: "/(settings)/systemAnnouncements",
          seconLabel: "App updates and maintenance",
        },
      ]);

      setReactionNotifications([
        {
          label: "All Messages",
          route: "/(settings)/allReactions",
          seconLabel: "Get notified for all reactions",
        },
        {
          label: "Direct Messages Only",
          route: "/(settings)/dmReactions",
          seconLabel: "Only reactions to your DMs",
        },
        {
          label: "Mentions Only",
          route: "/(settings)/mentionReactions",
          seconLabel: "When someone reacts to your mentions",
        },
      ]);
    }
  }, [userData]);

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Notifications" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* App Notification Toggles */}
        <AppNotificationTogglesSection
          appNotificationToggles={appNotificationToggles}
        />

        {/* System Notification Settings */}
        <SettingsRoutingSection
          title="System Notifications"
          data={systemNotificationSettings}
          containerStyle="mt-8 mx-4"
        />

        {/* Content Notifications */}
        <SettingsRoutingSection
          title="Content Notifications"
          data={contentNotifications}
          containerStyle="mt-8 mx-4"
        />

        {/* Reaction Notifications */}
        <SettingsRoutingSection
          title="Reaction Notifications"
          data={reactionNotifications}
          containerStyle="mt-8 mx-4"
        />

        {/* Advanced Settings */}
        <AdvancedNotificationSettings />
      </ScrollView>
    </SafeAreaView>
  );
}

const AppNotificationTogglesSection = ({
  appNotificationToggles,
}: {
  appNotificationToggles: any[];
}) => {
  const toggle = (index: number) => {
    console.log(`Toggling notification setting ${index}`);
    // Add your toggle logic here
  };

  return (
    <View className="mt-6 mx-4">
      <Text className="text-lg font-bold text-gray-900 mb-2">
        In-App Settings
      </Text>
      <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {appNotificationToggles.map((item, index) => (
          <View
            className={`bg-lightSurface ${index === 0 ? "rounded-t-3xl" : ""} ${index === appNotificationToggles.length - 1 ? "rounded-b-3xl" : ""}`}
            key={item.label}
          >
            <InformativeToggle
              heading={item.label}
              description={item.dscr}
              toggleFunc={() => toggle(index)}
              isEnabled={item.isEnabled}
            />
            {index < appNotificationToggles.length - 1 && (
              <View className="h-px bg-gray-100 ml-4" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const AdvancedNotificationSettings = () => {
  const advancedSettings = [
    {
      label: "Notification History",
      route: "/(settings)/notificationHistory",
      seconLabel: "View past notifications",
    },
    {
      label: "Smart Notifications",
      route: "/(settings)/smartNotifications",
      seconLabel: "AI-powered notification filtering",
    },
    {
      label: "Group Similar Notifications",
      route: "/(settings)/groupNotifications",
      seconLabel: "Bundle related notifications",
    },
    {
      label: "Reset All Settings",
      route: "/(settings)/resetNotifications",
      seconLabel: "Restore default notification settings",
    },
  ];

  return (
    <SettingsRoutingSection
      title="Advanced Settings"
      data={advancedSettings}
      containerStyle="mt-8 mx-4"
    />
  );
};
