import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StatusBar,
} from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { settings } from "@/data/settingsData";
import Header from "@/components/ui/header";
import InputBox from "@/components/inputBox";
import Panel from "@/components/ui/panel";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const [search, setSearch] = useState("");
  

  const filteredSettings = useMemo(() => {
    if (!search.trim()) {
      return settings;
    }

    return settings.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [search]);

  //TODO: Make a SINGLE req for all the settings

  const SearchHeader = useMemo(
    () => (
      <View className="relative mb-4">
        <InputBox
          val={search}
          valSetFunc={setSearch}
          placeholderTest="Search settings..."
          icon={<EvilIcons name="search" size={28} color="#aaa" />}
        />
      </View>
    ),
    [search]
  );

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Settings" />

      <View className="flex-1">
        <FlatList
          scrollEnabled={true}
          data={filteredSettings}
          keyExtractor={(item) => item.label}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={SearchHeader}
          renderItem={({ item }) => (
            <Panel route={item.route} label={item.label} icon={item.icon()} />
          )}
          ListEmptyComponent={() =>
            search.trim() ? (
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-gray-500 text-base">
                  No settings found for "{search}"
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Settings;





// export default function Advanced() {
//   const { userData } = useUserData();

//   const [generalAvd, setGeneralAdv] = useState<any[]>([]);
//   const [lauchPadAdv, setLauchPadAdv] = useState<any[]>([]);
//   const [shortcutsAdv, setShortcutsAdv] = useState<any[]>([]);

//   useEffect(() => {
//     if (userData) {
//       setGeneralAdv([
//         {
//           label: "Developer Mode",
//           toggleFunc: userData?.userName,
//         },
//       ]);

//       setLauchPadAdv([
//         {
//           label: "Reduced Motion",
//         },
//         {
//           label: "Sync with Device Settings",
//         },
//         {
//           label: "Automatically play GIFs when possible.",
//         },
//         {
//           label: "Play animated emojis",
//         },
//       ]);

//       setShortcutsAdv([
//         {
//           label: "Always animate",
//           route: "/(settings)/disableA",
//         },
//         {
//           label: "Animate on interaction",
//           route: "/(settings)/deleteAccount",
//         },
//         {
//           label: "Never animate",
//           route: "/(settings)/deleteAccount",
//         },
//       ]);
//     }
//   }, [userData]);

//   return (
//     <SafeAreaView className="flex-1 bg-lightBackground">
//       <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
//       <Header title="Advanced" />
//       <AdvancedOptions
//         generalAvd={generalAvd}
//         lauchPadAdv={lauchPadAdv}
//         shortcutsAdv={shortcutsAdv}
//       />
//     </SafeAreaView>
//   );
// }

// const AdvancedOptions = ({
//   generalAvd,
//   lauchPadAdv,
//   shortcutsAdv,
// }: {
//   generalAvd: any[];
//   lauchPadAdv: any[];
//   shortcutsAdv: any[];
// }) => {
//   const combinedData = [
//     { type: "header", title: "General" },
//     ...generalAvd.map((item) => ({ ...item, type: "item" })),
//     { type: "header", title: "LaunchPad" },
//     ...lauchPadAdv.map((item) => ({ ...item, type: "item" })),
//     { type: "header", title: "Shortcuts" },
//     ...shortcutsAdv.map((item) => ({ ...item, type: "item" })),
//     ,
//   ];

//   return (
//     <View className="flex-1 px-2">
//       <FlatList
//         data={combinedData}
//         keyExtractor={(item, index) =>
//           item.type === "header" ? `header-${item.title}` : `item-${item.label}`
//         }
//         contentContainerStyle={{ padding: 16 }}
//         renderItem={({ item }) =>
//           item.type === "header" ? (
//             <Text className="text-lg font-semibold mt-4 mb-2 text-black">
//               {item.title}
//             </Text>
//           ) : (
//             <Panel
//               route={item.route}
//               label={item.label}
//               icon={item.icon}
//               seconLabel={item.seconLabel}
//             />
//           )
//         }
//       />
//     </View>
//   );
// };
