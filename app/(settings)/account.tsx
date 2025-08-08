import SettingsRoutingSection from "@/components/settingsRoutingSection";
import TabSelector from "@/components/tabSelector";
import Header from "@/components/header";
import { useUserData } from "@/Providers/UserDataProvider";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryModal from "@/components/primaryModal";

export default function Account() {
  const [accountTab, setAccountTab] = useState<string>("Security");
  const { userData } = useUserData();

  const [accountInfo, setAccountInfo] = useState<any[]>([]);
  const [signInManagement, setSignInManagement] = useState<any[]>([]);
  const [accountManagement, setAccountManagement] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalLabel, setModalLabel] = useState("");
  const [modalRoute, setModalRoute] = useState("");
  const [modalConformationFunc, setModalConformationFunc] = useState<
    (() => void) | undefined
  >(undefined);

  const openModal = (label: string, onConfirmFn: () => void) => {
    setModalConformationFunc(() => onConfirmFn);
    setModalLabel(label);
    setModalVisible(true);
  };

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
          route: "/(settings)/account",
          seconLabel: userData?.email,
        },
        {
          label: "Phone",
          route: `/(settings)/editSetting?data=${userData?.phoneNumber}&header=Phone`,
          seconLabel: userData?.phoneNumber,
        },
      ]);

      setSignInManagement([
        {
          label: "Password",
          route: "/(auth)/resetPassword",
        },
      ]);

      setAccountManagement([
        {
          label: "Disable Account",
          //TODO: MAKE THE FUNC FOR DISABLELING ACC -> add flag in db that the acc is disalbed(when user tries to logs -> alert that acc is disable and just able to see stats on index screen)
          onConfirmFunc: () => console.log("conf"),
        },
        {
          //TODO: MAKE THE FUNC DELETING DISABLELING ACC -> delete from cleark and db

          label: "Delete Account",
          onConfirmFunc: () => console.log("conf"),
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
          openModal={openModal}
        />
      )}
      {accountTab === "Standing" && <Standing />}

      <PrimaryModal
        visible={modalVisible}
        setVisible={setModalVisible}
        title={modalLabel}
        confirmFn={modalConformationFunc}
      >
        <Text className="text-center text-base">
          Modal content for <Text className="font-semibold">{modalLabel}</Text>{" "}
          goes here.
        </Text>
      </PrimaryModal>
    </SafeAreaView>
  );
}

const Security = ({
  accountInfo,
  accountManagement,
  signInManagement,
  openModal,
}: {
  accountInfo: any[];
  accountManagement: any[];
  signInManagement: any[];
  openModal: (label: string, onConfirmFn: () => void) => void;
}) => {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <SettingsRoutingSection title="Account Information" data={accountInfo} />

      <SettingsRoutingSection
        title="Security & Sign-in"
        data={signInManagement}
        containerStyle="mt-8 mx-4"
      />

      <View className="mt-8 mx-4">
        <Text className="text-base font-semibold text-red-500 mb-3">
          Account Management
        </Text>
        {accountManagement.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="py-4 border-b border-gray-200"
            onPress={() => openModal(item.label, item.onConfirmFunc)}
          >
            <Text className="text-red-500 text-base">{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const Standing = () => {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
      <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Account Standing
        </Text>
        <Text className="text-base text-gray-600 leading-6">
          Monitor your account status, compliance metrics, and standing within
          the platform.
        </Text>
      </View>

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
