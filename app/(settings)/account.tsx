import Header from "@/components/ui/header";
import Panel from "@/components/ui/panel";
import SettingsSection from "@/components/ui/settingsSection";
import TabSelector from "@/components/ui/tabSelector";
import { useUserData } from "@/Providers/UserDataProvider";
import { dataCombinator } from "@/utils/dataCombinator";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Account() {
  const [accountTab, setAccountTab] = useState<string>("Security");
  const { userData } = useUserData();

  const [accountInfo, setAccountInfo] = useState<any[]>([]);
  const [signInManagement, setSignInManagement] = useState<any[]>([]);
  const [accountManagement, setAccountManagement] = useState<any[]>([]);

  useEffect(() => {
    if (userData) {
      setAccountInfo([
        {
          label: "Username",
          route: `/(settings)/editSetting?data=${userData?.userName}&header=Username`,
          seconLabel: userData?.userName,
        },
        {
          label: "Display Name",
          route: "/(settings)/editProfile",
          seconLabel: `${userData?.firstName} ${userData?.lastName || ""}`,
        },
        {
          label: "Email",
          route: "/(settings)/email",
          seconLabel: userData?.email,
        },
        {
          label: "Phone",
          route: "/(settings)/phone",
          seconLabel: userData?.phoneNumber,
        },
      ]);

      setSignInManagement([
        {
          label: "Password",

          route: "/(settings)/disableAccount",
        },
        {
          label: "Security Keys",
          route: "/(settings)/deleteAccount",
        },
        {
          label: "Enable Authenticator App",
          route: "/(settings)/deleteAccount",
        },
      ]);
      setAccountManagement([
        {
          label: "Disable Account",

          route: "/(settings)/disableAccount",
        },
        {
          label: "Delete Account",
          route: "/(settings)/deleteAccount",
        },
      ]);
    }
  }, [userData]);

  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Account" />
      <TabSelector
        tab={accountTab}
        setTab={setAccountTab}
        tabOne="Security"
        tabTwo="Standing"
      />

      {accountTab === "Security" && (
        <Security
          accountInfo={accountInfo}
          signInManagement={signInManagement}
          accountManagement={accountManagement}
        />
      )}
      {accountTab === "Standing" && <Standing />}
    </SafeAreaView>
  );
}

const Security = ({
  accountInfo,
  accountManagement,
  signInManagement,
}: {
  accountInfo: any[];
  accountManagement: any[];
  signInManagement: any[];
}) => {
 

   return (
    <ScrollView 
      className="flex-1" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <SettingsSection
        title="Account Information"
        data={accountInfo}
      />

      <SettingsSection
        title="Security & Sign-in"
        data={signInManagement}
        containerStyle="mt-8 mx-4"
      />

      <SettingsSection
        title="Account Management"
        data={accountManagement}
        containerStyle="mt-8 mx-4"
      />
    </ScrollView>
  );
};


const Standing = () => {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
      {/* Header Section */}
      <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Account Standing
        </Text>
        <Text className="text-base text-gray-600 leading-6">
          Monitor your account status, compliance metrics, and standing within the platform.
        </Text>
      </View>

      {/* Status Cards */}
      <View className="space-y-4 mb-6">
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Account Status
            </Text>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-sm font-medium text-green-800">
                Good Standing
              </Text>
            </View>
          </View>
          <Text className="text-gray-600">
            Your account is in good standing with no violations or restrictions.
          </Text>
        </View>

        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Compliance Score
            </Text>
            <Text className="text-xl font-bold text-blue-600">95%</Text>
          </View>
          <Text className="text-gray-600">
            Your compliance with platform policies and guidelines.
          </Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </Text>
        <View className="space-y-3">
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-600">Last Login</Text>
            <Text className="text-gray-900 font-medium">Today, 2:30 PM</Text>
          </View>
          <View className="h-px bg-gray-100" />
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-600">Profile Updated</Text>
            <Text className="text-gray-900 font-medium">3 days ago</Text>
          </View>
          <View className="h-px bg-gray-100" />
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-600">Security Check</Text>
            <Text className="text-gray-900 font-medium">1 week ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};