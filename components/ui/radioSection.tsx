import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface RadioOption {
  label: string;
  value: string;
}

interface RadioSectionProps {
  title: string;
  options: RadioOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  containerStyle?: string;
  titleStyle?: string;
  cardStyle?: string;
}

const RadioSection: React.FC<RadioSectionProps> = ({
  title,
  options,
  selectedValue,
  onValueChange,
  containerStyle = "mt-6 mx-4",
  titleStyle = "text-lg font-bold text-lightPrimaryText mb-2",
  cardStyle = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
}) => {
  return (
    <View className={containerStyle}>
      <Text className={titleStyle}>
        {title}
      </Text>
      <View className={cardStyle}>
        {options.map((option, index) => (
          <View key={option.value}>
            <View
              className={`bg-lightSurface  ${index === 0 ? "rounded-t-3xl" : ""} ${index === options.length - 1 ? "rounded-b-3xl" : ""}`}
            >
              <TouchableOpacity
                className="flex-row items-center justify-between py-4 px-4"
                onPress={() => onValueChange(option.value)}
              >
                <Text className="text-lightBlackText text-base">
                  {option.label}
                </Text>
                <View
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedValue === option.value
                      ? "bg-lightPrimaryAccent border-lightPrimaryAccent"
                      : "border-gray-300"
                  }`}
                />
              </TouchableOpacity>
            </View>
            {index < options.length - 1 && (
              <View className="h-px bg-gray-100 ml-4" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default RadioSection;