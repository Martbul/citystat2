import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useUserData } from "@/Providers/UserDataProvider";
import { onBackPress } from "@/utils/navigation";


export default function EditNote () {
  const [newNote, setNewNote] = useState('');
   const {note} = useUserData()
   //TODO: Set newNote to note when the page ;loads

  return (
    <>
        <SafeAreaView className="flex-1 bg-lightBackground">
          <View className="relative flex-row items-center p-4 py-6 mt-10 border-b border-lightNeutralGray">
            <TouchableOpacity
              className="absolute left-4"
              style={{ zIndex: 10 }}
            >
              <AntDesign
                onPress={onBackPress}
                name="arrowleft"
                size={28}
                color="#333333ff"
              />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-lightBlackText font-bold text-2xl">
              Edit Note
            </Text>

            <TouchableOpacity
              className="absolute right-4"
              style={{ zIndex: 10 }}
            >
             <Text className="text-lightPrimaryAccent font-bold text-lg">Save</Text>
            </TouchableOpacity>
            
          </View>

          <View className="flex-1">
           <Text>{"Note (only visible to you)"}</Text>
           <TextInput   
        placeholder="Type something..."
        value={newNote}
        onChangeText={setNewNote}>

           </TextInput>
          </View>
        </SafeAreaView>
    </>
  );
};

