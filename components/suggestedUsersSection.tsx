import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Image, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { BodyText, Card, CenteredColumn, RowLayout, SectionSpacing, SectionTitle, SpaceBetweenRow } from "./dev";
import PrimaryButton from "./primaryButton";
import { useUserData } from "@/Providers/UserDataProvider";
import Spinner from "./spinner";


export const SuggestedExplorersSection = () => {
  const { userData, fetchUsersSameCity, isLoading } = useUserData();

  const [usersSameCity, setUsersSameCity] = useState<any[] | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (userData && !hasLoaded) {
      const loadUsers = async () => {
        console.log("Loading users for the first time...");
        try {
          const users = await fetchUsersSameCity();
          console.log("Fetched users:", users);
          setUsersSameCity(users);
          setHasLoaded(true);
        } catch (error) {
          console.error("Failed to load users:", error);
          setUsersSameCity([]);
          setHasLoaded(true);
        }
      };
      loadUsers();
    }
  }, [userData, hasLoaded]); 

  return (
    <SectionSpacing>
      <Card>
        <SpaceBetweenRow>
          <SectionTitle>Suggestions</SectionTitle>
          <TouchableOpacity>
            <RowLayout className="gap-1">
              <AntDesign name="plus" size={20} color="#c8f751" />
              <BodyText className="text-accent">Invite a friend</BodyText>
            </RowLayout>
          </TouchableOpacity>
        </SpaceBetweenRow>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            paddingVertical: 16,
            gap: 12,
          }}
        >
          {isLoading ? (
            <Spinner />
          ) : usersSameCity && usersSameCity.length > 0 ? (
            usersSameCity.map((user) => (
              <SuggestionUserCard
                key={user.id}
                image={user.imageUrl}
                name={user.firstName + " " + user.lastName}
              />
            ))
          ) : (
            <Text className="text-lightMutedText">
              No users found in your city.
            </Text>
          )}

          {/* <SuggestionUserCard
            image="https://cdn-9.motorsport.com/images/mgl/6D1XbeV0/s8/max-verstappen-red-bull-racing.jpg"
            name="Max Verstappen"
          />
          <SuggestionUserCard
            image="https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5498.png"
            name="Charles Leclerc"
          />
          <SuggestionUserCard
            image="https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5498.png"
            name="Lewis Hamilton"
          />
          <SuggestionUserCard
            image="https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5498.png"
            name="Lando Norris"
          /> */}
        </ScrollView>
      </Card>
    </SectionSpacing>
  );
};

// Improved User Card Component
const SuggestionUserCard = ({
  image,
  name,
}: {
  image: string;
  name: string;
}) => {
  return (
    <View className="w-36 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <CenteredColumn>
        <View className="mb-3">
          <Image className="w-20 h-20 rounded-full" source={{ uri: image }} />
        </View>
        <BodyText className="text-center mb-3 text-base">{name}</BodyText>
        <PrimaryButton heading="Follow" />
      </CenteredColumn>
    </View>
  );
};

// Alternative version with more spacing and better visual hierarchy
export const SuggestedExplorersSectionAlternative = () => {
  return (
    <SectionSpacing>
      <View className="bg-lightSurface rounded-3xl p-6">
        <SpaceBetweenRow>
          <SectionTitle>Suggested explorers</SectionTitle>
          <TouchableOpacity activeOpacity={0.7}>
            <RowLayout className="gap-2 bg-white/50 rounded-full px-3 py-2">
              <View className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <AntDesign name="plus" size={14} color="white" />
              </View>
              <BodyText className="text-accent text-base font-semibold">
                Invite friend
              </BodyText>
            </RowLayout>
          </TouchableOpacity>
        </SpaceBetweenRow>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{
            flexDirection: "row",
            paddingHorizontal: 4,
            gap: 16,
          }}
        >
          <EnhancedSuggestionCard
            image="https://cdn-9.motorsport.com/images/mgl/6D1XbeV0/s8/max-verstappen-red-bull-racing.jpg"
            name="Max Verstappen"
            mutual="3 mutual"
          />
          <EnhancedSuggestionCard
            image="https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5498.png"
            name="Charles Leclerc"
            mutual="1 mutual"
          />
          <EnhancedSuggestionCard
            image="https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5498.png"
            name="Lewis Hamilton"
            mutual="5 mutual"
          />
          <EnhancedSuggestionCard
            image="https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5498.png"
            name="Lando Norris"
            mutual="2 mutual"
          />
        </ScrollView>
      </View>
    </SectionSpacing>
  );
};

// Enhanced Card with mutual connections
const EnhancedSuggestionCard = ({
  image,
  name,
  mutual,
}: {
  image: string;
  name: string;
  mutual: string;
}) => {
  return (
    <Card className="w-40 p-4">
      <CenteredColumn>
        <View className="mb-3 relative">
          <Image className="w-24 h-24 rounded-full" source={{ uri: image }} />
          {/* Online indicator */}
          <View className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </View>

        <BodyText className="text-center mb-1 text-base font-semibold">
          {name}
        </BodyText>

        <Text className="text-textGray text-sm mb-4 text-center">{mutual}</Text>

        <PrimaryButton heading="Follow" />
      </CenteredColumn>
    </Card>
  );
};
