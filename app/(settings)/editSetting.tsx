import Header from "@/components/ui/header";
import InputEditor from "@/components/ui/inputEditor";
import { useUserData } from "@/Providers/UserDataProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StatusBar, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditSetting() {
  const router = useRouter();
  const { data, header } = useLocalSearchParams();
  const [currData, setCurrData] = useState<string>("");
  
  // Use provider methods instead of direct API calls
  const { 
    updateUser, 
    updateSettings, 
    isLoading, 
    error,
    userData 
  } = useUserData();

  useEffect(() => {
    if (data && data !== "undefined") {
      setCurrData(data as string);
    } else {
      setCurrData("");
    }
  }, [data]);

  const resetData = () => {
    setCurrData("");
  };

  const saveNewData = async () => {
    if (!header || typeof header !== "string") {
      Alert.alert("Error", "Invalid setting field");
      return;
    }

    try {
      const lowerCaseHeader = header.toLowerCase();
      console.log("Updating field:", lowerCaseHeader, "with value:", currData);

      // Determine if this is a user field or settings field
      const userFields = ['firstname', 'lastname', 'username', 'aboutme', 'note'];
      const settingsFields = ['theme', 'language', 'textsize', 'zoomlevel', 'fontstyle', 'messagesallowance', 'showrolecolors', 'motion', 'stickersanimation'];

      if (userFields.includes(lowerCaseHeader)) {
        // Update user field
        const updates = {
          [lowerCaseHeader]: currData
        };
        await updateUser(updates);
      } else if (settingsFields.includes(lowerCaseHeader)) {
        // Update settings field
        const settingsUpdates = {
          [lowerCaseHeader]: currData
        };
        await updateSettings(settingsUpdates);
      } else {
        throw new Error(`Unknown field: ${lowerCaseHeader}`);
      }

      console.log("Update successful");
      router.back();
      
    } catch (error) {
      console.error("Error updating field:", error);
      Alert.alert(
        "Error", 
        `Failed to update ${header}. Please try again.`,
        [{ text: "OK" }]
      );
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-lightBackground justify-center items-center">
        <ActivityIndicator size="large" color="#bddc62" />
        <Text className="mt-2 text-lightPrimaryAccent">Saving...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      
      <Header
        title={header as string}
        secondActionTitle="Save"
        secondOnPressAction={saveNewData}
      />
      
      {error && (
        <View className="mx-2 p-2 bg-red-100 rounded">
          <Text className="text-red-600">Error: {error}</Text>
        </View>
      )}
      
      <View className="flex my-2">
        <Text className="p-1 mx-2 text-lightPrimaryAccent font-bold">
          {header}
        </Text>
        <InputEditor
          data={currData || ""}
          clearDataFunc={resetData}
          setDataFunc={setCurrData}
        />
      </View>
    </SafeAreaView>
  );
}

// import Header from "@/components/ui/header";
// import InputEditor from "@/components/ui/inputEditor";
// import { useUserData } from "@/Providers/UserDataProvider";
// import { useAuth } from "@clerk/clerk-expo";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { Alert, StatusBar, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const API_BASE_URL = process.env.EXPO_PUBLIC_CITYSTAT_API_URL;

// export default function EditSetting() {
//   const router = useRouter();
//   const { data, header } = useLocalSearchParams();
//   const [currData, setCurrData] = useState<string>("");
//   const { getToken } = useAuth();
//   const { setUserData } = useUserData();

//   useEffect(() => {
//     if (data && data != "undefined") {
//       setCurrData(data as string);
//     } else {
//       setCurrData("");
//     }
//   }, [data]);

//   const resetData = () => {
//     setCurrData("");
//   };

//   const saveNewData = async () => {
//     try {
//       let lowerCaseHeader: string;
//       if (typeof header === "string") {
//         lowerCaseHeader = header.toLowerCase();
//       } else {
//         lowerCaseHeader = "";
//       }
//       console.log(lowerCaseHeader);
//       const token = await getToken();

//       const newData = {
//         [lowerCaseHeader]: currData,
//       };

//       console.log(newData);
//       const response = await fetch(
//         `${API_BASE_URL}/api/settings/${lowerCaseHeader}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(newData),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to update ${lowerCaseHeader}: ${response.status}`);
//       }

//       const responseData = await response.json();
//       console.log("response:", responseData);
//       setUserData(responseData);
//       router.back();
//     } catch (error) {
//       console.error(`Error editing field:`, error);
//       Alert.alert("Error", "Failed to edit username. Please try again.", [
//         { text: "OK" },
//       ]);
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-lightBackground">
//       <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
//       <Header
//         title={header as string}
//         secondActionTitle="Save"
//         secondOnPressAction={saveNewData}
//       />
//       <View className="flex my-2">
//         <Text className="p-1 mx-2 text-lightPrimaryAccent font-bold">
//           {header}
//         </Text>
//         <InputEditor
//           data={currData || ""}
//           clearDataFunc={resetData}
//           setDataFunc={setCurrData}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }
