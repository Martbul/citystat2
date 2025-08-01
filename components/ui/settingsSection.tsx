import React from 'react';
import { View, Text } from 'react-native';
import Panel from '@/components/ui/panel';

interface SettingsSectionProps {
  title: string;
  data: Array<{
    label: string;
    route: string;
    icon?: any;
    seconLabel?: string;
  }>;
  containerStyle?: string;
  titleStyle?: string;
  cardStyle?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  data,
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
        {data.map((item, index) => (
          <View 
            className={`bg-lightSurface ${index === 0 ? 'rounded-t-3xl' : ''} ${index === data.length - 1 ? 'rounded-b-3xl' : ''}`} 
            key={item.label}
          >
            <Panel
              route={item.route}
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
    </View>
  );
};

export default SettingsSection;