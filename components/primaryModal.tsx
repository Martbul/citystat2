import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import PrimaryButton from "./primaryButton";

interface PrimaryModalProps {
  title: string;
  secondTitle?: string;
  visible: boolean;
  setVisible: (val: boolean) => void;
  children?: React.ReactNode;
  containerStyle?: string;
  titleStyle?: string;
  cardStyle?: string;
  confirmFn?: () => void;
}

const PrimaryModal: React.FC<PrimaryModalProps> = ({
  title,
  secondTitle,
  visible,
  setVisible,
  children,
  containerStyle = "mt-6 mx-4",
  titleStyle = "text-lg font-bold text-lightPrimaryText mb-2",
  cardStyle = "bg-white rounded-t-2xl shadow-sm border border-gray-100 p-6",
  confirmFn,
}) => {
  const closeModal = () => {
    setVisible(false);
  };

  return (
    <View className={containerStyle}>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <Pressable className="flex-1 bg-black/50" onPress={closeModal}>
          <Pressable
            className="absolute bottom-0 left-0 right-0"
            onPress={() => {}}
          >
            <View className={cardStyle}>
              <Text className={titleStyle}>{title}</Text>
              {secondTitle && (
                <Text className="text-base text-gray-500 mb-4">
                  {secondTitle}
                </Text>
              )}

              <View className="mb-4">{children}</View>

              <PrimaryButton heading="Confirm" onPressAction={confirmFn} />
              <PrimaryButton heading="Close" onPressAction={closeModal} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default PrimaryModal;
