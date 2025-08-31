import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, RowLayout, SectionSpacing, SectionTitle } from "./dev";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioSectionProps {
  title: string;
  options: RadioOption[];
  selectedValue: string;
  onValueChange: (value: any) => void;
  containerStyle?: string;
  disabled?: boolean;
}

const RadioSection: React.FC<RadioSectionProps> = ({
  title,
  options,
  selectedValue,
  onValueChange,
  containerStyle = "",
  disabled = false
}) => {
  return (
    <SectionSpacing className={containerStyle}>
      <SectionTitle>{title}</SectionTitle>
      <Card>
        <View className="divide-y divide-gray-100">
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              className={`py-4 ${index === 0 ? 'pt-0' : ''} ${index === options.length - 1 ? 'pb-0' : ''} ${
                disabled ? "opacity-50" : ""
              }`}
              onPress={() => !disabled && onValueChange(option.value)}
              disabled={disabled}
            >
              <RowLayout className="justify-between">
                <Text className="text-textBlack text-base font-medium">
                  {option.label}
                </Text>
                <View
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedValue === option.value
                      ? "bg-accent border-accent"
                      : "border-gray-300"
                  }`}
                />
              </RowLayout>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </SectionSpacing>
  );
};
export default RadioSection;
