import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Image, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import {
  BodyText,
  Card,
  CenteredColumn,
  RowLayout,
  SectionSpacing,
  SectionTitle,
  SpaceBetweenRow,
} from "./dev";
import PrimaryButton from "./primaryButton";
import { useUserData } from "@/Providers/UserDataProvider";
import Spinner from "./spinner";
import { UserData } from "@/types/user";
import { useRouter } from "expo-router";

export const SuggestedExplorersSection = () => {
  const { userData, fetchUsersSameCity, isLoading, addFriendByUser } =
    useUserData();
  const [usersSameCity, setUsersSameCity] = useState<UserData[] | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (userData && !hasLoaded) {
      const loadUsers = async () => {
        try {
          const response = await fetchUsersSameCity();
          const usersArray = response?.users || [];
          setUsersSameCity(usersArray);
          setHasLoaded(true);
        } catch (error) {
          console.error("Failed to load users:", error);
          setUsersSameCity([]);
          setHasLoaded(true);
        }
      };
      loadUsers();
    }
  }, [userData, hasLoaded, fetchUsersSameCity]);

  const addFriend = (
    friendUser: Pick<
      UserData,
      "id" | "firstName" | "lastName" | "imageUrl" | "userName"
    >
  ) => {
    addFriendByUser(friendUser);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={{ paddingVertical: 16, alignItems: "center" }}>
          <Spinner />
        </View>
      );
    }

    if (!usersSameCity || usersSameCity.length === 0) {
      return (
        <View style={{ paddingVertical: 16, alignItems: "center" }}>
          <BodyText>No users found in your city.</BodyText>
        </View>
      );
    }

    return usersSameCity.map((user) => (
      <SuggestionUserCard key={user.id} user={user} addFriend={addFriend} />
    ));
  };

  return (
    <SectionSpacing>
      <Card>
        <SpaceBetweenRow>
          <SectionTitle>Suggestions</SectionTitle>
          <TouchableOpacity
            onPress={() => router.push("/(screens)/addByUsername")}
          >
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
          {renderContent()}
        </ScrollView>
      </Card>
    </SectionSpacing>
  );
};

const SuggestionUserCard = ({
  user,
  addFriend,
}: {
  user: UserData;
  addFriend: (
    friendUser: Pick<
      UserData,
      "id" | "firstName" | "lastName" | "imageUrl" | "userName"
    >
  ) => void;
}) => {
  const handleAddFriend = () => {
    const friendUserData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      userName: user.userName,
    };
    addFriend(friendUserData);
  };

  return (
    <View className="w-36 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <CenteredColumn>
        <View className="mb-3">
          <Image
            className="w-20 h-20 rounded-full"
            source={{
              uri: user.imageUrl,
            }}
          />
        </View>
        <BodyText className="text-center mb-3 text-base">
          {`${user.firstName} ${user.lastName}`}
        </BodyText>
        <PrimaryButton heading="Add" onPressAction={handleAddFriend} />
      </CenteredColumn>
    </View>
  );
};
