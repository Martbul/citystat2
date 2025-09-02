import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  Linking,
  Platform,
} from "react-native";
import {
  Ionicons,
  AntDesign,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Import your existing components
import {
  PageContainer,
  Card,
  IconContainer,
  CardTitle,
  BodyText,
  MutedText,
  RowLayout,
  SectionSpacing,
  SpaceBetweenRow,
} from "@/components/dev";
import Header from "@/components/header";

// Support Category Component
const SupportCategory = ({
  icon,
  title,
  description,
  onPress,
  color = "blue",
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  color?: "blue" | "green" | "accent" | "neutral" | "red";
  badge?: string;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm"
    >
      <RowLayout className="justify-between">
        <RowLayout className="flex-1">
          <IconContainer size="medium" color={color}>
            {icon}
          </IconContainer>
          <View className="ml-4 flex-1">
            <RowLayout className="items-center mb-1">
              <BodyText className="font-semibold">{title}</BodyText>
              {badge && (
                <View className="bg-red-500 rounded-full px-2 py-0.5 ml-2">
                  <Text className="text-white text-xs font-bold">{badge}</Text>
                </View>
              )}
            </RowLayout>
            <MutedText className="text-sm">{description}</MutedText>
          </View>
        </RowLayout>
        <AntDesign name="right" size={16} color="#6B7280" />
      </RowLayout>
    </TouchableOpacity>
  );
};

// Quick Fix Component
const QuickFix = ({
  title,
  steps,
  icon,
}: {
  title: string;
  steps: string[];
  icon: React.ReactNode;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="border border-gray-100 rounded-xl mb-3">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="p-4"
      >
        <SpaceBetweenRow>
          <RowLayout className="flex-1">
            <IconContainer size="small" color="blue">
              {icon}
            </IconContainer>
            <BodyText className="font-medium ml-3 flex-1">{title}</BodyText>
          </RowLayout>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </SpaceBetweenRow>
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4 border-t border-gray-100 pt-4">
          {steps.map((step, index) => (
            <View key={index} className="flex-row items-start mb-2 last:mb-0">
              <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-blue-600 text-xs font-bold">
                  {index + 1}
                </Text>
              </View>
              <MutedText className="text-sm flex-1">{step}</MutedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });

  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: "bug", label: "Bug Report", email: "bugs@streetexplorer.app" },
    {
      value: "feature",
      label: "Feature Request",
      email: "features@streetexplorer.app",
    },
    {
      value: "account",
      label: "Account Issues",
      email: "account@streetexplorer.app",
    },
    {
      value: "privacy",
      label: "Privacy Concerns",
      email: "privacy@streetexplorer.app",
    },
    {
      value: "general",
      label: "General Support",
      email: "support@streetexplorer.app",
    },
  ];

  // Get device info for better support
  const getDeviceInfo = () => {
    return `
Device Information:
- Platform: ${Platform.OS}
- Version: ${Platform.Version}
- App Version: 2.1.3
- Timestamp: ${new Date().toISOString()}
`;
  };

  // Enhanced email sending function
  const sendSupportEmail = async () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields (Name, Email, and Message)"
      );
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const selectedCategory = categories.find(
        (c) => c.value === formData.category
      );
      const supportEmail =
        selectedCategory?.email || "support@streetexplorer.app";

      const subject = encodeURIComponent(
        `[${selectedCategory?.label}] ${formData.subject || "Support Request from " + formData.name}`
      );

      const body = encodeURIComponent(
        `Hello Street Explorer Support Team,

${formData.message}

---
Contact Information:
Name: ${formData.name}
Email: ${formData.email}
Category: ${selectedCategory?.label}

${getDeviceInfo()}
---
This message was sent from the Street Explorer mobile app.`
      );

      const emailUrl = `mailto:${supportEmail}?subject=${subject}&body=${body}`;

      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);

        Alert.alert(
          "Email Opened Successfully",
          "Your email client has been opened with your message pre-filled. Please review and send the email to complete your support request.",
          [
            {
              text: "OK",
              onPress: () => {
                // Reset form after successful email opening
                setFormData({
                  name: "",
                  email: "",
                  subject: "",
                  message: "",
                  category: "general",
                });
              },
            },
          ]
        );
      } else {
        // Fallback: Copy email details to clipboard
        Alert.alert(
          "No Email Client Found",
          `Please manually send an email to: ${supportEmail}\n\nSubject: ${decodeURIComponent(subject)}\n\nThe message details have been prepared for you.`,
          [
            {
              text: "Copy Email Address",
              onPress: () => {
                // You might want to use a clipboard library here
                Alert.alert("Email Address", supportEmail);
              },
            },
            { text: "OK" },
          ]
        );
      }
    } catch (error) {
      console.error("Email error:", error);
      Alert.alert(
        "Error",
        "Failed to open email client. Please try contacting us directly at support@streetexplorer.app"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Quick email templates for common issues
  const useTemplate = (tmpltl: string) => {
    const templates = {
      bug: "I found a bug in the app. Here's what happened:\n\n1. What I was doing:\n[Describe what you were doing]\n\n2. What I expected to happen:\n[Describe expected behavior]\n\n3. What actually happened:\n[Describe the actual behavior]\n\n4. Steps to reproduce:\n[List steps to reproduce the issue]",

      feature:
        "I have a feature request for Street Explorer:\n\n1. Feature description:\n[Describe the feature you'd like]\n\n2. Why it would be useful:\n[Explain how this would improve the app]\n\n3. How you envision it working:\n[Describe how you think it should work]",

      account:
        "I'm having issues with my account:\n\n1. Problem description:\n[Describe the account issue]\n\n2. When did this start:\n[When did you first notice this]\n\n3. Account email:\n[Your account email if different from this email]\n\n4. What you've tried:\n[Any troubleshooting steps you've already tried]",
    };

    const template = templates[formData.category as keyof typeof templates];
    if (template) {
      setFormData({ ...formData, message: template });
    }
  };

  return (
    <Card>
      <CardTitle className="mb-4">Contact Support</CardTitle>

      {/* Category Selector */}
      <View className="mb-4">
        <BodyText className="font-medium mb-2">Category</BodyText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                onPress={() =>
                  setFormData({ ...formData, category: category.value })
                }
                className={`px-4 py-2 rounded-full mr-2 ${
                  formData.category === category.value
                    ? "bg-blue-500"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    formData.category === category.value
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Show target email for selected category */}
        <View className="mt-2 p-2 bg-gray-50 rounded-lg">
          <MutedText className="text-xs">
            Will be sent to:{" "}
            {categories.find((c) => c.value === formData.category)?.email}
          </MutedText>
        </View>
      </View>

      {/* Template Buttons */}
      {(formData.category === "bug" ||
        formData.category === "feature" ||
        formData.category === "account") && (
        <View className="mb-4">
          <TouchableOpacity
            onPress={() => useTemplate(formData.category)}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <RowLayout className="items-center justify-center">
              <Ionicons name="document-text" size={16} color="#3B82F6" />
              <Text className="text-blue-600 font-medium ml-2 text-sm">
                Use{" "}
                {categories.find((c) => c.value === formData.category)?.label}{" "}
                Template
              </Text>
            </RowLayout>
          </TouchableOpacity>
        </View>
      )}

      {/* Form Fields */}
      <View className="space-y-4">
        <View>
          <BodyText className="font-medium mb-2">Name *</BodyText>
          <TextInput
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Your full name"
            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
            autoCapitalize="words"
          />
        </View>

        <View>
          <BodyText className="font-medium mb-2">Email *</BodyText>
          <TextInput
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
          />
        </View>

        <View>
          <BodyText className="font-medium mb-2">Subject</BodyText>
          <TextInput
            value={formData.subject}
            onChangeText={(text) => setFormData({ ...formData, subject: text })}
            placeholder="Brief description of your issue"
            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
            autoCapitalize="sentences"
          />
        </View>

        <View>
          <BodyText className="font-medium mb-2">Message *</BodyText>
          <TextInput
            value={formData.message}
            onChangeText={(text) => setFormData({ ...formData, message: text })}
            placeholder="Please describe your issue or question in detail..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
            style={{ minHeight: 120 }}
            autoCapitalize="sentences"
          />
        </View>

        {/* Character count for message */}
        <View className="flex-row justify-end">
          <MutedText className="text-xs">
            {formData.message.length} characters
          </MutedText>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={sendSupportEmail}
          disabled={isLoading}
          className={`p-4 rounded-xl ${isLoading ? "bg-gray-300" : "bg-blue-500"}`}
        >
          <RowLayout className="justify-center">
            {isLoading ? (
              <Ionicons name="hourglass" size={16} color="white" />
            ) : (
              <Ionicons name="send" size={16} color="white" />
            )}
            <Text className="text-white font-semibold ml-2">
              {isLoading ? "Preparing Email..." : "Send Message"}
            </Text>
          </RowLayout>
        </TouchableOpacity>

        {/* Quick Contact Buttons */}
        <View className="mt-4 pt-4 border-t border-gray-100">
          <BodyText className="font-medium mb-3 text-center">
            Or contact us directly:
          </BodyText>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("mailto:support@streetexplorer.app")
              }
              className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <RowLayout className="justify-center">
                <Ionicons name="mail" size={16} color="#10B981" />
                <Text className="text-green-700 font-medium ml-2 text-sm">
                  Direct Email
                </Text>
              </RowLayout>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL("tel:+1-800-EXPLORER")}
              className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <RowLayout className="justify-center">
                <Ionicons name="call" size={16} color="#3B82F6" />
                <Text className="text-blue-700 font-medium ml-2 text-sm">
                  Call Us
                </Text>
              </RowLayout>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );
};

// Status Card Component
const StatusCard = ({
  status,
}: {
  status: "operational" | "issues" | "maintenance";
}) => {
  const statusConfig = {
    operational: {
      color: "#10B981",
      bgColor: "#ECFDF5",
      borderColor: "#A7F3D0",
      icon: "checkmark-circle",
      text: "All Systems Operational",
      description: "All features are working normally",
    },
    issues: {
      color: "#F59E0B",
      bgColor: "#FFFBEB",
      borderColor: "#FDE68A",
      icon: "warning",
      text: "Some Issues Reported",
      description: "We're investigating reported issues",
    },
    maintenance: {
      color: "#6B7280",
      bgColor: "#F9FAFB",
      borderColor: "#D1D5DB",
      icon: "construct",
      text: "Scheduled Maintenance",
      description: "Some features may be temporarily unavailable",
    },
  };

  const config = statusConfig[status];

  return (
    <View
      className="p-4 rounded-xl border"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      <RowLayout className="items-center">
        <Ionicons name={config.icon as any} size={20} color={config.color} />
        <View className="ml-3">
          <Text className="font-semibold" style={{ color: config.color }}>
            {config.text}
          </Text>
          <Text
            className="text-sm"
            style={{ color: config.color, opacity: 0.8 }}
          >
            {config.description}
          </Text>
        </View>
      </RowLayout>
    </View>
  );
};

// Quick Email Actions Component
const QuickEmailActions = () => {
  const sendQuickEmail = async (type: "bug" | "feature" | "general") => {
    const emailTemplates = {
      bug: {
        email: "bugs@streetexplorer.app",
        subject: "Bug Report - Street Explorer App",
        body: `Hi Street Explorer Team,

I found a bug in the app that I'd like to report:

Bug Description:
[Please describe what went wrong]

Steps to Reproduce:
1. [First step]
2. [Second step]
3. [Third step]

Expected Behavior:
[What should have happened]

Actual Behavior:
[What actually happened]

Additional Notes:
[Any other relevant information]

Device Information:
- Platform: ${Platform.OS}
- Version: ${Platform.Version}
- App Version: 2.1.3
- Timestamp: ${new Date().toISOString()}

Thank you for your time!

Best regards,
[Your Name]`,
      },

      feature: {
        email: "features@streetexplorer.app",
        subject: "Feature Request - Street Explorer App",
        body: `Hi Street Explorer Team,

I have a feature request for the Street Explorer app:

Feature Request:
[Describe the feature you'd like to see]

Use Case:
[Explain how this feature would be useful]

Suggested Implementation:
[If you have ideas on how it could work]

Additional Comments:
[Any other thoughts or suggestions]

Device Information:
- Platform: ${Platform.OS}
- App Version: 2.1.3
- Timestamp: ${new Date().toISOString()}

Thank you for considering this request!

Best regards,
[Your Name]`,
      },

      general: {
        email: "support@streetexplorer.app",
        subject: "General Support - Street Explorer App",
        body: `Hi Street Explorer Support Team,

I need assistance with:
[Please describe your question or issue]

Additional Information:
[Any relevant details]

Device Information:
- Platform: ${Platform.OS}
- App Version: 2.1.3
- Timestamp: ${new Date().toISOString()}

Thank you for your help!

Best regards,
[Your Name]`,
      },
    };

    const template = emailTemplates[type];
    const emailUrl = `mailto:${template.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;

    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert(
          "No Email Client",
          `Please send an email to: ${template.email}`,
          [
            {
              text: "Copy Email",
              onPress: () => Alert.alert("Email", template.email),
            },
            { text: "OK" },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open email client");
    }
  };

  return (
    <Card>
      <CardTitle className="mb-4">Quick Email Support</CardTitle>
      <BodyText className="mb-4 text-sm text-gray-600">
        Need help fast? Use these pre-formatted email templates:
      </BodyText>

      <View className="space-y-3">
        <TouchableOpacity
          onPress={() => sendQuickEmail("bug")}
          className="bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <RowLayout className="items-center">
            <IconContainer size="small" color="red">
              <Ionicons name="bug" size={16} color="white" />
            </IconContainer>
            <View className="ml-3 flex-1">
              <BodyText className="font-semibold text-red-800">
                Report Bug
              </BodyText>
              <MutedText className="text-sm text-red-700">
                Pre-filled bug report template
              </MutedText>
            </View>
            <AntDesign name="right" size={16} color="#EF4444" />
          </RowLayout>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => sendQuickEmail("feature")}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <RowLayout className="items-center">
            <IconContainer size="small" color="blue">
              <Ionicons name="bulb" size={16} color="white" />
            </IconContainer>
            <View className="ml-3 flex-1">
              <BodyText className="font-semibold text-blue-800">
                Request Feature
              </BodyText>
              <MutedText className="text-sm text-blue-700">
                Suggest new features or improvements
              </MutedText>
            </View>
            <AntDesign name="right" size={16} color="#3B82F6" />
          </RowLayout>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => sendQuickEmail("general")}
          className="bg-green-50 border border-green-200 rounded-xl p-4"
        >
          <RowLayout className="items-center">
            <IconContainer size="small" color="green">
              <Ionicons name="help-circle" size={16} color="white" />
            </IconContainer>
            <View className="ml-3 flex-1">
              <BodyText className="font-semibold text-green-800">
                General Support
              </BodyText>
              <MutedText className="text-sm text-green-700">
                Questions, help, or other inquiries
              </MutedText>
            </View>
            <AntDesign name="right" size={16} color="#10B981" />
          </RowLayout>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

// Main Support Component
export default function Support () {
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "faq":
        // Navigate to FAQ section or show modal
        Alert.alert("FAQ", "Scrolling to FAQ section...");
        break;
      case "chat":
        Alert.alert("Live Chat", "Live chat feature coming soon!");
        break;
      case "bug":
        Alert.alert("Bug Report", "Opening bug report form...");
        break;
      case "feature":
        Alert.alert("Feature Request", "Opening feature request form...");
        break;
      case "account":
        Alert.alert("Account Help", "Opening account assistance...");
        break;
    }
  };

  const handleEmergencyContact = () => {
    Alert.alert(
      "Emergency Contact",
      "For urgent issues, please contact us immediately:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call Support",
          onPress: () => Linking.openURL("tel:+1-800-EXPLORER"),
        },
        {
          text: "Emergency Email",
          onPress: () =>
            Linking.openURL(
              "mailto:emergency@streetexplorer.app?subject=URGENT - Street Explorer Issue"
            ),
        },
      ]
    );
  };

  return (
    <PageContainer>
      <StatusBar barStyle="light-content" backgroundColor="#fafafa" />
      <Header title="Support" />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Service Status */}
        <SectionSpacing className="mt-6">
          <Card>
            <CardTitle className="mb-3">Service Status</CardTitle>
            <StatusCard status="operational" />
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://status.streetexplorer.app")
              }
              className="mt-3"
            >
              <RowLayout className="justify-center">
                <Ionicons name="globe" size={16} color="#3B82F6" />
                <Text className="text-blue-500 font-medium ml-2 text-sm">
                  View Status Page
                </Text>
              </RowLayout>
            </TouchableOpacity>
          </Card>
        </SectionSpacing>

        {/* Quick Email Actions */}
        <SectionSpacing>
          <QuickEmailActions />
        </SectionSpacing>

        {/* Quick Help Categories */}
        <SectionSpacing>
          <CardTitle className="mb-4">How can we help you?</CardTitle>

          <SupportCategory
            icon={<Ionicons name="help-circle" size={20} color="white" />}
            title="Frequently Asked Questions"
            description="Find quick answers to common questions"
            onPress={() => handleQuickAction("faq")}
            color="blue"
          />

          <SupportCategory
            icon={<Ionicons name="bug" size={20} color="white" />}
            title="Report a Bug"
            description="Found something that's not working? Let us know"
            onPress={() => handleQuickAction("bug")}
            color="red"
            badge="New"
          />

          <SupportCategory
            icon={<Ionicons name="bulb" size={20} color="white" />}
            title="Feature Request"
            description="Suggest new features or improvements"
            onPress={() => handleQuickAction("feature")}
            color="accent"
          />

          <SupportCategory
            icon={<Ionicons name="person-circle" size={20} color="white" />}
            title="Account Issues"
            description="Problems with login, data sync, or settings"
            onPress={() => handleQuickAction("account")}
            color="green"
          />

          <SupportCategory
            icon={<Ionicons name="chatbubbles" size={20} color="white" />}
            title="Live Chat Support"
            description="Chat with our support team (9 AM - 6 PM EST)"
            onPress={() => handleQuickAction("chat")}
            color="neutral"
          />
        </SectionSpacing>

        {/* Emergency Contact */}
        <SectionSpacing>
          <TouchableOpacity
            onPress={handleEmergencyContact}
            className="bg-red-50 border border-red-200 rounded-2xl p-4"
          >
            <RowLayout className="items-center">
              <IconContainer size="medium" color="red">
                <Ionicons name="warning" size={20} color="white" />
              </IconContainer>
              <View className="ml-4 flex-1">
                <Text className="font-semibold text-red-800 mb-1">
                  Urgent Issue?
                </Text>
                <Text className="text-sm text-red-700">
                  For critical problems that need immediate attention
                </Text>
              </View>
              <AntDesign name="right" size={16} color="#EF4444" />
            </RowLayout>
          </TouchableOpacity>
        </SectionSpacing>

        {/* Quick Fixes */}
        <SectionSpacing>
          <Card>
            <CardTitle className="mb-4">Quick Fixes</CardTitle>
            <View>
              <QuickFix
                title="App not tracking steps correctly"
                icon={<Ionicons name="footsteps" size={16} color="#3B82F6" />}
                steps={[
                  "Check that location services are enabled for Street Explorer",
                  "Make sure the app has permission to access motion & fitness data",
                  "Restart the app and try walking a short distance",
                  "If issue persists, restart your device",
                ]}
              />

              <QuickFix
                title="Streets not being marked as explored"
                icon={<Ionicons name="map" size={16} color="#3B82F6" />}
                steps={[
                  "Ensure you have a strong GPS signal",
                  "Walk at a moderate pace for better detection",
                  "Make sure you're walking on the actual street/sidewalk",
                  "Check that location accuracy is set to 'Precise' in settings",
                ]}
              />

              <QuickFix
                title="App running slowly or crashing"
                icon={<Ionicons name="speedometer" size={16} color="#3B82F6" />}
                steps={[
                  "Close other apps running in the background",
                  "Restart the Street Explorer app",
                  "Update to the latest version if available",
                  "Restart your device if problems continue",
                ]}
              />

              <QuickFix
                title="Data not syncing between devices"
                icon={<Ionicons name="sync" size={16} color="#3B82F6" />}
                steps={[
                  "Check that you're signed in to the same account on both devices",
                  "Ensure both devices have internet connection",
                  "Try manually syncing from Settings > Account > Sync Data",
                  "Sign out and sign back in if sync still fails",
                ]}
              />
            </View>
          </Card>
        </SectionSpacing>
      </ScrollView>
    </PageContainer>
  );
};
