import Header from "@/components/header";
import { View, Text, ScrollView, Image, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WhatsNew() {
  return (
    <SafeAreaView className="flex-1 bg-lightBackground">
      <StatusBar barStyle="light-content" backgroundColor="#ebebeb" />

      <Header title="What's New" />
      <ScrollView className="bg-lightSurface px-4 py-6">
        <Text className="text-muted mb-4">30 June 2025</Text>

        {/* Wordle & /share */}
        <Text className="text-lightPrimaryText mb-4">
          Type <Text className="italic font-bold">/wordle</Text> in any chat to
          play Wordle... then,{" "}
          <Text className="bg-lightNeutralGray text-darkBackground font-mono px-1 rounded">
            /share
          </Text>{" "}
          your results in other channels or DMs.
        </Text>

        {/* Section Header */}
        <Text className="text-lightSecondaryAccent font-bold text-lg mt-6 mb-2">
          QUICK! LET&apos;S SWITCH TO FIXES
        </Text>

        {/* April */}
        <Text className="mb-3 text-lightPrimaryText">
          <Text className="text-accent font-bold">In April,</Text> we upgraded
          the <Text className="font-bold">Quick Switcher</Text>...{" "}
          <Text className="text-lightPrimaryAccent underline">
            try it out sometime!
          </Text>
        </Text>

        {/* May */}
        <Text className="mb-3 text-lightPrimaryText">
          <Text className="text-accent font-bold">In May,</Text> we added{" "}
          <Text className="font-bold">
            Markdown syntax for email addresses.
          </Text>{" "}
          Wrap emails like{" "}
          <Text className="bg-lightNeutralGray text-darkBackground px-1">
            &lt;like this&gt;
          </Text>{" "}
          to make them clickable.
        </Text>

        {/* June */}
        <Text className="mb-4 text-lightPrimaryText">
          <Text className="text-accent font-bold">In June,</Text> mobile image
          embeds got a quality boost for compression and performance.
        </Text>

        {/* Upgrade Section */}
        <Text className="text-lightSecondaryAccent font-bold text-lg mt-6 mb-2">
          UPGRADE YOUR COMMUNITY AND YOUR PROFILE
        </Text>
        <Text className="mb-6 text-lightPrimaryText">
          <Text className="font-bold">
            Put your extra Server Boosts to work
          </Text>{" "}
          and{" "}
          <Text className="text-lightPrimaryAccent underline">
            unlock new features
          </Text>
          !
        </Text>

        {/* Server Tags Section */}
        <Image
          source={require("../../assets/images/realdeallogoprimarypng.png")} // Make sure this image exists
          className="w-full h-32 mb-4 rounded"
          resizeMode="contain"
        />
        <Text className="text-lightPrimaryText font-bold text-base mb-2">
          Seen a strange new label next to your friends&apos; names lately?
        </Text>
        <Text className="mb-4 text-lightPrimaryText">
          They&apos;re called <Text className="font-bold">Server Tags!</Text> Click
          to learn about the servers people are repping.{" "}
          <Text className="text-lightPrimaryAccent underline">Set a tag</Text>{" "}
          in Profile Settings or ask an admin to enable them.
        </Text>

        {/* Saved Avatars Section */}
        <Text className="text-lightSecondaryAccent font-bold text-lg mt-6 mb-2">
          S-A-V-E-D AVATARS & GUESSING G-A-M-E-S
        </Text>
        <Text className="mb-10 text-lightPrimaryText">
          <Text className="font-bold">On desktop,</Text> your last six avatars
          are now saved in Profile Settings!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
