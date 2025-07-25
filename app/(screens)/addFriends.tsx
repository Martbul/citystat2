import * as Clipboard from 'expo-clipboard';
import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Share, Alert, Linking } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useUserData } from "@/Providers/UserDataProvider";
import { onBackPress } from "@/utils/navigation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
const AddFriends = () => {
  const [loading, setLoading] = useState(false);
  const { userData } = useUserData();
  const router = useRouter();

  const API_BASE_URL =
    process.env.EXPO_PUBLIC_CITYSTAT_API_URL
  // Generate invite link (you'll need to customize this based on your app's deep linking setup)
  const generateInviteLink = () => {
    const baseUrl = API_BASE_URL+ "/invite"; // Replace with your actual app URL
    const inviteCode = userData?.id || "defaultcode";
    return `${baseUrl}?invitedBy=${inviteCode}&userName=${userData?.userName || ''}`;
  };

   // Share invite functionality
  const handleShareInvite = async () => {
    try {
      const inviteLink = generateInviteLink();
      const message = `Hey! Join me on [Your App Name]. Use this link to connect: ${inviteLink}`;
      
      await Share.share({
        message: message,
        url: inviteLink, // iOS specific
        title: "Join me on [Your App Name]",
      });
    } catch (error) {
      console.error("Error sharing invite:", error);
      Alert.alert("Error", "Failed to share invite link");
    }
  };

    // Copy link functionality
 const handleCopyLink = async () => {
  try {
    const inviteLink = generateInviteLink();
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert("Success", "Invite link copied to clipboard!");
  } catch (error) {
    console.error("Error copying link:", error);
    Alert.alert("Error", "Failed to copy link");
  }
};


   // Open messages app
  const handleMessages = () => {
    const inviteLink = generateInviteLink();
    const message = `Hey! Join me on [Your App Name]: ${inviteLink}`;
    const url = `sms:?body=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert("Error", "Messages app is not available");
        }
      })
      .catch((error) => {
        console.error("Error opening messages:", error);
        Alert.alert("Error", "Failed to open messages app");
      });
  };

  // Open email app
  const handleEmail = () => {
    const inviteLink = generateInviteLink();
    const subject = "Join me on [Your App Name]";
    const body = `Hey!\n\nI'd love for you to join me on [Your App Name]. Click this link to get started:\n\n${inviteLink}\n\nSee you there!`;
    
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert("Error", "Email app is not available");
        }
      })
      .catch((error) => {
        console.error("Error opening email:", error);
        Alert.alert("Error", "Failed to open email app");
      });
  };

 
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
          Add Friends
        </Text>
      </View>

      <View className="flex-col flex-1 gap-3">
        {/* Action buttons row */}
        <View className="flex flex-row justify-evenly p-4">
          <TouchableOpacity 
            className="flex items-center gap-2"
            onPress={handleShareInvite}
            disabled={loading}
          >
            <Feather name="upload" size={24} color="black" />
            <Text>Share Invite</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex items-center gap-2"
            onPress={handleCopyLink}
            disabled={loading}
          >
            <MaterialIcons name="content-copy" size={24} color="black" />
            <Text>Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex items-center gap-2"
            onPress={handleMessages}
            disabled={loading}
          >
            <FontAwesome6 name="message" size={24} color="black" />
            <Text>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex items-center gap-2"
            onPress={handleEmail}
            disabled={loading}
          >
            <Feather name="mail" size={24} color="black" />
            <Text>Email</Text>
          </TouchableOpacity>
        </View>

        {/* Add by username option */}
        <TouchableOpacity 
          className="flex flex-row justify-between px-4 p-2"
          onPress={() => router.push("/(screens)/addByUsername")} 
          disabled={loading}
        >
          <View className="flex flex-row gap-2">
            <Entypo name="email" size={24} color="black" />
            <Text>Add by Username</Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddFriends;
