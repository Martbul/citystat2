import Header from "@/components/ui/header";
import RadioSection from "@/components/ui/radioSection";
import SettingsTouchableSection from "@/components/ui/settingsTouchableSection";
import Slider from "@/components/ui/Slider";
import {
  displayMessagesOptions,
  fontStyleOptions,
  roleColorOptions,
  textSizeOptions,
  themeOptions,
} from "@/data/appearenceSettingsOption";
import { useUserData } from "@/Providers/UserDataProvider";
import { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Theme,
  TextSize,
  MessagesAllowance,
  RoleColors,
} from "@/types/settings";

export default function Appearance() {
  const {
    userData,
    settings,
    updateTheme,
    updateSettings,
    updateTextSize,
    updateZoomLevel,
    updateFontStyle,
    isLoading,
  } = useUserData();

  const [displaySettings, setDisplaySettings] = useState<any[]>([]);
  const [roleColorOption, setRoleColorOption] = useState("inName");
  const [themeOption, setThemeColorOption] = useState("System");
  const [displayMessagesOption, setDisplayMessagesOption] = useState("allMsg");
  const [textSizeOption, setTextSizeOption] = useState("Medium");
  const [fontStyleOption, setFontStyleOption] = useState("Default");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  useEffect(() => {
    console.log(settings);
    if (settings) {
      console.log("user settings " + settings);

      // Direct assignment - no mapping needed!
      setThemeColorOption(settings.theme);
      setTextSizeOption(settings.textSize);
      setRoleColorOption(settings.showRoleColors);
      setDisplayMessagesOption(settings.messagesAllowance);
      setFontStyleOption(settings.fontStyle || "Default");
      setZoomLevel(parseInt(settings.zoomLevel) || 100);
    }
  }, [settings]);

  // Update display settings array when options change
  useEffect(() => {
    if (userData) {
      setDisplaySettings([
        {
          label: "Text Size",
          seconLabel: textSizeOption,
          options: textSizeOptions,
          selectedOption: textSizeOption,
          setSelectedOption: handleTextSizeChange,
        },
        {
          label: "Font Style",
          seconLabel: fontStyleOption,
          options: fontStyleOptions,
          selectedOption: fontStyleOption,
          setSelectedOption: handleFontStyleChange,
        },
      ]);
    }
  }, [userData, textSizeOption, fontStyleOption, settings]);

  const handleRoleColorChange = useCallback(
    async (option: RoleColors) => {
      setRoleColorOption(option);
      try {
        // Direct usage - values match Prisma enums!
        await updateSettings({ showRoleColors: option });
      } catch (error) {
        console.error("Failed to update role color:", error);
        Alert.alert("Error", "Failed to update role color setting");
        // Revert on error
        setRoleColorOption(
          userData?.settings?.showRoleColors ?? RoleColors.INNAME
        );
      }
    },
    [updateSettings, userData?.settings?.showRoleColors]
  );

  const handleThemeChange = useCallback(
    async (option: Theme) => {
      setThemeColorOption(option);
      try {
        // Direct usage - no mapping needed!
        await updateTheme(option);
      } catch (error) {
        console.error("Failed to update theme:", error);
        Alert.alert("Error", "Failed to update theme");
        setThemeColorOption(userData?.settings?.theme ?? Theme.SYSTEM);
      }
    },
    [updateTheme, userData?.settings?.theme]
  );
  const handleTextSizeChange = useCallback(
    async (option: TextSize) => {
      setTextSizeOption(option);
      try {
        // Direct usage - no mapping needed!
        await updateTextSize(option);
      } catch (error) {
        console.error("Failed to update text size:", error);
        Alert.alert("Error", "Failed to update text size setting");
        setTextSizeOption(userData?.settings?.textSize ?? TextSize.MEDIUM);
      }
    },
    [updateTextSize, userData?.settings?.textSize]
  );

  const handleMessagesAllowanceChange = useCallback(
    async (option: MessagesAllowance) => {
      setDisplayMessagesOption(option);
      try {
        await updateSettings({ messagesAllowance: option });
      } catch (error) {
        console.error("Failed to update messages allowance:", error);
        Alert.alert("Error", "Failed to update messages setting");
        setDisplayMessagesOption(
          userData?.settings?.messagesAllowance ?? MessagesAllowance.ALLMSG
        );
      }
    },
    [updateSettings, userData?.settings?.messagesAllowance]
  );

  const handleFontStyleChange = useCallback(
    async (option: string) => {
      setFontStyleOption(option);

      try {
        await updateFontStyle(option);
      } catch (error) {
        console.error("Failed to update font style:", error);
        Alert.alert("Error", "Failed to update font style");
        // Revert local state on error
        setFontStyleOption(userData?.settings?.fontStyle || "Default");
      }
    },
    [updateFontStyle, userData?.settings?.fontStyle]
  );

  const handleZoomLevelChange = useCallback(
    async (value: number) => {
      setZoomLevel(value);

      try {
        await updateZoomLevel(value);
      } catch (error) {
        console.error("Failed to update zoom level:", error);
        Alert.alert("Error", "Failed to update zoom level");
        // Revert local state on error
        setZoomLevel(parseInt(userData?.settings?.zoomLevel ?? "100"));
      }
    },
    [updateZoomLevel, userData?.settings?.zoomLevel]
  );

  const resetZoomLevel = useCallback(async () => {
    try {
      await handleZoomLevelChange(100);
    } catch (error) {
      console.error("Failed to reset zoom level:", error);
    }
  }, [handleZoomLevelChange]);

  const resetContrast = useCallback(() => {
    setContrast(100);
  }, []);

  const resetSaturation = useCallback(() => {
    setSaturation(100);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Appearance" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <RadioSection
          title="Theme"
          options={themeOptions}
          selectedValue={themeOption}
          onValueChange={handleThemeChange}
          disabled={isLoading}
        />

        <RadioSection
          title="Role Colors"
          options={roleColorOptions}
          selectedValue={roleColorOption}
          onValueChange={handleRoleColorChange}
          disabled={isLoading}
        />

        <SettingsTouchableSection
          title="Display Settings"
          data={displaySettings}
          containerStyle="mt-6 mx-4"
        />

        <View className="mt-6 mx-4">
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="bg-lightSurface rounded-3xl">
              <View className="py-4 px-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lightPrimaryText font-medium">
                    Zoom Level
                  </Text>
                  <Text className="text-lightSecondaryText">
                    {Math.round(zoomLevel)}%
                  </Text>
                </View>

                <Slider
                  minimumValue={50}
                  maximumValue={150}
                  value={zoomLevel}
                  onValueChange={setZoomLevel}
                  onSlidingComplete={handleZoomLevelChange}
                  step={1}
                  disabled={isLoading}
                />
                <TouchableOpacity
                  className="mt-3 bg-gray-100 p-3 rounded-xl items-center"
                  onPress={resetZoomLevel}
                  disabled={isLoading}
                >
                  <Text className="text-lightPrimaryAccent font-medium">
                    Reset to default
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <RadioSection
          title="Message Previews"
          options={displayMessagesOptions}
          selectedValue={displayMessagesOption}
          onValueChange={handleMessagesAllowanceChange}
          disabled={isLoading}
        />

        <View className="mt-6 mx-4">
          <Text className="text-lg font-bold text-lightPrimaryText mb-2">
            Contrast
          </Text>
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="bg-lightSurface rounded-3xl">
              <View className="py-4 px-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lightPrimaryText font-medium">
                    Contrast Level
                  </Text>
                  <Text className="text-lightSecondaryText">
                    {Math.round(contrast)}%
                  </Text>
                </View>
                <Slider
                  minimumValue={50}
                  maximumValue={150}
                  value={contrast}
                  onValueChange={setContrast}
                  step={1}
                />
                <TouchableOpacity
                  className="mt-3 bg-gray-100 p-3 rounded-xl items-center"
                  onPress={resetContrast}
                >
                  <Text className="text-lightPrimaryAccent font-medium">
                    Reset to default
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-6 mx-4">
          <Text className="text-lg font-bold text-lightPrimaryText mb-2">
            Saturation
          </Text>
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="bg-lightSurface rounded-3xl">
              <View className="py-4 px-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lightPrimaryText font-medium">
                    Saturation Level
                  </Text>
                  <Text className="text-lightSecondaryText">
                    {Math.round(saturation)}%
                  </Text>
                </View>
                <Slider
                  minimumValue={0}
                  maximumValue={100}
                  value={saturation}
                  onValueChange={setSaturation}
                  step={1}
                />
                <TouchableOpacity
                  className="mt-3 bg-gray-100 p-3 rounded-xl items-center"
                  onPress={resetSaturation}
                >
                  <Text className="text-lightPrimaryAccent font-medium">
                    Reset to default
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View className="flex items-center justify-center">
            <Text className="text-lightPrimaryText text-sm mt-2">
              Reduce the colour saturation within the application for those with
              colour sensitivities. This does not affect the saturation of
              images, videos, role colours or other user-provided content by
              default.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
