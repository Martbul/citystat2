import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useUserData } from "@/Providers/UserDataProvider";
import { onBackPress } from "@/utils/navigation";

const AddByUsername = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingFriend, setAddingFriend] = useState(null);
  const { userData } = useUserData();

  // Search for users by username
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter a username to search");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/search?username=${encodeURIComponent(searchQuery)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add your auth headers here
        },
      });

      if (!response.ok) {
        throw new Error("Failed to search users");
      }

      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search for users");
    } finally {
      setLoading(false);
    }
  };

  // Add friend functionality
  const addFriend = async (friendUser) => {
    if (!friendUser || !userData) return;

    // Check if trying to add themselves
    if (friendUser.id === userData.id) {
      Alert.alert("Error", "You cannot add yourself as a friend");
      return;
    }

    setAddingFriend(friendUser.id);
    try {
      const response = await fetch("/api/friends/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add your auth headers here
        },
        body: JSON.stringify({
          friendId: friendUser.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add friend");
      }

      Alert.alert("Success", `Added ${friendUser.userName} as a friend!`);
      
      // Remove the user from search results or update their status
      setSearchResults(prev => 
        prev.map(user => 
          user.id === friendUser.id 
            ? { ...user, isFriend: true }
            : user
        )
      );
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", error.message || "Failed to add friend");
    } finally {
      setAddingFriend(null);
    }
  };

  // Render user item
  const renderUserItem = ({ item }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
      <View className="flex-row items-center flex-1">
        <Image
          source={{ 
            uri: item.imageUrl || "https://via.placeholder.com/50x50.png?text=User" 
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
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => addFriend(item)}
          disabled={addingFriend === item.id}
        >
          {addingFriend === item.id ? (
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
          Add by Username
        </Text>
      </View>

      <View className="flex-1 p-4">
        {/* Search input */}
        <View className="flex-row items-center mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 mr-2"
            placeholder="Enter username..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={searchUsers}
          />
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={searchUsers}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search results */}
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            className="flex-1"
          />
        ) : searchQuery && !loading ? (
          <Text className="text-center text-gray-500 mt-8">
            No users found with username "{searchQuery}"
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default AddByUsername;