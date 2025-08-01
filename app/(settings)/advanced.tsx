import Header from "@/components/ui/header";
import Panel from "@/components/ui/panel";
import InformativeToggle from "@/components/ui/informativeToggle";
import SettingsSection from "@/components/ui/settingsSection";
import { useUserData } from "@/Providers/UserDataProvider";
import { useEffect, useState } from "react";
import { StatusBar, ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Advanced() {
  const { userData } = useUserData();
  const [developerToggles, setDeveloperToggles] = useState<any[]>([]);
  const [performanceSettings, setPerformanceSettings] = useState<any[]>([]);
  const [experimentalFeatures, setExperimentalFeatures] = useState<any[]>([]);
  const [debugSettings, setDebugSettings] = useState<any[]>([]);

  useEffect(() => {
    if (userData) {
      setDeveloperToggles([
        {
          label: "Developer Mode",
          dscr: "Enable advanced developer features and debugging tools",
          isEnabled: false,
        },
        {
          label: "Debug Logging",
          dscr: "Enable detailed logging for troubleshooting issues",
          isEnabled: false,
        },
        {
          label: "Performance Monitoring",
          dscr: "Show performance metrics and memory usage",
          isEnabled: false,
        },
      ]);

      setPerformanceSettings([
        {
          label: "Reduce Motion",
          route: "/(settings)/reduceMotion",
          seconLabel: "Minimize animations for better performance",
        },
        {
          label: "Hardware Acceleration",
          route: "/(settings)/hardwareAcceleration",
          seconLabel: "Use GPU for better performance",
        },
        {
          label: "Background App Refresh",
          route: "/(settings)/backgroundRefresh",
          seconLabel: "Control background data usage",
        },
        {
          label: "Cache Management",
          route: "/(settings)/cacheManagement",
          seconLabel: "Manage app cache and storage",
        },
      ]);

      setExperimentalFeatures([
        {
          label: "Beta Features",
          route: "/(settings)/betaFeatures",
          seconLabel: "Try new features before release",
        },
        {
          label: "Advanced Gestures",
          route: "/(settings)/advancedGestures",
          seconLabel: "Enable experimental gesture controls",
        },
        {
          label: "AI Enhancements",
          route: "/(settings)/aiEnhancements",
          seconLabel: "Test AI-powered features",
        },
        {
          label: "Laboratory",
          route: "/(settings)/laboratory",
          seconLabel: "Experimental features testing ground",
        },
      ]);

      setDebugSettings([
        {
          label: "Network Inspector",
          route: "/(settings)/networkInspector",
          seconLabel: "Monitor network requests and responses",
        },
        {
          label: "Memory Profiler",
          route: "/(settings)/memoryProfiler",
          seconLabel: "Track memory usage and leaks",
        },
        {
          label: "Crash Reports",
          route: "/(settings)/crashReports",
          seconLabel: "View and manage crash reports",
        },
        {
          label: "Export Debug Data",
          route: "/(settings)/exportDebugData",
          seconLabel: "Export logs and diagnostic information",
        },
      ]);
    }
  }, [userData]);

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Advanced" />
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Warning Banner */}
        <WarningBanner />

        {/* Developer Toggles */}
        <DeveloperTogglesSection 
          developerToggles={developerToggles} 
        />

        {/* Performance Settings */}
        <SettingsSection
          title="Performance"
          data={performanceSettings}
          containerStyle="mt-8 mx-4"
        />

        {/* Experimental Features */}
        <SettingsSection
          title="Experimental Features"
          data={experimentalFeatures}
          containerStyle="mt-8 mx-4"
        />

        {/* Debug Settings */}
        <SettingsSection
          title="Debug & Diagnostics"
          data={debugSettings}
          containerStyle="mt-8 mx-4"
        />

        {/* System Information */}
        <SystemInformationSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const WarningBanner = () => {
  return (
    <View className="mt-6 mx-4">
      <View className="bg-orange-50 border border-orange-200 rounded-3xl p-6">
        <View className="flex-row items-center mb-2">
          <View className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
          <Text className="text-lg font-bold text-orange-900">
            Advanced Settings
          </Text>
        </View>
        <Text className="text-orange-800 leading-6">
          These settings are intended for advanced users and developers. 
          Changing these settings may affect app performance or stability.
        </Text>
      </View>
    </View>
  );
};

const DeveloperTogglesSection = ({ 
  developerToggles 
}: { 
  developerToggles: any[] 
}) => {
  const toggle = (index: number) => {
    console.log(`Toggling developer setting ${index}`);
    // Add your toggle logic here
  };

  return (
    <View className="mt-8 mx-4">
      <Text className="text-lg font-bold text-gray-900 mb-2">
        Developer Options
      </Text>
      <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {developerToggles.map((item, index) => (
          <View 
            className={`bg-lightSurface ${index === 0 ? 'rounded-t-3xl' : ''} ${index === developerToggles.length - 1 ? 'rounded-b-3xl' : ''}`} 
            key={item.label}
          >
            <InformativeToggle
              heading={item.label}
              description={item.dscr}
              toggleFunc={() => toggle(index)}
              isEnabled={item.isEnabled}
            />
            {index < developerToggles.length - 1 && (
              <View className="h-px bg-gray-100 ml-4" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const SystemInformationSection = () => {
  const systemInfo = [
    {
      label: "App Version",
      route: "/(settings)/appVersion",
      seconLabel: "1.0.0 (Build 123)",
    },
    {
      label: "System Version",
      route: "/(settings)/systemVersion",
      seconLabel: "iOS 17.0 / Android 14",
    },
    {
      label: "Device Information",
      route: "/(settings)/deviceInfo",
      seconLabel: "Model and specifications",
    },
    {
      label: "Reset Advanced Settings",
      route: "/(settings)/resetAdvanced",
      seconLabel: "Restore all advanced settings to default",
    },
  ];

  return (
    <SettingsSection
      title="System Information"
      data={systemInfo}
      containerStyle="mt-8 mx-4"
    />
  );
};