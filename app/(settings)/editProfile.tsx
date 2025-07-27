import Header from "@/components/ui/header";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditProfileScreen = () => {
  const [displayName, setDisplayName] = useState("Martin Kovachki");
  const [pronouns, setPronouns] = useState("");
  const [aboutMe, setAboutMe] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Edit Profile" secondActionTitle="Save" />
      <ScrollView className="flex-1 bg-lightBackground">
        {/* <View className="bg-lightBackground px-4 pt-6 pb-14 relative">
          
                             //TODO: v2 add the edit bg 

          <TouchableOpacity className="absolute top-4 right-4 bg-darkSurface rounded-full p-2">
            <Ionicons name="pencil" size={16} color="#ffffff" />
          </TouchableOpacity>

       
          <View className="items-center mb-6 mt-8">
            <Text className="text-white text-2xl font-anybodyBold mb-1">
              Martin Kovachki
            </Text>
            <View className="flex-row items-center">
              <Text className="text-muted font-anybody">martinkovachki</Text>
              <View className="w-1 h-1 bg-accent rounded-full mx-2" />
              <Text className="text-accent text-xs">#</Text>
            </View>
          </View>
        </View> */}

              {/* //TODO: Change to flex */}
        <View className="absolute top-[20px] left-14 -ml-10 z-10">
          <View className="relative">
            <View className="w-32 h-32 bg-darkSurface rounded-full items-center justify-center border-4 border-lightBackground">
              <Text className="text-white text-2xl font-anybodyBold">MB</Text>
            </View>

            <TouchableOpacity className="absolute -top-1 -right-1 bg-darkSurface rounded-full p-2 border-2 border-lightBackground">
              <Ionicons name="pencil" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="pt-36 px-4">
          {/* 
                   //TODO: v2 add the edit status

          <View className="items-center mb-6">
            <TouchableOpacity className="flex-row items-center bg-darkSurface rounded-full px-4 py-2">
              <Ionicons name="add" size={16} color="#ffffff" className="mr-2" />
              <Text className="text-white font-anybody ml-2">Add Status</Text>
            </TouchableOpacity>
          </View> */}

          <View className="mb-6">
            <Text className="text-lightBlackText font-anybody mb-2">
              Display Name
            </Text>
            <View className="bg-darkSurface rounded-lg px-4 py-3 flex-row items-center">
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                className="flex-1 text-white font-anybody"
                placeholderTextColor="#cecece"
              />
              <TouchableOpacity onPress={() => setDisplayName("")}>
                <Ionicons name="close" size={20} color="#cecece" />
              </TouchableOpacity>
            </View>
          </View>

          {/* About Me */}
          <View className="mb-6">
            <Text className="text-lightBlackText font-anybody mb-2">
              About Me
            </Text>
            <TextInput
              value={aboutMe}
              onChangeText={setAboutMe}
              multiline
              numberOfLines={4}
              className="bg-darkSurface rounded-lg px-4 py-3 text-white font-anybody min-h-[100px]"
              placeholderTextColor="#cecece"
              textAlignVertical="top"
            />
          </View>

          {/*//TODO: v2 add Avatar Decoration */}
          {/* <View className="mb-6">
            <Text className="text-lightBlackText font-anybody mb-2">
              Avatar Decoration
            </Text>
            <View className="bg-darkSurface rounded-lg p-4 items-center justify-center min-h-[60px]">
              <Text className="text-muted font-anybody">
                No decoration selected
              </Text>
            </View>
          </View>
          <View className="mb-6">
            <Text className="text-lightBlackText font-anybody mb-2">
              Profile Effect
            </Text>
            <View className="bg-darkSurface rounded-lg p-4 items-center justify-center min-h-[60px]">
              <Text className="text-muted font-anybody">None</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lightBlackText font-anybody mb-2">
              Nameplate
            </Text>
            <View className="bg-darkSurface rounded-lg p-4 items-center justify-center min-h-[60px]">
              <Text className="text-muted font-anybody">None</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lightBlackText font-anybody mb-2">
              Legacy Username Badge
            </Text>
            <View className="bg-darkSurface rounded-lg p-4 items-center justify-center min-h-[60px]">
              <Text className="text-muted font-anybody">None</Text>
            </View>
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
