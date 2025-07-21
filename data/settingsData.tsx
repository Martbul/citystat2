import { FontAwesome5, Entypo, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

export const settings = [
  {
    label: "Get Nitro",
    icon: () => <MaterialIcons name="speed" size={20} color="white" />,
  },
  {
    label: "Account",
    icon: () => <FontAwesome5 name="user-circle" size={20} color="white" />,
  },
  {
    label: "Content & Social",
    icon: () => <Entypo name="users" size={20} color="white" />,
  },
  {
    label: "Data & Privacy",
    icon: () => <Ionicons name="shield-checkmark" size={20} color="white" />,
  },
  {
    label: "Family Centre",
    icon: () => <Ionicons name="people" size={20} color="white" />,
  },
  {
    label: "Authorised Apps",
    icon: () => <Feather name="key" size={20} color="white" />,
  },
  {
    label: "Devices",
    icon: () => <Entypo name="tablet-mobile-combo" size={20} color="white" />,
  },
  {
    label: "Connections",
    icon: () => <Entypo name="link" size={20} color="white" />,
  },
  {
    label: "Clips",
    icon: () => <Feather name="film" size={20} color="white" />,
  },
  {
    label: "Scan QR Code",
    icon: () => <Ionicons name="qr-code" size={20} color="white" />,
  },
  
];
