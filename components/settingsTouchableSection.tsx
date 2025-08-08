import Panel from "@/components/panel";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import PrimaryButton from "./primaryButton";

interface SettingsTouchableSectionProps {
  title: string;
  data: Array<{
    label: string;
    options: Array<{ label: string; value: string }>;
    icon?: React.ReactNode;
    seconLabel?: string;
    selectedOption: any;
    setSelectedOption: React.Dispatch<React.SetStateAction<any>>;
  }>;
  containerStyle?: string;
  titleStyle?: string;
  cardStyle?: string;
}

const SettingsTouchableSection: React.FC<SettingsTouchableSectionProps> = ({
  title,
  data,
  containerStyle = "mt-6 mx-4",
  titleStyle = "text-lg font-bold text-lightPrimaryText mb-2",
  cardStyle = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const openPopup = (index: number) => {
    setActiveItemIndex(index);
    setModalVisible(true);
  };

  const closePopup = () => {
    setModalVisible(false);
    setActiveItemIndex(null);
  };

  return (
    <View className={containerStyle}>
      <Text className={titleStyle}>{title}</Text>

      <View className={cardStyle}>
        {data.map((item, index) => (
          <View
            className={`bg-lightSurface ${index === 0 ? "rounded-t-3xl" : ""} ${
              index === data.length - 1 ? "rounded-b-3xl" : ""
            }`}
            key={item.label}
          >
            <Panel
              pressFunc={() => openPopup(index)}
              label={item.label}
              icon={item.icon}
              seconLabel={item.seconLabel}
            />
            {index < data.length - 1 && (
              <View className="h-px bg-gray-100 ml-4" />
            )}
          </View>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closePopup}
      >
        <Pressable className="flex-1 bg-black/50" onPress={closePopup}>
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6">
            {activeItemIndex !== null && (
              <>
                <Text className="text-lg font-semibold mb-4">
                  {data[activeItemIndex].label}
                </Text>

                {data[activeItemIndex].options.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    className="py-2 border-b border-gray-200"
                    onPress={() => {
                      if (
                        activeItemIndex !== null &&
                        typeof data[activeItemIndex].setSelectedOption ===
                          "function"
                      ) {
                        data[activeItemIndex].setSelectedOption(opt.value);
                      }
                      closePopup();
                    }}
                  >
                    <Text className="text-lightPrimaryText text-base">
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

           
            <PrimaryButton heading="Close" onPressAction={closePopup} />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default SettingsTouchableSection;
