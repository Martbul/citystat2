import { useUserData } from "@/Providers/UserDataProvider";
import { onBackPress } from "@/utils/navigation";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Friends = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { friends } = useUserData();

  const filteredFriends = useMemo(() => {
    if (!search.trim()) {
      return friends;
    }

    return friends.filter((item) =>
      item.username.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [friends]);

  const SearchHeader = useMemo(
    () => (
      <View className="relative mb-4">
        <TextInput
          value={search}
          placeholder="Search settings..."
          onChangeText={setSearch}
          className="bg-white pl-12 pr-4 py-3 rounded-lg font-medium text-base border border-neutral-300"
          placeholderTextColor="#aaa"
        />
        <EvilIcons
          name="search"
          size={24}
          color="#aaa"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: [{ translateY: -12 }],
          }}
        />
      </View>
    ),
    [search]
  );

  return (
    <>
      <SafeAreaView className="flex-1 bg-lightBackground">
        <View className="relative flex-row items-center p-4 py-6 mt-10 border-b border-lightNeutralGray">
          <TouchableOpacity className="absolute left-4" style={{ zIndex: 10 }}>
            <AntDesign
              onPress={onBackPress}
              name="arrowleft"
              size={28}
              color="#333333ff"
            />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lightBlackText font-bold text-2xl">
            Friends
          </Text>
          <TouchableOpacity onPress={() => router.push("/(screens)/addFriends")} className="absolute right-4" style={{ zIndex: 10 }}>
            <Text className="text-lightPrimaryAccent font-bold text-lg">
              Add Friends
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <FlatList
            scrollEnabled={true}
            data={filteredFriends}
            keyExtractor={(item) => item.username}
            contentContainerStyle={{ padding: 16 }}
            ListHeaderComponent={SearchHeader}
            renderItem={({ item }) => (
              <TouchableOpacity className="flex-row items-center justify-between bg-lightSurface border-lightContainerBg rounded-xl px-4 py-4 mb-2">
                <View className="flex-row items-center space-x-4">
                  {item.imageUrl}
                  <Text className="text-lightBlackText text-base">
                    {item.username}
                  </Text>
                </View>
                <AntDesign name="right" size={16} color="#999" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={() =>
              search.trim() ? (
                <View className="flex-1 items-center justify-center py-8">
                  <Text className="text-gray-500 text-base">
                    No friends found for "{search}"
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default Friends;
