import Panel from "@/components/panel";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import PrimaryButton from "./primaryButton";
import { Card, SectionSpacing, SectionTitle } from "./dev";

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
}

const SettingsTouchableSection: React.FC<SettingsTouchableSectionProps> = ({
  title,
  data,
  containerStyle = "",
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
    <SectionSpacing className={containerStyle}>
      <SectionTitle>{title}</SectionTitle>
      <Card>
        <View className="divide-y divide-gray-100">
          {data.map((item, index) => (
            <View
              key={item.label}
              className={`${index === 0 ? 'pt-0' : ''} ${index === data.length - 1 ? 'pb-0' : ''}`}
            >
              <Panel
                pressFunc={() => openPopup(index)}
                label={item.label}
                icon={item.icon}
                seconLabel={item.seconLabel}
              />
            </View>
          ))}
        </View>
      </Card>

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
                <SectionTitle className="mb-4">
                  {data[activeItemIndex].label}
                </SectionTitle>
                <View className="divide-y divide-gray-200">
                  {data[activeItemIndex].options.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      className="py-3"
                      onPress={() => {
                        if (
                          activeItemIndex !== null &&
                          typeof data[activeItemIndex].setSelectedOption === "function"
                        ) {
                          data[activeItemIndex].setSelectedOption(opt.value);
                        }
                        closePopup();
                      }}
                    >
                      <Text className="text-textBlack text-base font-medium">
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View className="mt-6">
                  <PrimaryButton heading="Close" onPressAction={closePopup} />
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </SectionSpacing>
  );
};

export default SettingsTouchableSection;
