import { useUserData } from "@/Providers/UserDataProvider";
import Loader from "@/components/Loader";
import Header from "@/components/ui/header";
import InputEditor from "@/components/ui/inputEditor";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditNote() {
  const [newNote, setNewNote] = useState("");
  const { userData, isLoading, updateUserNote } = useUserData();
  const router = useRouter();

  //TODO: Use optimistic update instead of showing loader

  useEffect(() => {
    if (userData?.note) {
      setNewNote(userData.note as string);
    }
  }, [userData]);

  const saveNewNote = async () => {
    try {
      console.log("Updating field note");

      await updateUserNote(newNote);

      console.log("Update note successfuly");
      router.back();
    } catch (error) {
      console.error("Error updating note:", error);
      Alert.alert("Error", `Failed to update note. Please try again.`, [
        { text: "OK" },
      ]);
    }
  };

  const resetData = () => {
    setNewNote("");
  };

  if (isLoading) {
    return <Loader purpose="saving" />;
  }

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
