import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

export const menuItems = [
  {
    label: "Home",
    icon: () => <MaterialIcons name="home" size={24} color="#333" />,
    route: "/(tabs)/index",
  },
  {
    label: "Map",
    icon: () => <MaterialIcons name="map" size={24} color="#333" />,
    route: "/(tabs)/mapscreen",
  },
  {
    label: "Explore",
    icon: () => <MaterialIcons name="explore" size={24} color="#333" />,
    route: "/(tabs)/explore",
  },
  {
    label: "Profile",
    icon: () => <MaterialIcons name="person" size={24} color="#333" />,
    route: "/(tabs)/profile",
  },
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
    route: "/settings",
  },
  {
    label: "Help & Support",
    icon: () => <MaterialIcons name="help-outline" size={24} color="#333" />,
    route: "/help",
  },
];
