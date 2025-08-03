import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import { useUserData } from "@/Providers/UserDataProvider";
import Header from "@/components/ui/header";
import { SafeAreaView } from "react-native-safe-area-context";
import InputEditor from "@/components/ui/inputEditor";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function EditNote() {
  const [newNote, setNewNote] = useState("");
  const { userData, setUserData } = useUserData();
  const { getToken } = useAuth();
  const router = useRouter();
  const API_BASE_URL = process.env.EXPO_PUBLIC_CITYSTAT_API_URL;

  useEffect(() => {
    if (userData?.note) {
      setNewNote(userData.note as string);
    }
  }, [userData]);

  const saveNewNote = async () => {
    try {
      const token = await getToken();
      const newData = {
        newNote: newNote,
      };

      const response = await fetch(`${API_BASE_URL}/api/user/note`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update note: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("response:", responseData);
      setUserData(responseData);
      router.back();
    } catch (error) {
      console.error("Error editing note:", error);
      Alert.alert("Error", "Failed to edit note. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const resetData = () => {
    setNewNote("");
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-lightBackground">
        <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
        <Header
          title="Note"
          secondActionTitle="Save"
          secondOnPressAction={saveNewNote}
        />

        <View className="flex my-2">
          <Text className="p-1 mx-2 text-lightPrimaryAccent font-bold">
            Your Note
          </Text>

          <InputEditor
            data={newNote}
            setDataFunc={setNewNote}
            clearDataFunc={resetData}
          />
        </View>
      </SafeAreaView>
    </>
  );
}
