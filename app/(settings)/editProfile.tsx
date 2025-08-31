import InputEditor from "@/components/inputEditor";
import Header from "@/components/header";
import { useUserData } from "@/Providers/UserDataProvider";
import { useImageUploader } from "@/utils/uploadthing";
import { Ionicons, Feather } from "@expo/vector-icons";
import { openSettings } from "expo-linking";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import {
  PageContainer,
  Card,
  IconContainer,
  RowLayout,
  SectionSpacing,
  BodyText,
  MutedText,
  CardTitle,
} from "@/components/dev";

const EditProfileScreen = () => {
  const { userData } = useUserData();

  useEffect(() => {
    const dsName = userData?.firstName! + " " + userData?.lastName;
    setDisplayName(dsName);
    setUserProfilePic(userData?.imageUrl!);
  }, [userData]);

  const [displayName, setDisplayName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [userProfilePic, setUserProfilePic] = useState("");

  const { openImagePicker, isUploading } = useImageUploader("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload completed:", res);
      Alert.alert("Upload Completed", "Your profile picture has been updated successfully!");
      if (res && res[0]) {
        setUserProfilePic(res[0].url);
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      Alert.alert("Upload Error", error.message);
    },
  });

  const handleImagePick = () => {
    openImagePicker({
      source: "library",
      onInsufficientPermissions: () => {
        Alert.alert(
          "Camera Permission Required",
          "Please grant access to your photo library to upload a profile picture.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: openSettings },
          ]
        );
      },
    });
  };

  const abtMeClearData = () => {
    setAboutMe("");
  };

  const displayNameClearData = () => {
    setDisplayName("");
  };

  return (
    <PageContainer>
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Edit Profile" secondActionTitle="Save" />
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Profile Header Section */}
        <View className="px-4 pt-6">
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 items-center py-8">
            {/* Profile Picture */}
            <View className="relative mb-4">
              <View className="w-32 h-32 bg-containerBg rounded-full overflow-hidden shadow-lg">
                {userProfilePic ? (
                  <Image
                    className="w-32 h-32"
                    source={{ uri: userProfilePic }}
                    style={{ borderRadius: 64 }}
                  />
                ) : (
                  <View className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <Ionicons name="person" size={48} color="#9CA3AF" />
                  </View>
                )}
                
                {isUploading && (
                  <View className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <View className="bg-white/20 rounded-full p-3">
                      <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                  </View>
                )}
              </View>

              {/* Edit Button */}
              <TouchableOpacity
                className="absolute -bottom-2 -right-2 bg-accent rounded-full p-3 shadow-lg border-4 border-white"
                onPress={handleImagePick}
                disabled={isUploading}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Current Name Display */}
            <CardTitle className="text-center mb-1">
              {displayName || "Your Name"}
            </CardTitle>
            <MutedText className="text-center">
              @{userData?.userName || "username"}
            </MutedText>
          </Card>
        </View>

        <View className="px-4">
          <SectionSpacing>
            <Card>
              <RowLayout className="mb-4">
                <IconContainer size="medium" color="blue" className="mr-3">
                  <Feather name="user" size={20} color="#2563EB" />
                </IconContainer>
                <View className="flex-1">
                  <CardTitle className="mb-1">Display Name</CardTitle>
                  <MutedText className="text-sm">
                    This is how others will see your name
                  </MutedText>
                </View>
              </RowLayout>
              <InputEditor
                data={displayName}
                clearDataFunc={displayNameClearData}
                setDataFunc={setDisplayName}
              />
            </Card>
          </SectionSpacing>

          <SectionSpacing>
            <Card>
              <RowLayout className="mb-4">
                <IconContainer size="medium" color="green" className="mr-3">
                  <Feather name="edit-3" size={20} color="#059669" />
                </IconContainer>
                <View className="flex-1">
                  <CardTitle className="mb-1">About Me</CardTitle>
                  <MutedText className="text-sm">
                    Tell others a bit about yourself
                  </MutedText>
                </View>
              </RowLayout>
              <InputEditor
                data={aboutMe}
                clearDataFunc={abtMeClearData}
                setDataFunc={setAboutMe}
              />
            </Card>
          </SectionSpacing>

          <SectionSpacing>
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
              <RowLayout className="mb-4">
                <IconContainer size="medium" color="transparent" className="bg-purple-100 mr-3">
                  <Ionicons name="stats-chart" size={20} color="#7C3AED" />
                </IconContainer>
                <CardTitle>Profile Completion</CardTitle>
              </RowLayout>
              
              <View className="space-y-3">
                <RowLayout className="justify-between">
                  <RowLayout className="flex-1">
                    <View className={`w-2 h-2 rounded-full mr-3 ${userProfilePic ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <BodyText className="flex-1">Profile Picture</BodyText>
                  </RowLayout>
                  {userProfilePic && <Ionicons name="checkmark" size={16} color="#059669" />}
                </RowLayout>
                
                <RowLayout className="justify-between">
                  <RowLayout className="flex-1">
                    <View className={`w-2 h-2 rounded-full mr-3 ${displayName ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <BodyText className="flex-1">Display Name</BodyText>
                  </RowLayout>
                  {displayName && <Ionicons name="checkmark" size={16} color="#059669" />}
                </RowLayout>
                
                <RowLayout className="justify-between">
                  <RowLayout className="flex-1">
                    <View className={`w-2 h-2 rounded-full mr-3 ${aboutMe ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <BodyText className="flex-1">About Me</BodyText>
                  </RowLayout>
                  {aboutMe && <Ionicons name="checkmark" size={16} color="#059669" />}
                </RowLayout>
              </View>
              
              <View className="mt-4">
                <View className="bg-white/60 h-2 rounded-full overflow-hidden">
                  <View 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((userProfilePic ? 1 : 0) + (displayName ? 1 : 0) + (aboutMe ? 1 : 0)) / 3 * 100}%` 
                    }}
                  />
                </View>
                <MutedText className="text-xs text-center mt-2">
                  {Math.round(((userProfilePic ? 1 : 0) + (displayName ? 1 : 0) + (aboutMe ? 1 : 0)) / 3 * 100)}% Complete
                </MutedText>
              </View>
            </Card>
          </SectionSpacing>

          <SectionSpacing>
            <Card className="bg-blue-50 border-blue-100">
              <RowLayout className="mb-3">
                <IconContainer size="small" color="transparent" className="bg-blue-100 mr-3">
                  <Ionicons name="bulb" size={16} color="#2563EB" />
                </IconContainer>
                <CardTitle className="text-blue-700">Profile Tips</CardTitle>
              </RowLayout>
              
              <View className="space-y-2">
                <MutedText className="text-blue-600 text-sm leading-5">
                  • Use a clear, recent photo for your profile picture
                </MutedText>
                <MutedText className="text-blue-600 text-sm leading-5">
                  • Keep your display name professional and recognizable
                </MutedText>
                <MutedText className="text-blue-600 text-sm leading-5">
                  • Write a brief, engaging description in your About Me
                </MutedText>
              </View>
            </Card>
          </SectionSpacing>
        </View>
      </ScrollView>
    </PageContainer>
  );
};

export default EditProfileScreen;