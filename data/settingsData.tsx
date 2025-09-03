import { FontAwesome5, Ionicons, AntDesign, Feather, MaterialCommunityIcons, MaterialIcons, FontAwesome, SimpleLineIcons } from "@expo/vector-icons";

export const settings = [
  {
    label: "Account",
    icon: () => <FontAwesome name="user-circle-o" size={24} color="black" />,
    route: "/(settings)/account",
  },
  // {
  //   label: "Data & Privacy",
  //   icon: () => <FontAwesome5 name="fingerprint" size={24} color="black" />,
  //   route: "/(settings)/dataAndPrivacy",
  // },
  {
    label: "Devices",
    icon: () => <MaterialIcons name="devices" size={24} color="black" />,
    route: "/(settings)/devices",
  },
  // {
  //   label: "Connections",
  //   icon: () =><MaterialCommunityIcons name="connection" size={24} color="black" />,
  //   route: "/(settings)/connections",
  // },
  // {
  //   label: "Appearance",
  //   icon: () => (
  //     <MaterialCommunityIcons name="palette-outline" size={24} color="black" />
  //   ),
  //   route: "/(settings)/appearance",
  // },
  // {
  //   label: "Accessibility",
  //   icon: () => <Ionicons name="accessibility-outline" size={24} color="black" />,
  //   route: "/(settings)/accessibility",
  // },
  // {
  //   label: "Language",
  //   icon: () => <Ionicons name="language-outline" size={24} color="black" />,
  //   route: "/(settings)/language",
  // },
  // {
  //   label: "Notifications",
  //   icon: () => <Feather name="bell" size={24} color="black" />,
  //   route: "/(settings)/notifications",
  // },
  // {
  //   label: "Advanced",
  //   icon: () => <Ionicons name="settings-outline" size={24} color="black" />,
  //   route: "/(settings)/advanced",
  // },
  {
    label: "Support",
    icon: () => <AntDesign name="questioncircleo" size={24} color="black" />,
    route: "/(settings)/support",
  },
  {
    label: "Info",
    icon: () => <SimpleLineIcons name="info" size={24} color="black" />,
    route: "/(settings)/info",
  },
  // {
  //   label: "Acknowledgements",
  //   icon: () => <AntDesign name="exclamationcircleo" size={24} color="black" />,
  //   route: "/(settings)/acknowledgements",
  // },
  // {
  //   label: "What's New",
  //   icon: () => <AntDesign name="infocirlceo" size={24} color="black" />,
  //   route: "/(settings)/whatsNew",
  // },
];
