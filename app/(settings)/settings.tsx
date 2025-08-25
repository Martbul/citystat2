import InputBox from "@/components/inputBox";
import Panel from "@/components/panel";
import Header from "@/components/header";
import { settings } from "@/data/settingsData";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import React, { useMemo, useState } from "react";
import { FlatList, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardTitle, ClickableCard, IconContainer, RowLayout, SectionSpacing } from "@/components/dev";
import { Ionicons } from "@expo/vector-icons";
import SettingsPannel from "@/components/settingsPanel";

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
          icon={<EvilIcons name="search" size={32} color="#aaa" />}
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
           <SettingsPannel  route={item.route} label={item.label} icon={item.icon()} />
            //<Panel route={item.route} label={item.label} icon={item.icon()} />
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
