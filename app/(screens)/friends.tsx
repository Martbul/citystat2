import Header from "@/components/header";
import InputBox from "@/components/inputBox";
import { useUserData } from "@/Providers/UserDataProvider";
import { Friend } from "@/types/user";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Friends() {
  const [search, setSearch] = useState("");
  const { userData, getFriends, isLoading } = useUserData();
  const [friends, setFriends] = useState<Friend[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getFnds = async () => {
      if (userData?.id) {
        const data = await getFriends();
        console.log("Friends data:", data);
        setFriends(data);
      }
    };
    getFnds();
  }, [userData?.id]);

  const handleRefresh = async () => {
    if (userData?.id) {
      const data = await getFriends();
      console.log("Refreshed friends data:", data);
      setFriends(data);
    }
  };

  const filteredFriends = useMemo(() => {
    if (!Array.isArray(friends)) {
      console.log("Friends is not an array:", friends);
      return [];
    }

    if (!search.trim()) {
      return friends;
    }

    return friends.filter((item) =>
      (item.userName || "").toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [friends, search]);

  const SearchHeader = useMemo(
    () => (
      <View className="relative mb-4">
        <InputBox
          val={search}
          valSetFunc={setSearch}
          placeholderTest="Search friends..."
          icon={<EvilIcons name="search" size={28} color="#aaa" />}
        />
      </View>
    ),
    [search]
  );

  const renderFriendItem = ({ item }: { item: Friend }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(screens)/userProfile?userId=${item.id}`)}
        className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-4 mb-2"
      >
        <View className="flex-row items-center space-x-4">
          <View className="w-14 h-14 bg-lightSurface rounded-full flex items-center justify-center">
            <Image className="w-12 h-12" source={{ uri: item.imageUrl }} />
          </View>
          <Text className="text-gray-800 text-base font-medium">
            {item.userName || "Unknown User"}
          </Text>
        </View>
        <AntDesign name="right" size={16} color="#999" />
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    console.log(
      "Rendering empty component. Friends length:",
      friends.length,
      "Search:",
      search
    );

    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-gray-500 text-base">Loading friends...</Text>
        </View>
      );
    }

    if (search.trim()) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-gray-500 text-base">
            No friends found for "{search}"
          </Text>
        </View>
      );
    }

    if (friends.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-gray-500 text-base text-center">
            You haven't added any friends yet.{"\n"}
            Tap "Add Friends" to get started!
          </Text>
        </View>
      );
    }

    return null;
  };

  const handleAddFriendPress = () => {
    router.push("/(screens)/addByUsername");
  };

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />

      <Header
        title="Friends"
        secondActionTitle="Add friends"
        secondOnPressAction={handleAddFriendPress}
      />

      <View className="flex-1">
        <FlatList
          scrollEnabled={true}
          data={filteredFriends}
          keyExtractor={(item) =>
            item.id ||
            item.friendId ||
            item.userName ||
            Math.random().toString()
          }
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={SearchHeader}
          renderItem={renderFriendItem}
          ListEmptyComponent={renderEmptyComponent}
          refreshing={isLoading}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
