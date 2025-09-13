import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  Alert,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  Card,
  GradientHeader,
  HeaderButton,
  MutedText,
  PageContainer,
  RowLayout,
  SectionTitle,
} from "../dev";
import { Feather } from "@expo/vector-icons";
import { useUserData } from "@/Providers/UserDataProvider";
import { useRouter } from "expo-router";
import InputEditor from "../inputEditor";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: screenHeight } = Dimensions.get("window");

const categories = ["All", "Friends", "City", "Country"];

// Types for recent searches
interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
  type: 'user' | 'general';
}

interface RecentUser {
  id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  timestamp: number;
}

export const UserSearcherDrawer = ({
  isTopSearchDrawerOpen,
  slideAnim,
  overlayOpacity,
  closeDrawer,
}: {
  isTopSearchDrawerOpen: boolean;
  slideAnim: Animated.Value;
  overlayOpacity: Animated.Value;
  closeDrawer: () => void;
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [showingResults, setShowingResults] = useState(false);
  
  const { userData, searchUsers, foundUsers, isLoading } = useUserData();
  const router = useRouter();

  // Load recent searches and users on component mount
  useEffect(() => {
    loadRecentData();
  }, []);

  // Reset results when drawer closes
  useEffect(() => {
    if (!isTopSearchDrawerOpen) {
      setShowingResults(false);
      setSearch("");
    }
  }, [isTopSearchDrawerOpen]);

  const loadRecentData = async () => {
    try {
      const [searches, users] = await Promise.all([
        AsyncStorage.getItem('recentSearches'),
        AsyncStorage.getItem('recentUsers')
      ]);
      
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
      if (users) {
        setRecentUsers(JSON.parse(users));
      }
    } catch (error) {
      console.error('Error loading recent data:', error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    try {
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: Date.now(),
        type: 'user'
      };

      // Remove duplicate and add to beginning, keep max 10
      const updated = [newSearch, ...recentSearches.filter(s => s.query !== query.trim())].slice(0, 10);
      
      setRecentSearches(updated);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const saveRecentUser = async (user: any) => {
    try {
      const newUser: RecentUser = {
        id: user.id,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        timestamp: Date.now()
      };

      // Remove duplicate and add to beginning, keep max 10
      const updated = [newUser, ...recentUsers.filter(u => u.id !== user.id)].slice(0, 10);
      
      setRecentUsers(updated);
      await AsyncStorage.setItem('recentUsers', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent user:', error);
    }
  };

  const removeRecentSearch = async (id: string) => {
    try {
      const updated = recentSearches.filter(s => s.id !== id);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  const removeRecentUser = async (id: string) => {
    try {
      const updated = recentUsers.filter(u => u.id !== id);
      setRecentUsers(updated);
      await AsyncStorage.setItem('recentUsers', JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing recent user:', error);
    }
  };

  const clearSearchQuery = () => {
    setSearch("");
    setShowingResults(false);
  };

  const handleSearch = async () => {
    const safeSearch = search.trim();
    if (!safeSearch) {
      Alert.alert("Error", "Please enter a username to search");
      return;
    }
    
    setShowingResults(true);
    await saveRecentSearch(safeSearch);
    searchUsers(safeSearch);
  };

  const handleRecentSearchPress = (query: string) => {
    setSearch(query);
    setShowingResults(true);
    searchUsers(query);
  };

  const handleUserPress = async (user: any) => {
    await saveRecentUser(user);
    // Navigate to user profile or handle user selection
    router.push(`/profile/${user.id}`);
    closeDrawer();
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => handleUserPress(item)}
      className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white"
    >
      <View className="flex-row items-center flex-1">
        <Image
          source={{
            uri: item.imageUrl || "https://via.placeholder.com/50x50.png?text=User",
          }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="font-semibold text-lg text-textDark">{item.userName}</Text>
          {item.firstName || item.lastName ? (
            <Text className="text-gray-600 text-sm">
              {[item.firstName, item.lastName].filter(Boolean).join(" ")}
            </Text>
          ) : null}
        </View>
      </View>
      <Feather name="arrow-right" size={16} color="#6B7280" />
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }: { item: RecentSearch }) => (
    <Card className="flex-row items-center mb-3">
      <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
        <AntDesign name="clockcircleo" size={16} color="#6B7280" />
      </View>
      <TouchableOpacity 
        className="flex-1" 
        onPress={() => handleRecentSearchPress(item.query)}
      >
        <MutedText className="text-lg text-textDark">{item.query}</MutedText>
        <MutedText className="text-sm text-textGray mt-1">
          {new Date(item.timestamp).toLocaleDateString()}
        </MutedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeRecentSearch(item.id)}>
        <Feather name="x" size={18} color="#9ca3af" />
      </TouchableOpacity>
    </Card>
  );

  const renderRecentUser = ({ item }: { item: RecentUser }) => (
    <Card className="flex-row items-center mb-3">
      <Image
        source={{
          uri: item.imageUrl || "https://via.placeholder.com/32x32.png?text=U",
        }}
        className="w-8 h-8 rounded-full mr-3"
      />
      <TouchableOpacity 
        className="flex-1" 
        onPress={() => handleUserPress(item)}
      >
        <MutedText className="text-lg text-textDark">{item.userName}</MutedText>
        {item.firstName || item.lastName ? (
          <MutedText className="text-sm text-textGray mt-1">
            {[item.firstName, item.lastName].filter(Boolean).join(" ")}
          </MutedText>
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeRecentUser(item.id)}>
        <Feather name="x" size={18} color="#9ca3af" />
      </TouchableOpacity>
    </Card>
  );

  const hasRecentData = recentSearches.length > 0 || recentUsers.length > 0;
  const shouldShowRecent = !showingResults && hasRecentData;
  const shouldShowResults = showingResults && (foundUsers?.length > 0 || (!isLoading && search.trim()));

  return (
    <>
      <Animated.View
        style={{
          position: "absolute",
          width: "100%",
          height: "160%",
          backgroundColor: "#00000099",
          opacity: overlayOpacity,
          zIndex: 10,
        }}
        pointerEvents={isTopSearchDrawerOpen ? "auto" : "none"}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={closeDrawer}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: screenHeight * 0.7,
          transform: [{ translateY: slideAnim }],
          backgroundColor: "#F8F8F8",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          zIndex: 20,
        }}
        pointerEvents={isTopSearchDrawerOpen ? "auto" : "none"}
      >
        <PageContainer className="rounded-b-3xl flex-1">
          {/* Search Bar */}
          <View className="mb-3 mt-8">
            <InputEditor
              data={search}
              setDataFunc={setSearch}
              clearDataFunc={clearSearchQuery}
              onSubmitEditing={handleSearch}
              placeholder="Search users..."
            />
            
            {search.trim() && !showingResults && (
              <TouchableOpacity 
                onPress={handleSearch}
                className="bg-accent rounded-lg px-4 py-2 mt-2 self-end"
              >
                <Text className="text-white font-semibold">Search</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category Tabs */}
          <RowLayout className="px-4 space-x-3 mb-4 gap-4">
            {categories.map((c, idx) => (
              <TouchableOpacity
                onPress={() => setSelectedFilter(c)}
                key={idx}
                className={`px-5 py-2 rounded-full ${
                  selectedFilter === c ? "bg-accent" : "bg-gray-100"
                }`}
              >
                <MutedText
                  className={`text-sm ${
                    selectedFilter === c
                      ? "text-white font-semibold"
                      : "text-textDark"
                  }`}
                >
                  {c}
                </MutedText>
              </TouchableOpacity>
            ))}
          </RowLayout>

          {/* Loading State */}
          {isLoading && (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">Searching...</Text>
            </View>
          )}

          {/* Search Results */}
          {shouldShowResults && (
            <View className="flex-1">
              {foundUsers && foundUsers.length > 0 ? (
                <>
                  <View className="px-4 mb-2">
                    <SectionTitle>Search Results</SectionTitle>
                  </View>
                  <FlatList
                    data={foundUsers}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id}
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                  />
                </>
              ) : (
                <View className="flex-1 justify-center items-center px-4">
                  <AntDesign name="frowno" size={48} color="#9CA3AF" />
                  <Text className="text-center text-gray-500 mt-4 text-lg">
                    No users found
                  </Text>
                  <Text className="text-center text-gray-400 mt-2">
                    Try searching for a different username
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Recent Section */}
          {shouldShowRecent && (
            <View className="flex-1">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <>
                  <View className="px-4 mb-2">
                    <SectionTitle>Recent Searches</SectionTitle>
                  </View>
                  <FlatList
                    data={recentSearches.slice(0, 5)} // Show max 5 recent searches
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                      paddingHorizontal: 16,
                      paddingBottom: 16,
                    }}
                    renderItem={renderRecentSearch}
                    showsVerticalScrollIndicator={false}
                  />
                </>
              )}

              {/* Recent Users */}
              {recentUsers.length > 0 && (
                <>
                  <View className="px-4 mb-2">
                    <SectionTitle>Recent Users</SectionTitle>
                  </View>
                  <FlatList
                    data={recentUsers.slice(0, 5)} // Show max 5 recent users
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                      paddingHorizontal: 16,
                      paddingBottom: 32,
                    }}
                    renderItem={renderRecentUser}
                    showsVerticalScrollIndicator={false}
                  />
                </>
              )}
            </View>
          )}

          {/* Empty State */}
          {!shouldShowRecent && !shouldShowResults && !isLoading && (
            <View className="flex-1 justify-center items-center px-4">
              <AntDesign name="search1" size={48} color="#9CA3AF" />
              <Text className="text-center text-gray-500 mt-4 text-lg">
                Start typing to search
              </Text>
              <Text className="text-center text-gray-400 mt-2">
                Find users by their username
              </Text>
            </View>
          )}
        </PageContainer>
      </Animated.View>
    </>
  );
};