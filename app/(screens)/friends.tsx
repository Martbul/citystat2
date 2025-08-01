import InputBox from "@/components/inputBox";
import Header from "@/components/ui/header";
import { useUserData } from "@/Providers/UserDataProvider";
import { Friend } from "@/types/user";
import { useAuth } from "@clerk/clerk-expo";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Friends() {
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const { userData } = useUserData();
  const router = useRouter();
  const API_BASE_URL = process.env.EXPO_PUBLIC_CITYSTAT_API_URL;
  const { getToken } = useAuth();

  const getFriends = async (): Promise<void> => {
    console.log("Fetching friends for user:", userData?.id);
    if (loading) return; // Prevent multiple simultaneous requests

    setLoading(true);
    try {
      const token = await getToken();

      const response = await fetch(`${API_BASE_URL}/api/friends/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch friends: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Friends response:", responseData);

      // Fix: Extract friends array from response object
      const friendsData: Friend[] = responseData.friends || [];
      console.log("Friends data:", friendsData);
      setFriends(friendsData);
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", "Failed to load friends. Please try again.", [
        { text: "OK" },
      ]);
      // Set empty array on error to prevent undefined issues
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      getFriends();
    }
  }, [userData?.id]);

  const filteredFriends = useMemo(() => {
    // Fix: Add safety check to ensure friends is always an array
    if (!Array.isArray(friends)) {
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
                       <Image
                         className="w-12 h-12"
                         source={{ uri: item.imageUrl }}
                       ></Image>
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
          refreshing={loading}
          onRefresh={getFriends}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
