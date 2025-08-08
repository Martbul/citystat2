import RadioSection from "@/components/radioSection";
import SettingsTouchableSection from "@/components/settingsTouchableSection";
import Slider from "@/components/Slider";
import Header from "@/components/header";
import {
  displayMessagesOptions,
  fontStyleOptions,
  roleColorOptions,
  textSizeOptions,
  themeOptions,
} from "@/data/appearenceSettingsOption";
import { useUserData } from "@/Providers/UserDataProvider";
import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Appearance() {
  const { settings, updateSettings, isLoading } = useUserData();

  const [displaySettings, setDisplaySettings] = useState<any[]>([]);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  useEffect(() => {
    console.log("Settings:", settings);

    setDisplaySettings([
      {
        label: "Text Size",
        seconLabel: getDisplayValue(settings.textSize, textSizeOptions),
        options: textSizeOptions,
        selectedOption: settings.textSize,
        setSelectedOption: (value: any) =>
          handleSettingUpdate({ textSize: value }),
      },
      {
        label: "Font Style",
        seconLabel: getDisplayValue(settings.fontStyle, fontStyleOptions),
        options: fontStyleOptions,
        selectedOption: settings.fontStyle,
        setSelectedOption: (value: any) =>
          handleSettingUpdate({ fontStyle: value }),
      },
    ]);

    // Set zoom level from settings
    //TODO: Zoom and contrast wtf??
    if (settings.zoomLevel) {
      setContrast(parseInt(settings.zoomLevel));
    }
  }, [settings]);

  const getDisplayValue = (value: any, options: any[]) => {
    const option = options.find((opt) => opt.value === value);
    return option?.label || value;
  };

  const handleSettingUpdate = async (settingUpdates: any) => {
    await updateSettings(settingUpdates);
  };

  const resetContrast = useCallback(() => {
    setContrast(100);
  }, []);

  const resetSaturation = useCallback(() => {
    setSaturation(100);
  }, []);

  const resetZoomLevel = useCallback(async () => {
    await handleSettingUpdate({ zoomLevel: "100" });
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
          selectedValue={settings.theme}
          onValueChange={(value) => handleSettingUpdate({ theme: value })}
          disabled={isLoading}
        />

        <RadioSection
          title="Role Colors"
          options={roleColorOptions}
          selectedValue={settings.showRoleColors}
          onValueChange={(value) =>
            handleSettingUpdate({ showRoleColors: value })
          }
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
              {/* <View className="py-4 px-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lightPrimaryText font-medium">
                    Zoom Level
                  </Text>
                  <Text className="text-lightSecondaryText">
                    {settings.zoomLevel}%
                  </Text>
                </View>

                <Slider
                  minimumValue={50}
                  maximumValue={150}
                  value={Number(settings.zoomLevel)} //TODO: Change zoom level to num in db, provider, interface...
                  onValueChange={setZoomLevel}
                  
                  onSlidingComplete={  handleSettingUpdate({ showRoleColors: value })}
                  z
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
              </View> */}
            </View>
          </View>
        </View>

        <RadioSection
          title="Message Previews"
          options={displayMessagesOptions}
          selectedValue={settings.messagesAllowance}
          onValueChange={(value) =>
            handleSettingUpdate({ messagesAllowance: value })
          }
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
