import React, { useState, useCallback } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  BodyText,
  Card,
  IconContainer,
  MutedText,
  PageTitle,
  RowLayout,
} from "./dev";

export interface CityResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  display_name: string;
}

export const CitySearchSelector = ({
  selectedCity,
  onCitySelect,
}: {
  selectedCity: CityResult | null;
  onCitySelect: (city: CityResult) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      // Using Nominatim API for global city search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10&featuretype=city&featuretype=town&extratags=1`,
        {
          headers: {
            "User-Agent": "MyCityExplorerApp/1.0",
          },
        }
      );

      const data = await response.json();

      const cities: CityResult[] = data
        .filter(
          (item: any) =>
            item.type === "city" ||
            item.type === "town" ||
            item.type === "administrative" ||
            (item.address && (item.address.city || item.address.town))
        )
        .map((item: any) => ({
          name: item.address?.city || item.address?.town || item.name,
          country: item.address?.country || "",
          state: item.address?.state || item.address?.province || "",
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          display_name: item.display_name,
        }))
        .slice(0, 8);

      setSearchResults(cities);
    } catch (error) {
      console.error("City search error:", error);
      Alert.alert("Search Error", "Unable to search cities. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce the search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCities]);

  const handleCitySelect = (city: CityResult) => {
    onCitySelect(city);
    setShowResults(false);
    setSearchQuery(city.name);
  };

  const renderCityItem = ({ item }: { item: CityResult }) => (
    <TouchableOpacity
      onPress={() => handleCitySelect(item)}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
    >
      <RowLayout>
        <IconContainer size="medium" color="neutral">
          <Ionicons name="location" size={20} color="#6B7280" />
        </IconContainer>
        <View className="ml-4 flex-1">
          <Text className="text-textDark text-lg font-semibold">
            {item.name}
          </Text>
          <MutedText>
            {item.state ? `${item.state}, ${item.country}` : item.country}
          </MutedText>
        </View>
      </RowLayout>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 my-6 py-6">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Search Input */}
        <View className="mb-6">
          <View className="relative">
            <TextInput
              className="w-full border border-gray-200 rounded-2xl px-6 py-4 pr-12 text-lg bg-white text-textDark"
              placeholder="Search for a city..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => searchQuery.length > 1 && setShowResults(true)}
            />
            <View className="absolute right-4 top-4">
              {isLoading ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <Ionicons name="search" size={24} color="#6B7280" />
              )}
            </View>
          </View>

          {/* Selected City Display */}
          {selectedCity && !showResults && (
            <Card className="mt-4 border-2 border-accent bg-accent/5">
              <RowLayout className="justify-between">
                <RowLayout>
                  <IconContainer size="medium" color="accent">
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  </IconContainer>
                  <View className="ml-4">
                    <Text className="text-accent text-lg font-bold">
                      {selectedCity.name}
                    </Text>
                    <MutedText>
                      {selectedCity.state
                        ? `${selectedCity.state}, ${selectedCity.country}`
                        : selectedCity.country}
                    </MutedText>
                  </View>
                </RowLayout>
                <TouchableOpacity
                  onPress={() => {
                    onCitySelect(null as any);
                    setSearchQuery("");
                  }}
                >
                  <IconContainer size="small" color="neutral">
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </IconContainer>
                </TouchableOpacity>
              </RowLayout>
            </Card>
          )}
        </View>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <View className="flex-1">
            <FlatList
              data={searchResults}
              renderItem={renderCityItem}
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
              showsVerticalScrollIndicator={false}
              className="flex-1"
            />
          </View>
        )}

        {/* No Results Message */}
        {showResults &&
          searchResults.length === 0 &&
          !isLoading &&
          searchQuery.length > 1 && (
            <View className="flex-1 justify-center items-center">
              <IconContainer size="large" color="neutral">
                <Ionicons name="location-outline" size={28} color="#6B7280" />
              </IconContainer>
              <Text className="text-textGray text-lg text-center mt-4">
                No cities found for "{searchQuery}"
              </Text>
              <MutedText className="text-center mt-2">
                Try searching with a different spelling or check for typos
              </MutedText>
            </View>
          )}
      </KeyboardAvoidingView>
    </View>
  );
};
