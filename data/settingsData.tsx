import { FontAwesome5, Entypo, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

export const settings = [
  {
    label: "Get Nitro",
    icon: () => <MaterialIcons name="speed" size={20} color="333333ff" />,
  },
  {
    label: "Account",
    icon: () => <FontAwesome5 name="user-circle" size={20} color="333333ff" />,
  },
  {
    label: "Content & Social",
    icon: () => <Entypo name="users" size={20} color="333333ff" />,
  },
  {
    label: "Data & Privacy",
    icon: () => <Ionicons name="shield-checkmark" size={20} color="333333ff" />,
  },
  {
    label: "Family Centre",
    icon: () => <Ionicons name="people" size={20} color="333333ff" />,
  },
  {
    label: "Authorised Apps",
    icon: () => <Feather name="key" size={20} color="333333ff" />,
  },
  {
    label: "Devices",
    icon: () => (
      <Entypo name="tablet-mobile-combo" size={20} color="333333ff" />
    ),
  },
  {
    label: "Connections",
    icon: () => <Entypo name="link" size={20} color="333333ff" />,
  },
  {
    label: "Clips",
    icon: () => <Feather name="film" size={20} color="333333ff" />,
  },
  {
    label: "Scan QR Code",
    icon: () => <Ionicons name="qr-code" size={20} color="333333ff" />,
  },
];
