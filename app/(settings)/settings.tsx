import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
} from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { settings } from "@/data/settingsData";
import Header from "@/components/ui/header";
import InputBox from "@/components/inputBox";
import { useRouter } from "expo-router";

const Settings = () => {
  const [search, setSearch] = useState("");
  const router = useRouter()

  const filteredSettings = useMemo(() => {
    if (!search.trim()) {
      return settings;
    }

    return settings.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [search]);

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
            <TouchableOpacity onPress={() => router.push(item.route)} className="flex-row items-center justify-between bg-lightSurface border-lightContainerBg rounded-xl px-4 py-4 mb-2">
              <View className="flex-row items-center space-x-4">
                {item.icon()}
                <Text className="text-lightBlackText text-base">
                  {item.label}
                </Text>
              </View>
              <AntDesign name="right" size={16} color="#999" />
            </TouchableOpacity>
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
