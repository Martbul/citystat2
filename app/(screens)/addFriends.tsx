// import Clipboard from "@react-native-clipboard/clipboard";
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   Share,
//   Alert,
//   Linking,
// } from "react-native";
// import AntDesign from "@expo/vector-icons/AntDesign";
// import { useUserData } from "@/Providers/UserDataProvider";
// import { onBackPress } from "@/utils/navigation";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import Entypo from "@expo/vector-icons/Entypo";
// import Feather from "@expo/vector-icons/Feather";
// import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// import { useRouter } from "expo-router";

// export default function AddFriends() {
// const [loading, setLoading] = useState(false);
//   const { userData } = useUserData();
//   const router = useRouter();

//   const API_BASE_URL = process.env.EXPO_PUBLIC_CITYSTAT_API_URL;

//   const generateInviteLink = () => {
//     const baseUrl = API_BASE_URL + "/invite";
//     const inviteCode = userData?.id || "defaultcode";
//     return `${baseUrl}?invitedBy=${inviteCode}&userName=${userData?.userName || ""}`;
//   };

//   const handleShareInvite = async () => {
//     try {
//       const inviteLink = generateInviteLink();
//       const message = `Hey! Join me on CityStat. Use this link to connect: ${inviteLink}`;

//       await Share.share({
//         message: message,
//         url: inviteLink,
//         title: "Join me on CityStat",
//       });
//     } catch (error) {
//       console.error("Error sharing invite:", error);
//       Alert.alert("Error", "Failed to share invite link");
//     }
//   };

//  const handleCopyLink = async () => {
//    try {
//      const inviteLink = generateInviteLink();
//      await Clipboard.setString(inviteLink);
//    } catch (error) {
//      console.error("Error copying link:", error);
//    }
//  };

//   const handleMessages = () => {
//     const inviteLink = generateInviteLink();
//     const message = `Hey! Join me on CityStat: ${inviteLink}`;
//     const url = `sms:?body=${encodeURIComponent(message)}`;

//     Linking.canOpenURL(url)
//       .then((supported) => {
//         if (supported) {
//           return Linking.openURL(url);
//         }

//       })
//       .catch((error) => {
//         console.error("Error opening messages:", error);
//         Alert.alert("Error", "Failed to open messages app");
//       });
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-lightBackground">
//       <View className="relative flex-row items-center p-4 py-6 mt-10 border-b border-lightNeutralGray">
//         <TouchableOpacity className="absolute left-4" style={{ zIndex: 10 }}>
//           <AntDesign
//             onPress={onBackPress}
//             name="arrowleft"
//             size={28}
//             color="#333333ff"
//           />
//         </TouchableOpacity>
//         <Text className="flex-1 text-center text-lightBlackText font-bold text-2xl">
//           Add Friends
//         </Text>
//       </View>

//       <View className="flex-col flex-1 gap-3">
//         <View className="flex flex-row justify-evenly p-4">
//           <TouchableOpacity
//             className="flex items-center gap-2"
//             onPress={handleShareInvite}
//             disabled={loading}
//           >
//             <Feather name="upload" size={24} color="black" />
//             <Text>Share Invite</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="flex items-center gap-2"
//             onPress={handleCopyLink}
//             disabled={loading}
//           >
//             <MaterialIcons name="content-copy" size={24} color="black" />
//             <Text>Copy Link</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="flex items-center gap-2"
//             onPress={handleMessages}
//             disabled={loading}
//           >
//             <FontAwesome6 name="message" size={24} color="black" />
//             <Text>Messages</Text>
//           </TouchableOpacity>

//         </View>

//         <TouchableOpacity
//           className="flex flex-row justify-between px-4 p-2"
//           onPress={() => router.push("/(screens)/addByUsername")}
//           disabled={loading}
//         >
//           <View className="flex flex-row gap-2">
//             <Entypo name="email" size={24} color="black" />
//             <Text>Add by Username</Text>
//           </View>
//           <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

import Clipboard from "@react-native-clipboard/clipboard";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
  Linking,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useUserData } from "@/Providers/UserDataProvider";
import { onBackPress } from "@/utils/navigation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AddFriends() {
  const [loading, setLoading] = useState(false);
  const { userData } = useUserData();
  const router = useRouter();
     const { getToken } = useAuth();
  

  const API_BASE_URL = process.env.EXPO_PUBLIC_CITYSTAT_API_URL;

  const generateInviteLink = () => {
    // Use your domain instead of API base URL for the invite link
    const baseUrl = "https://yourapp.com/invite"; // This should be your app's domain
    const inviteCode = userData?.id || "defaultcode";
    return `${baseUrl}?invitedBy=${inviteCode}&userName=${userData?.userName || ""}`;
  };

  // Alternative: Get invite link from backend
  const getInviteLinkFromBackend = async () => {
   
    try {
      const token = await getToken(); 
      const response = await fetch(`${API_BASE_URL}/api/invite/link`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get invite link");
      }

      const data = await response.json();
      return data.inviteLink;
    } catch (error) {
      console.error("Error getting invite link:", error);
      throw error;
    }
  };

  const handleShareInvite = async () => {
    try {
      setLoading(true);

      // Option 1: Use client-generated link (current approach)
      const inviteLink = generateInviteLink();

      // Option 2: Get link from backend (more secure)
      // const inviteLink = await getInviteLinkFromBackend();

      const message = `Hey! Join me on CityStat. Use this link to connect: ${inviteLink}`;

      await Share.share({
        message: message,
        url: inviteLink,
        title: "Join me on CityStat",
      });
    } catch (error) {
      console.error("Error sharing invite:", error);
      Alert.alert("Error", "Failed to share invite link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      setLoading(true);

      // Option 1: Use client-generated link
      const inviteLink = generateInviteLink();

      // Option 2: Get link from backend
      // const inviteLink = await getInviteLinkFromBackend();

      await Clipboard.setString(inviteLink);
      Alert.alert("Success", "Invite link copied to clipboard!");
    } catch (error) {
      console.error("Error copying link:", error);
      Alert.alert("Error", "Failed to copy invite link");
    } finally {
      setLoading(false);
    }
  };

  const handleMessages = async () => {
    try {
      setLoading(true);

      const inviteLink = generateInviteLink();
      const message = `Hey! Join me on CityStat: ${inviteLink}`;
      const url = `sms:?body=${encodeURIComponent(message)}`;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "SMS not supported on this device");
      }
    } catch (error) {
      console.error("Error opening messages:", error);
      Alert.alert("Error", "Failed to open messages app");
    } finally {
      setLoading(false);
    }
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
        <View className="flex flex-row justify-evenly p-4">
          <TouchableOpacity
            className="flex items-center gap-2"
            onPress={handleShareInvite}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Feather name="upload" size={24} color="black" />
            <Text>Share Invite</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex items-center gap-2"
            onPress={handleCopyLink}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <MaterialIcons name="content-copy" size={24} color="black" />
            <Text>Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex items-center gap-2"
            onPress={handleMessages}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <FontAwesome6 name="message" size={24} color="black" />
            <Text>Messages</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="flex flex-row justify-between px-4 p-2"
          onPress={() => router.push("/(screens)/addByUsername")}
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
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
}