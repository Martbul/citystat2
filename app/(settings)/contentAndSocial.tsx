import Panel from "@/components/panel";
import TabSelector from "@/components/tabSelector";
import Header from "@/components/header";
import { useUserData } from "@/Providers/UserDataProvider";
import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StatusBar, Text, View } from "react-native";

export default function ConntentAndSocial() {
  const [accountTab, setAccountTab] = useState<string>("Security");
  const { userData } = useUserData();

  const [accountInfo, setAccountInfo] = useState<any[]>([]);
  const [accountManagement, setAccountManagement] = useState<any[]>([]);

  useEffect(() => {
    if (userData) {
      setAccountInfo([
        {
          label: "Username",
          route: "/(settings)/username",
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
}: {
  accountInfo: any[];
  accountManagement: any[];
}) => {
  const combinedData = [
    { type: "header", title: "Account Information" },
    ...accountInfo.map((item) => ({ ...item, type: "item" })),
    { type: "header", title: "Account Management" },
    ...accountManagement.map((item) => ({ ...item, type: "item" })),
  ];

  return (
    <View className="flex-1 px-2">
      <FlatList
        data={combinedData}
        keyExtractor={(item, index) =>
          item.type === "header" ? `header-${item.title}` : `item-${item.label}`
        }
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) =>
          item.type === "header" ? (
            <Text className="text-lg font-semibold mt-4 mb-2 text-black">
              {item.title}
            </Text>
          ) : (
            <Panel
              route={item.route}
              label={item.label}
              icon={item.icon}
              seconLabel={item.seconLabel}
            />
          )
        }
      />
    </View>
  );
};

const Standing = () => {
  return (
    <View className="px-4 py-6">
      <Text className="text-lg font-semibold text-black">Standing</Text>
      <Text className="text-base mt-2 text-gray-600">Coming soon...</Text>
    </View>
  );
};
