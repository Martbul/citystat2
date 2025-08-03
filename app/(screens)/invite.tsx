// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   Alert,
//   ActivityIndicator,
//   Image,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { useAuth } from "@clerk/clerk-expo";
// import AntDesign from "@expo/vector-icons/AntDesign";

import { Text, View } from "react-native";

// export default function InviteHandler() {
//   const [loading, setLoading] = useState(false);
//   const [inviteData, setInviteData] = useState(null);
//   const [processing, setProcessing] = useState(true);
//   const { invitedBy, userName } = useLocalSearchParams();
//   const { isSignedIn, getToken } = useAuth();
//   const router = useRouter();

//   const API_BASE_URL = process.env.EXPO_PUBLIC_CITYSTAT_API_URL;

//   useEffect(() => {
//     if (invitedBy) {
//       fetchInviteInfo();
//     }
//   }, [invitedBy]);

//   const fetchInviteInfo = async () => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/invite?invitedBy=${invitedBy}&userName=${userName || ""}`
//       );

//       if (!response.ok) {
//         throw new Error("Invalid invite link");
//       }

//       const data = await response.json();
//       setInviteData(data);
//     } catch (error) {
//       console.error("Error fetching invite info:", error);
//       Alert.alert("Error", "Invalid or expired invite link");
//       router.back();
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleAcceptInvite = async () => {
//     if (!isSignedIn) {
//       // Redirect to sign in/up
//       Alert.alert(
//         "Sign In Required",
//         "You need to sign in or create an account to accept this invite.",
//         [
//           { text: "Cancel", style: "cancel" },
//           {
//             text: "Sign In",
//             onPress: () => router.push("/(auth)/sign-in"), // Adjust path as needed
//           },
//         ]
//       );
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = await getToken();

//       const response = await fetch(`${API_BASE_URL}/api/invite/accept`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           invitedBy: invitedBy,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to accept invite");
//       }

//       const data = await response.json();

//       Alert.alert(
//         "Success!",
//         `You are now friends with ${inviteData?.invitedBy?.userName || "this user"}!`,
//         [
//           {
//             text: "OK",
//             onPress: () => router.push("/(screens)/friends"), // Navigate to friends list
//           },
//         ]
//       );
//     } catch (error) {
//       console.error("Error accepting invite:", error);

//       if (error.message.includes("already friends")) {
//         Alert.alert("Info", "You are already friends with this user!");
//       } else {
//         Alert.alert("Error", error.message || "Failed to accept invite");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDecline = () => {
//     Alert.alert(
//       "Decline Invite",
//       "Are you sure you want to decline this friend invite?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Decline",
//           style: "destructive",
//           onPress: () => router.back(),
//         },
//       ]
//     );
//   };

//   if (processing) {
//     return (
//       <SafeAreaView className="flex-1 bg-lightBackground justify-center items-center">
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text className="mt-4 text-lg">Processing invite...</Text>
//       </SafeAreaView>
//     );
//   }

//   if (!inviteData) {
//     return (
//       <SafeAreaView className="flex-1 bg-lightBackground justify-center items-center">
//         <Text className="text-lg text-red-500">Invalid invite link</Text>
//         <TouchableOpacity
//           className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
//           onPress={() => router.back()}
//         >
//           <Text className="text-white font-semibold">Go Back</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-lightBackground">
//       <View className="relative flex-row items-center p-4 py-6 mt-10 border-b border-lightNeutralGray">
//         <TouchableOpacity className="absolute left-4" style={{ zIndex: 10 }}>
//           <AntDesign
//             onPress={() => router.back()}
//             name="arrowleft"
//             size={28}
//             color="#333333ff"
//           />
//         </TouchableOpacity>
//         <Text className="flex-1 text-center text-lightBlackText font-bold text-2xl">
//           Friend Invite
//         </Text>
//       </View>

//       <View className="flex-1 justify-center items-center p-6">
//         <View className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm">
//           {/* Profile Image */}
//           {inviteData.invitedBy.imageUrl ? (
//             <Image
//               source={{ uri: inviteData.invitedBy.imageUrl }}
//               className="w-24 h-24 rounded-full self-center mb-4"
//             />
//           ) : (
//             <View className="w-24 h-24 rounded-full bg-gray-300 self-center mb-4 justify-center items-center">
//               <Text className="text-2xl font-bold text-gray-600">
//                 {inviteData.invitedBy.firstName?.[0] ||
//                   inviteData.invitedBy.userName?.[0] ||
//                   "?"}
//               </Text>
//             </View>
//           )}

//           {/* User Info */}
//           <Text className="text-xl font-bold text-center mb-2">
//             {inviteData.invitedBy.firstName && inviteData.invitedBy.lastName
//               ? `${inviteData.invitedBy.firstName} ${inviteData.invitedBy.lastName}`
//               : inviteData.invitedBy.userName || "Anonymous User"}
//           </Text>

//           {inviteData.invitedBy.userName && (
//             <Text className="text-gray-600 text-center mb-4">
//               @{inviteData.invitedBy.userName}
//             </Text>
//           )}

//           <Text className="text-center text-gray-700 mb-6">
//             {inviteData.message}
//           </Text>

//           {/* Action Buttons */}
//           <View className="gap-3">
//             <TouchableOpacity
//               className="bg-blue-500 py-3 px-6 rounded-lg"
//               onPress={handleAcceptInvite}
//               disabled={loading}
//               style={{ opacity: loading ? 0.6 : 1 }}
//             >
//               {loading ? (
//                 <ActivityIndicator color="white" />
//               ) : (
//                 <Text className="text-white text-center font-semibold">
//                   Accept Invite
//                 </Text>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               className="bg-gray-200 py-3 px-6 rounded-lg"
//               onPress={handleDecline}
//               disabled={loading}
//             >
//               <Text className="text-gray-700 text-center font-semibold">
//                 Maybe Later
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }



export default function Invite() {
    <View>
        <Text className="text-gray-100">Building...</Text>
    </View>
}