import { useUserData } from "@/Providers/UserDataProvider";
import Header from "@/components/header";
import InputEditor from "@/components/inputEditor";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddByUsername() {
  const [searchQuery, setSearchQuery] = useState("");
  const { searchUsers, isLoading, foundUsers, addFriendByUser } = useUserData();

  const clearSearchQuery = () => {
    setSearchQuery("");
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter a username to search");
      return;
    }
    searchUsers(searchQuery);
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
      <View className="flex-row items-center flex-1">
        <Image
          source={{
            uri:
              item.imageUrl ||
              "https://via.placeholder.com/50x50.png?text=User",
          }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="font-semibold text-lg">{item.userName}</Text>
          {item.firstName || item.lastName ? (
            <Text className="text-gray-600">
              {[item.firstName, item.lastName].filter(Boolean).join(" ")}
            </Text>
          ) : null}
        </View>
      </View>

      {item.isFriend ? (
        <Text className="text-green-600 font-medium">Friends</Text>
      ) : (
        <TouchableOpacity
          className="bg-lightPrimaryAccent px-4 py-2 rounded-lg"
          onPress={() => addFriendByUser(item)}
          disabled={isLoading === item.id}
        >
          {isLoading === item.id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-medium">Add</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#c9c9c9ff" />

      <Header
        title="Add by Username"
        secondActionTitle="Search"
        secondOnPressAction={handleSearch}
      />

      <View className="flex-1 p-4">
        <InputEditor
          data={searchQuery}
          setDataFunc={setSearchQuery}
          clearDataFunc={clearSearchQuery}
        />

        {foundUsers && foundUsers.length > 0 ? (
          <FlatList
            data={foundUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            className="flex-1"
          />
        ) : searchQuery && !isLoading && foundUsers ? (
          <Text className="text-center text-gray-500 mt-8">
            No users found with username "{searchQuery}"
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
