import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions,
  TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import { IconContainer, CardTitle, BodyText } from '@/components/dev';

const { width } = Dimensions.get('window');

interface AlertAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

interface CustomAlertProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  actions?: AlertAction[];
  showCloseButton?: boolean;
}

export const Alert: React.FC<CustomAlertProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  actions = [],
  showCloseButton = true
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { 
          name: 'checkmark-circle' as const, 
          color: '#10B981', 
          bgColor: 'green' as const 
        };
      case 'warning':
        return { 
          name: 'warning' as const, 
          color: '#F59E0B', 
          bgColor: 'neutral' as const 
        };
      case 'error':
        return { 
          name: 'close-circle' as const, 
          color: '#EF4444', 
          bgColor: 'red' as const 
        };
      default:
        return { 
          name: 'information-circle' as const, 
          color: '#3B82F6', 
          bgColor: 'blue' as const 
        };
    }
  };

  const iconConfig = getIconConfig();

  // Default actions if none provided
  const defaultActions: AlertAction[] = actions.length > 0 ? actions : [
    { text: 'OK', onPress: onClose, style: 'default' }
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <TouchableWithoutFeedback>
            <View 
              className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-w-sm w-full"
              style={{ maxWidth: width - 48 }}
            >
              {/* Header with Icon and Close Button */}
              <View className="flex-row justify-between items-start mb-4">
                <IconContainer size="medium" color={iconConfig.bgColor}>
                  <Ionicons 
                    name={iconConfig.name} 
                    size={24} 
                    color={iconConfig.color} 
                  />
                </IconContainer>
                
                {showCloseButton && (
                  <TouchableOpacity 
                    onPress={onClose}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Title */}
              <CardTitle className="mb-2">
                {title}
              </CardTitle>

              {/* Message */}
              {message && (
                <BodyText className="text-textGray mb-6 leading-6">
                  {message}
                </BodyText>
              )}

              {/* Action Buttons */}
              <View className="flex-col gap-3">
                {defaultActions.map((action, index) => {
                  const isDestructive = action.style === 'destructive';
                  const isCancel = action.style === 'cancel';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={action.onPress}
                      className={`py-4 px-6 rounded-2xl items-center ${
                        isDestructive 
                          ? 'bg-red-50 border border-red-200' 
                          : isCancel
                          ? 'bg-gray-100 border border-gray-200'
                          : 'bg-accent'
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`font-semibold text-lg ${
                        isDestructive 
                          ? 'text-red-600' 
                          : isCancel
                          ? 'text-textGray'
                          : 'text-white'
                      }`}>
                        {action.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Hook for easier usage
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    title: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    actions?: AlertAction[];
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    actions: []
  });

  const showAlert = ({
    title,
    message,
    type = 'info',
    actions = []
  }: Omit<CustomAlertProps, 'visible' | 'onClose' | 'showCloseButton'>) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      actions
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <Alert
      {...alertConfig}
      onClose={hideAlert}
    />
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent
  };
};

// Pre-built alert functions for common use cases
export const AlertHelpers = {
  success: (title: string, message?: string, onOk?: () => void) => ({
    title,
    message,
    type: 'success' as const,
    actions: [
      { text: 'Great!', onPress: onOk || (() => {}), style: 'default' as const }
    ]
  }),

  error: (title: string, message?: string, onOk?: () => void) => ({
    title,
    message,
    type: 'error' as const,
    actions: [
      { text: 'Try Again', onPress: onOk || (() => {}), style: 'default' as const }
    ]
  }),

  confirm: (
    title: string, 
    message?: string, 
    onConfirm?: () => void, 
    onCancel?: () => void
  ) => ({
    title,
    message,
    type: 'warning' as const,
    actions: [
      { text: 'Cancel', onPress: onCancel || (() => {}), style: 'cancel' as const },
      { text: 'Confirm', onPress: onConfirm || (() => {}), style: 'destructive' as const }
    ]
  }),

  info: (title: string, message?: string, onOk?: () => void) => ({
    title,
    message,
    type: 'info' as const,
    actions: [
      { text: 'Got it', onPress: onOk || (() => {}), style: 'default' as const }
    ]
  })
};

// Example usage component
export const AlertExample = () => {
  const { showAlert, AlertComponent } = useCustomAlert();

  const handleShowSuccess = () => {
    showAlert(AlertHelpers.success(
      'Profile Updated!', 
      'Your changes have been saved successfully.',
      () => console.log('Success acknowledged')
    ));
  };

  const handleShowError = () => {
    showAlert(AlertHelpers.error(
      'Connection Failed',
      'Unable to save your details. Please check your internet connection and try again.'
    ));
  };

  const handleShowConfirm = () => {
    showAlert(AlertHelpers.confirm(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      () => console.log('Account deleted'),
      () => console.log('Cancelled')
    ));
  };

  return (
    <View className="flex-1 justify-center items-center gap-4 px-6">
      <TouchableOpacity 
        onPress={handleShowSuccess}
        className="bg-green-500 py-4 px-6 rounded-2xl"
      >
        <Text className="text-white font-semibold">Show Success Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleShowError}
        className="bg-red-500 py-4 px-6 rounded-2xl"
      >
        <Text className="text-white font-semibold">Show Error Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleShowConfirm}
        className="bg-yellow-500 py-4 px-6 rounded-2xl"
      >
        <Text className="text-white font-semibold">Show Confirm Alert</Text>
      </TouchableOpacity>

      <AlertComponent />
    </View>
  );
};