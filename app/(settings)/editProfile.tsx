import InputEditor from "@/components/inputEditor";
import Header from "@/components/header";
import { useUserData } from "@/Providers/UserDataProvider";
import { useImageUploader } from "@/utils/uploadthing";
import { Ionicons } from "@expo/vector-icons";
import { openSettings } from "expo-linking";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      Alert.alert("Upload Completed");
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
      // input: {}, // Add any input data your FileRouter expects
      source: "library", // or "camera"
      onInsufficientPermissions: () => {
        Alert.alert(
          "No Permissions",
          "You need to grant permission to your Photos to use this",
          [
            { text: "Dismiss" },
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
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Edit Profile" secondActionTitle="Save" />
      <ScrollView className="flex-1 bg-lightBackground">
        {/* Profile Picture Section */}
        <View className="absolute top-[20px] left-14 -ml-10 z-10">
          <View className="relative">
            <View className="w-28 h-28 bg-lightSurface rounded-full flex items-center justify-center overflow-hidden">
              {userProfilePic ? (
                <Image
                  className="w-28 h-28"
                  source={{ uri: userProfilePic }}
                  style={{ borderRadius: 56 }}
                />
              ) : (
                <Ionicons name="person" size={40} color="#cecece" />
              )}
              {isUploading && (
                <View className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <ActivityIndicator color="#ffffff" />
                </View>
              )}
            </View>

            <TouchableOpacity
              className="absolute -top-1 -right-1 bg-darkSurface rounded-full p-2 border-2 border-lightBackground"
              onPress={handleImagePick}
              disabled={isUploading}
            >
              <Ionicons name="pencil" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="pt-36 px-4">
          {/* Display Name */}
          <View className="flex my-2">
            <Text className="p-1 mx-2 text-lightPrimaryAccent font-bold">
              Display Name
            </Text>
            <InputEditor
              data={displayName}
              clearDataFunc={displayNameClearData}
              setDataFunc={setDisplayName}
            />
          </View>

          {/* About Me */}
          <View className="flex my-2">
            <Text className="p-1 mx-2 text-lightPrimaryAccent font-bold">
              About Me
            </Text>
            <InputEditor
              data={aboutMe}
              clearDataFunc={abtMeClearData}
              setDataFunc={setAboutMe}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

// import Header from "@/components/ui/header";
// import InputEditor from "@/components/ui/inputEditor";
// import { useUserData } from "@/Providers/UserDataProvider";
// import { useImageUploader } from "@/utils/uploadthing";
// import { Ionicons } from "@expo/vector-icons";
// import React, { useEffect, useState } from "react";
// import { openSettings } from "expo-linking";
// import {
//   Alert,
//   Image,
//   Pressable,
//   ScrollView,
//   StatusBar,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const EditProfileScreen = () => {
//   const { userData } = useUserData();

//   useEffect(() => {
//     const dsName = userData?.firstName! + " "+userData?.lastName;
//     setDisplayName(dsName);
//     setUserProfilePic(userData?.imageUrl!);
//     // setAboutMe(userData.
//   }, [userData]);

//   const [displayName, setDisplayName] = useState("");
//   // const [pronouns, setPronouns] = useState("");
//   const [aboutMe, setAboutMe] = useState("");
//   const [userProfilePic, setUserProfilePic] = useState("");

//   const abtMeClearData = () => {
//     setAboutMe("");
//   };
//   const displayNameClearData = () => {
//     setDisplayName("");
//   };

//    const { openImagePicker, isUploading } = useImageUploader("imageUploader", {
//     /**
//      * Any props here are forwarded to the underlying `useUploadThing` hook.
//      * Refer to the React API reference for more info.
//      */
//     onClientUploadComplete: () => Alert.alert("Upload Completed"),
//     onUploadError: (error) => Alert.alert("Upload Error", error.message),
//   });

//   return (
//     <SafeAreaView className="flex-1 bg-lightBackground">
//       <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
//       <Header title="Edit Profile" secondActionTitle="Save" />
//       <ScrollView className="flex-1 bg-lightBackground">
//         {/* <View className="bg-lightBackground px-4 pt-6 pb-14 relative">

//                              //TODO: v2 add the edit bg

//           <TouchableOpacity className="absolute top-4 right-4 bg-darkSurface rounded-full p-2">
//             <Ionicons name="pencil" size={16} color="#ffffff" />
//           </TouchableOpacity>

//           <View className="items-center mb-6 mt-8">
//             <Text className="text-white text-2xl font-anybodyBold mb-1">
//               Martin Kovachki
//             </Text>
//             <View className="flex-row items-center">
//               <Text className="text-muted font-anybody">martinkovachki</Text>
//               <View className="w-1 h-1 bg-accent rounded-full mx-2" />
//               <Text className="text-accent text-xs">#</Text>
//             </View>
//           </View>
//         </View> */}
//  <Pressable
//         onPress={() => {
//           openImagePicker({
//             input, // Matches the input schema from the FileRouter endpoint
//             source: "library", // or "camera"
//             onInsufficientPermissions: () => {
//               Alert.alert(
//                 "No Permissions",
//                 "You need to grant permission to your Photos to use this",
//                 [
//                   { text: "Dismiss" },
//                   { text: "Open Settings", onPress: openSettings },
//                 ],
//               );
//             },
//           })
//         }}
//       >
//         <Text>Select Image</Text>
//       </Pressable>
//         {/* //TODO: Change to flex */}
//         <View className="absolute top-[20px] left-14 -ml-10 z-10">
//           <View className="relative">
//             <View className="w-28 h-28 bg-lightSurface rounded-full flex items-center justify-center">
//               <Image
//                 className="w-28 h-28"
//                 source={{ uri: userProfilePic }}
//               ></Image>
//             </View>

//             <TouchableOpacity className="absolute -top-1 -right-1 bg-darkSurface rounded-full p-2 border-2 border-lightBackground">
//               <Ionicons name="pencil" size={14} color="#ffffff" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View className="pt-36 px-4">
//           {/*
//                    //TODO: v2 add the edit status

//           <View className="items-center mb-6">
//             <TouchableOpacity className="flex-row items-center bg-darkSurface rounded-full px-4 py-2">
//               <Ionicons name="add" size={16} color="#ffffff" className="mr-2" />
//               <Text className="text-white font-anybody ml-2">Add Status</Text>
//             </TouchableOpacity>
//           </View> */}

//           {/* <View className="mb-6">
//             <Text className="text-lightBlackText font-anybody mb-2">
//               Display Name
//             </Text>
//             <View className="bg-darkSurface rounded-lg px-4 py-3 flex-row items-center">
//               <TextInput
//                 value={displayName}
//                 onChangeText={setDisplayName}
//                 className="flex-1 text-white font-anybody"
//                 placeholderTextColor="#cecece"
//               />
//               <TouchableOpacity onPress={() => setDisplayName("")}>
//                 <Ionicons name="close" size={20} color="#cecece" />
//               </TouchableOpacity>
//             </View>
//           </View> */}

//           <View className="flex my-2">
//             <Text className="p-1 mx-2 text-lightPrimaryAccent font-bold">
//               Display Name
//             </Text>
//             <InputEditor
//               data={displayName}
//               clearDataFunc={displayNameClearData}
//               setDataFunc={setDisplayName}
//             />
//           </View>

//           {/* About Me */}
//           {/* <View className="mb-6">
//             <Text className="text-lightBlackText font-anybody mb-2">
//               About Me
//             </Text>
//             <TextInput
//               value={aboutMe}
//               onChangeText={setAboutMe}
//               multiline
//               numberOfLines={4}
//               className="bg-darkSurface rounded-lg px-4 py-3 text-white font-anybody min-h-[100px]"
//               placeholderTextColor="#cecece"
//               textAlignVertical="top"
//             />
//           </View> */}

//   <View className="flex my-2">
//             <Text className="p-1 mx-2 text-lightPrimaryAccent font-bold">
//              About Me
//             </Text>
//               <InputEditor
//             data={aboutMe}
//             clearDataFunc={abtMeClearData}
//             setDataFunc={setAboutMe}
//           />
//           </View>
//           {/*//TODO: v2 add Avatar Decoration */}
//           {/* <View className="mb-6">
//             <Text className="text-lightBlackText font-anybody mb-2">
//               Avatar Decoration
//             </Text>
//             <View className="bg-darkSurface rounded-lg p-4 items-center justify-center min-h-[60px]">
//               <Text className="text-muted font-anybody">
//                 No decoration selected
//               </Text>
//             </View>
//           </View>
//           <View className="mb-6">
//             <Text className="text-lightBlackText font-anybody mb-2">
//               Profile Effect
//             </Text>
//             <View className="bg-darkSurface rounded-lg p-4 items-center justify-center min-h-[60px]">
//               <Text className="text-muted font-anybody">None</Text>
//             </View>
//           </View>

//           <View className="mb-6">
//             <Text className="text-lightBlackText font-anybody mb-2">
//               Nameplate
//             </Text>
//             <View className="bg-darkSurface rounded-lg p-4 items-center justify-center min-h-[60px]">
//               <Text className="text-muted font-anybody">None</Text>
//             </View>
//           </View>

//           <View className="mb-6">
//             <Text className="text-lightBlackText font-anybody mb-2">
//               Legacy Username Badge
//             </Text>
//             <View className="bg-darkSurface rounded-lg p-4 items-center justify-center min-h-[60px]">
//               <Text className="text-muted font-anybody">None</Text>
//             </View>
//           </View> */}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default EditProfileScreen;
