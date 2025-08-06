import { MessagesAllowance, RoleColors, TextSize, Theme } from "@/types/settings";

export const themeOptions = [
  { label: "Light", value: Theme.LIGHT },
  { label: "Dark", value: Theme.DARK },
  { label: "System", value: Theme.SYSTEM },
];

export const textSizeOptions = [
  { label: "Small", value: TextSize.SMALL },
  { label: "Medium", value: TextSize.MEDIUM },
  { label: "Large", value: TextSize.BIG },
];

export const roleColorOptions = [
  { label: "Next to Name", value: RoleColors.NEXTTONAME },
  { label: "In Name", value: RoleColors.INNAME },
  { label: "Don't Show", value: RoleColors.DONTSHOW },
  { label: "Sync Profile", value: RoleColors.SYNCPROFILECOLORS },
];

export const displayMessagesOptions = [
  { label: "All Messages", value: MessagesAllowance.ALLMSG },
  { label: "Unread Messages", value: MessagesAllowance.UNREADMAS },
  { label: "Hide", value: MessagesAllowance.HIDE },
];

export const fontStyleOptions = [
  { label: "Default", value: "Default" },
  { label: "Roboto", value: "Roboto" },
  { label: "Arial", value: "Arial" },
];
