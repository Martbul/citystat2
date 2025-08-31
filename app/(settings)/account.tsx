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
  Image,
} from "react-native";
import PrimaryModal from "@/components/primaryModal";
import {
  PageContainer,
  Card,
  SectionTitle,
  BodyText,
  MutedText,
  RowLayout,
  SpaceBetweenRow,
  SectionSpacing,
  PageTitle,
  CardTitle,
  IconContainer,
  ClickableCard,
} from "@/components/dev";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function Account() {
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
          icon: "person-outline",
        },
        {
          label: "Display Name",
          route: "/(settings)/editProfile",
          seconLabel: `${userData?.firstName} ${userData?.lastName || ""}`,
          icon: "badge-outline",
        },
        {
          label: "Email",
          route: "/(settings)/account",
          seconLabel: userData?.email,
          icon: "mail-outline",
        },
        {
          label: "Phone",
          route: `/(settings)/editSetting?data=${userData?.phoneNumber}&header=Phone`,
          seconLabel: userData?.phoneNumber,
          icon: "call-outline",
        },
      ]);

      setSignInManagement([
        {
          label: "Password",
          route: "/(auth)/resetPassword",
          icon: "lock-closed-outline",
          description: "Update your password",
        },
        {
          label: "Two-Factor Authentication",
          route: "/(settings)/2fa",
          icon: "shield-checkmark-outline",
          description: "Add extra security to your account",
        },
      ]);

      setAccountManagement([
        {
          label: "Disable Account",
          onConfirmFunc: () => console.log("disable account"),
          icon: "pause-circle",
          description: "Temporarily disable your account",
        },
        {
          label: "Delete Account",
          onConfirmFunc: () => console.log("delete account"),
          icon: "trash",
          description: "Permanently delete your account and all data",
        },
      ]);
    }
  }, [userData]);

  return (
    <PageContainer>
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />
      <Header title="Account" />

      <Security
        accountInfo={accountInfo}
        signInManagement={signInManagement}
        accountManagement={accountManagement}
        openModal={openModal}
      />

      <PrimaryModal
        visible={modalVisible}
        setVisible={setModalVisible}
        title={modalLabel}
        confirmFn={modalConformationFunc}
      >
        <Text className="text-center text-base text-textGray">
          Are you sure you want to proceed with{" "}
          <Text className="font-semibold text-textBlack">{modalLabel}</Text>?
          {modalLabel.includes("Delete") && (
            <Text className="text-red-500 font-medium">
              {"\n\n"}This action cannot be undone.
            </Text>
          )}
        </Text>
      </PrimaryModal>
    </PageContainer>
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
      <View className="px-4 pt-6">
        {/* Account Information */}
        <SectionSpacing>
          <SectionTitle>Personal Information</SectionTitle>
          <View className="space-y-3">
            {accountInfo.map((item, index) => (
              <ClickableCard
                key={index}
                onPress={() => console.log("Navigate to", item.route)}
              >
                <RowLayout className="gap-4">
                  <IconContainer size="medium" color="neutral">
                    <Ionicons name={item.icon} size={20} color="#6B7280" />
                  </IconContainer>
                  <View className="flex-1">
                    <BodyText className="font-semibold mb-1">
                      {item.label}
                    </BodyText>
                    <MutedText className="text-sm">{item.seconLabel}</MutedText>
                  </View>
                </RowLayout>
              </ClickableCard>
            ))}
          </View>
        </SectionSpacing>

        {/* Security & Sign-in */}
        <SectionSpacing>
          <SectionTitle>Security & Privacy</SectionTitle>
          <View className="space-y-3">
            {signInManagement.map((item, index) => (
              <ClickableCard
                key={index}
                onPress={() => console.log("Navigate to", item.route)}
              >
                <RowLayout className="gap-4">
                  <IconContainer size="medium" color="blue">
                    <Ionicons name={item.icon} size={20} color="#3B82F6" />
                  </IconContainer>
                  <View className="flex-1">
                    <BodyText className="font-semibold mb-1">
                      {item.label}
                    </BodyText>
                    <MutedText className="text-sm">
                      {item.description}
                    </MutedText>
                  </View>
                </RowLayout>
              </ClickableCard>
            ))}
          </View>
        </SectionSpacing>

        {/* Account Management - Danger Zone */}
        <SectionSpacing>
          <SectionTitle className="text-red-500 mb-3">Danger Zone</SectionTitle>
          <Card className="border-red-200 bg-red-50/30">
            <View className="space-y-4">
              {accountManagement.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center gap-4 py-2"
                  onPress={() => openModal(item.label, item.onConfirmFunc)}
                  activeOpacity={0.7}
                >
                  <IconContainer size="medium" color="red">
                    <MaterialIcons name={item.icon} size={20} color="white" />
                  </IconContainer>
                  <View className="flex-1">
                    <Text className="text-red-600 font-semibold text-base mb-1">
                      {item.label}
                    </Text>
                    <Text className="text-red-500/80 text-sm">
                      {item.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#DC2626" />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </SectionSpacing>
      </View>
    </ScrollView>
  );
};
