import Header from "@/components/header";
import Panel from "@/components/panel";
import { useUserData } from "@/Providers/UserDataProvider";
import { dataCombinator } from "@/utils/dataCombinator";
import { useEffect, useState } from "react";
import { FlatList, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Appearance() {
  const { settings, updateSettings, isLoading } = useUserData();


  const [colorsInfo, setColorsInfo] = useState<any[]>([]);
  const [motion, setMotion] = useState<any[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);

    const getDisplayValue = (value: any, options: any[]) => {
    const option = options.find((opt) => opt.value === value);
    return option?.label || value;
  };

   const handleSettingUpdate = async (settingUpdates: any) => {
    await updateSettings(settingUpdates);
  };


  useEffect(() => {
    if (userData) {
      setColorsInfo([
        {
          label: "Show role colours in names",
          toggleFunc: userData?.userName,
        },
        {
          label: "Show role colours next to names",
          toggleFunc: `${userData?.firstName} ${userData?.lastName || ""}`,
        },
        {
          label: "Dont show role colours",
          toggleFunc: userData?.email,
        },
        {
          label: "Sync profile colors",
          toggleFunc: userData?.email,
        },
      ]);

      setMotion([
        {
          label: "Reduced Motion",
        },
        {
          label: "Sync with Device Settings",
        },
        {
          label: "Automatically play GIFs when possible.",
        },
        {
          label: "Play animated emojis",
        },
      ]);

      setStickers([
        {
          label: "Always animate",
          route: "/(settings)/disableA",
        },
        {
          label: "Animate on interaction",
          route: "/(settings)/deleteAccount",
        },
        {
          label: "Never animate",
          route: "/(settings)/deleteAccount",
        },
      ]);
    }
  }, [userData]);

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Accessibility" />
      <Security colorsInfo={colorsInfo} motion={motion} stickers={stickers} />
    </SafeAreaView>
  );
}

const Security = ({
  colorsInfo,
  motion,
  stickers,
}: {
  colorsInfo: any[];
  motion: any[];
  stickers: any[];
}) => {
  const combinedData = dataCombinator([
    { title: "Role Colours", data: colorsInfo },
    { title: "Reduced Motiont", data: motion },
    { title: "Stickers", data: stickers },
  ]);

  return (
    <View className="flex-1 px-2">
      <FlatList
        data={combinedData}
        keyExtractor={(item, index) =>
          item.type === "header" ? `header-${item.title}` : `item-${item.label}`
        }
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) =>
          item.type === "header" ? (
            <Text className="text-lg font-semibold mt-4 mb-2 text-black">
              {item.title}
            </Text>
          ) : (
            <Panel
              route={item.route}
              label={item.label}
              icon={item.icon}
              seconLabel={item.seconLabel}
            />
          )
        }
      />
    </View>
  );
};


//TODO:Uncomment this, it is from claude
// import Header from "@/components/header";
// import RadioSection from "@/components/radioSection";
// import SettingsTouchableSection from "@/components/settingsTouchableSection";
// import { useUserData } from "@/Providers/UserDataProvider";
// import { useEffect, useState } from "react";
// import { ScrollView, StatusBar } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// // Define your accessibility options (you'll need to create these in your data folder)
// const roleColorsOptions = [
//   { label: "Show role colours in names", value: "in_names" },
//   { label: "Show role colours next to names", value: "next_to_names" },
//   { label: "Don't show role colours", value: "none" },
//   { label: "Sync profile colors", value: "sync_profile" },
// ];

// const motionOptions = [
//   { label: "Normal Motion", value: "normal" },
//   { label: "Reduced Motion", value: "reduced" },
//   { label: "Sync with Device Settings", value: "sync_device" },
// ];

// const gifOptions = [
//   { label: "Always play GIFs", value: "always" },
//   { label: "Play on interaction", value: "on_interaction" },
//   { label: "Never play GIFs", value: "never" },
// ];

// const emojiOptions = [
//   { label: "Always animate", value: "always" },
//   { label: "Animate on interaction", value: "on_interaction" },
//   { label: "Never animate", value: "never" },
// ];

// const stickerOptions = [
//   { label: "Always animate", value: "always" },
//   { label: "Animate on interaction", value: "on_interaction" },
//   { label: "Never animate", value: "never" },
// ];

// export default function Accessibility() {
//   const { settings, updateSettings, isLoading } = useUserData();

//   const [accessibilitySettings, setAccessibilitySettings] = useState<any[]>([]);

//   useEffect(() => {
//     console.log("Settings:", settings);

//     setAccessibilitySettings([
//       {
//         label: "Motion Settings",
//         seconLabel: getDisplayValue(settings.motionPreference, motionOptions),
//         options: motionOptions,
//         selectedOption: settings.motionPreference,
//         setSelectedOption: (value: any) =>
//           handleSettingUpdate({ motionPreference: value }),
//       },
//       {
//         label: "GIF Playback",
//         seconLabel: getDisplayValue(settings.gifPlayback, gifOptions),
//         options: gifOptions,
//         selectedOption: settings.gifPlayback,
//         setSelectedOption: (value: any) =>
//           handleSettingUpdate({ gifPlayback: value }),
//       },
//       {
//         label: "Emoji Animation",
//         seconLabel: getDisplayValue(settings.emojiAnimation, emojiOptions),
//         options: emojiOptions,
//         selectedOption: settings.emojiAnimation,
//         setSelectedOption: (value: any) =>
//           handleSettingUpdate({ emojiAnimation: value }),
//       },
//     ]);
//   }, [settings]);

//   const getDisplayValue = (value: any, options: any[]) => {
//     const option = options.find((opt) => opt.value === value);
//     return option?.label || value;
//   };

//   const handleSettingUpdate = async (settingUpdates: any) => {
//     await updateSettings(settingUpdates);
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-lightBackground">
//       <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
//       <Header title="Accessibility" />

//       <ScrollView
//         className="flex-1"
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 32 }}
//       >
//         <RadioSection
//           title="Role Colours"
//           options={roleColorsOptions}
//           selectedValue={settings.roleColours}
//           onValueChange={(value) => handleSettingUpdate({ roleColours: value })}
//           disabled={isLoading}
//         />

//         <SettingsTouchableSection
//           title="Motion & Animation"
//           data={accessibilitySettings}
//           containerStyle="mt-6 mx-4"
//         />

//         <RadioSection
//           title="Sticker Animation"
//           options={stickerOptions}
//           selectedValue={settings.stickerAnimation}
//           onValueChange={(value) =>
//             handleSettingUpdate({ stickerAnimation: value })
//           }
//           disabled={isLoading}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }