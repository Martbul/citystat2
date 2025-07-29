import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

export const menuItems = [
  {
    label: "Friends",
    icon: () => <FontAwesome5 name="user-friends" size={20} color="#333" />,
    route: "/friends",
  },
  {
    label: "Achievements",
    icon: () => <MaterialIcons name="emoji-events" size={24} color="#333" />,
    route: "/achievements",
  },
  {
    label: "Statistics",
    icon: () => <MaterialIcons name="bar-chart" size={24} color="#333" />,
    route: "/statistics",
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
