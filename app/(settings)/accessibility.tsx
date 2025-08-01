import Header from "@/components/ui/header";
import Panel from "@/components/ui/panel";
import { useUserData } from "@/Providers/UserDataProvider";
import { dataCombinator } from "@/utils/dataCombinator";
import { useEffect, useState } from "react";
import { FlatList, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Appearance() {
  const { userData } = useUserData();

  const [colorsInfo, setColorsInfo] = useState<any[]>([]);
  const [motion, setMotion] = useState<any[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);

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
