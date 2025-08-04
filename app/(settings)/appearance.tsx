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
import { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Appearance() {
  const { userData } = useUserData();
  const [displaySettings, setDisplaySettings] = useState<any[]>([]);
  const [roleColorOption, setRoleColorOption] = useState("inName");
  const [themeOption, setThemeColorOption] = useState("Auto");
  const [displayMessagesOption, setDisplayMessagesOption] = useState("allMsg");
  const [textSizeOption, setTextSizeOption] = useState("Medium");
  const [fontStyleOption, setFontStyleOption] = useState("Default");
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const handleRoleColorChange = (option: string) => {
    setRoleColorOption(option);
  };

  const handleThemeChange = (option: string) => {
    setThemeColorOption(option);
  };
  useEffect(() => {
    if (userData) {
      setDisplaySettings([
        {
          label: "Text Size",
          seconLabel: textSizeOption,
          options: textSizeOptions,
          selectedOption: textSizeOption,
          setSelectedOption: setTextSizeOption,
        },
        {
          label: "Font Style",
          seconLabel: fontStyleOption,
          options: fontStyleOptions,
          selectedOption: fontStyleOption,
          setSelectedOption: setFontStyleOption,
        },
      ]);
    }
  }, [userData, textSizeOption, fontStyleOption]);

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
        />

        <RadioSection
          title="Role Colors"
          options={roleColorOptions}
          selectedValue={roleColorOption}
          onValueChange={handleRoleColorChange}
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
                  onPress={() => setContrast(100)}
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
          onValueChange={setDisplayMessagesOption}
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
                  onPress={() => setContrast(100)}
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
                  onPress={() => setSaturation(100)}
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
