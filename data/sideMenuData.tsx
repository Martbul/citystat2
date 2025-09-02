import { FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";

export const menuItems = [
  {
    label: "Friends",
    icon: () => <FontAwesome5 name="user-friends" size={20} color="#333" />,
    route: "/friends",
  },
  {
    label: "Challenges",
    icon: () => <FontAwesome6 name="star" size={20} color="black" />,
    route: "/(screens)/challenges",
  },
  {
    label: "Statistics",
    icon: () => <MaterialIcons name="bar-chart" size={24} color="#333" />,
    route: "/(screens)/statisticsScreen",
  },
  {
    label: "Settings",
    icon: () => <MaterialIcons name="settings" size={24} color="#333" />,
    route: "/(settings)/settings",
  },
  {
    label: "Help & Support",
    icon: () => <MaterialIcons name="help-outline" size={24} color="#333" />,
    route: "/help",
  },
];
