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
  TouchableOpacity,
  View,
} from "react-native";
import { BodyText, Card, MutedText, PageContainer, SectionSpacing, SectionTitle, SpaceBetweenRow } from "@/components/dev";
import RadioSection from "@/components/radioSection";
import SettingsTouchableSection from "@/components/settingsTouchableSection";

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
    <PageContainer>
      <StatusBar barStyle="light-content" backgroundColor="#fafafa" />
      <Header title="Appearance" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-4 pt-6">
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
          />

          {/* Zoom Level Section - Commented out but ready to use */}
          {/* 
          <SectionSpacing>
            <SectionTitle>Zoom Level</SectionTitle>
            <Card>
              <SpaceBetweenRow className="mb-4">
                <BodyText>Zoom Level</BodyText>
                <MutedText>{settings.zoomLevel}%</MutedText>
              </SpaceBetweenRow>

              <Slider
                minimumValue={50}
                maximumValue={150}
                value={Number(settings.zoomLevel)}
                onValueChange={setZoomLevel}
                onSlidingComplete={(value) => handleSettingUpdate({ zoomLevel: value.toString() })}
                step={1}
                disabled={isLoading}
              />

              <TouchableOpacity
                className="mt-4 bg-containerBg p-4 rounded-2xl items-center"
                onPress={resetZoomLevel}
                disabled={isLoading}
              >
                <BodyText className="text-accent font-semibold">
                  Reset to default
                </BodyText>
              </TouchableOpacity>
            </Card>
          </SectionSpacing>
          */}

          <RadioSection
            title="Message Previews"
            options={displayMessagesOptions}
            selectedValue={settings.messagesAllowance}
            onValueChange={(value) =>
              handleSettingUpdate({ messagesAllowance: value })
            }
            disabled={isLoading}
          />

          <SectionSpacing>
            <SectionTitle>Contrast</SectionTitle>
            <Card>
              <SpaceBetweenRow className="mb-4">
                <BodyText>Contrast Level</BodyText>
                <MutedText>{Math.round(contrast)}%</MutedText>
              </SpaceBetweenRow>

              <Slider
                minimumValue={50}
                maximumValue={150}
                value={contrast}
                onValueChange={setContrast}
                step={1}
              />

              <TouchableOpacity
                className="mt-4 bg-containerBg p-4 rounded-2xl items-center"
                onPress={resetContrast}
              >
                <BodyText className="text-accent font-semibold">
                  Reset to default
                </BodyText>
              </TouchableOpacity>
            </Card>
          </SectionSpacing>

          <SectionSpacing>
            <SectionTitle>Saturation</SectionTitle>
            <Card>
              <SpaceBetweenRow className="mb-4">
                <BodyText>Saturation Level</BodyText>
                <MutedText>{Math.round(saturation)}%</MutedText>
              </SpaceBetweenRow>

              <Slider
                minimumValue={0}
                maximumValue={100}
                value={saturation}
                onValueChange={setSaturation}
                step={1}
              />

              <TouchableOpacity
                className="mt-4 bg-containerBg p-4 rounded-2xl items-center"
                onPress={resetSaturation}
              >
                <BodyText className="text-accent font-semibold">
                  Reset to default
                </BodyText>
              </TouchableOpacity>

              <View className="mt-4">
                <MutedText className="text-center leading-5">
                  Reduce the colour saturation within the application for those with
                  colour sensitivities. This does not affect the saturation of
                  images, videos, role colours or other user-provided content by
                  default.
                </MutedText>
              </View>
            </Card>
          </SectionSpacing>
        </View>
      </ScrollView>
    </PageContainer>
  );
}