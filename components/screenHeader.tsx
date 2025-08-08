// import React from "react";
// import { TouchableOpacity, View, Text, StatusBar } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Entypo from "@expo/vector-icons/Entypo";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import Fontisto from "@expo/vector-icons/Fontisto";
// import { Ionicons } from "@expo/vector-icons";

// interface HeaderAction {
//   icon: React.ReactNode;
//   onPress: () => void;
//   testId?: string;
// }

// interface StatCardData {
//   title: string;
//   value: number | string;
//   subtitle: string;
//   icon: React.ReactNode;
// }

// interface ScreenHeaderProps {
//   // Left side actions
//   showMenuButton?: boolean;
//   onMenuPress?: () => void;
//   leftActions?: HeaderAction[];

//   // Right side actions
//   rightActions?: HeaderAction[];

//   // Content area
//   showStatsCards?: boolean;
//   statsCards?: StatCardData[];
//   customContent?: React.ReactNode;

//   // Styling
//   backgroundColor?: string;
//   statusBarStyle?: "light-content" | "dark-content";
//   statusBarBackgroundColor?: string;
//   containerClassName?: string;
//   contentClassName?: string;
// }

// const StatCard = ({ title, value, subtitle, icon }: StatCardData) => (
//   <View className="w-[28%] h-32">
//     <View className="flex-1 rounded-2xl p-4 bg-lightContainerBg border border-lightMutedText">
//       <View className="justify-between h-full">
//         <View className="flex-row justify-between items-center">
//           <Text className="text-lightMutedText font-anybody text-xs">
//             {title}
//           </Text>
//           {icon}
//         </View>
//         <Text className="text-white font-anybodyBold text-2xl mt-1">
//           {value}
//         </Text>
//         {subtitle && (
//           <Text className="text-lightMutedText text-[11px] mt-1 font-anybody">
//             {subtitle}
//           </Text>
//         )}
//       </View>
//     </View>
//   </View>
// );

// export default function ScreenHeader({
//   showMenuButton = false,
//   onMenuPress,
//   leftActions = [],
//   rightActions = [],
//   showStatsCards = false,
//   statsCards = [],
//   customContent,
//   backgroundColor = "#c9c9c9ff",
//   statusBarStyle = "light-content",
//   statusBarBackgroundColor = "#c9c9c9ff",
//   containerClassName = "bg-lightNeutralGray px-4 pt-12 pb-9 rounded-b-2xl",
//   contentClassName = "",
// }: ScreenHeaderProps) {
//   return (
//     <SafeAreaView className={containerClassName}>
//       <StatusBar
//         barStyle={statusBarStyle}
//         backgroundColor={statusBarBackgroundColor}
//       />

//       {/* Header Row */}
//       <View className="flex-row justify-between items-center">
//         {/* Left Side */}
//         <View className="flex-row items-center">
//           {showMenuButton && onMenuPress && (
//             <TouchableOpacity onPress={onMenuPress} className="mr-4 mt-1">
//               <Entypo name="menu" size={26} color="#333333" />
//             </TouchableOpacity>
//           )}

//           {leftActions.map((action, index) => (
//             <TouchableOpacity
//               key={index}
//               onPress={action.onPress}
//               className="mr-3"
//               testID={action.testId}
//             >
//               {action.icon}
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Right Side */}
//         <View className="flex-row gap-3">
//           {rightActions.map((action, index) => (
//             <TouchableOpacity
//               key={index}
//               onPress={action.onPress}
//               className="w-10 h-10 bg-lightContainerBg rounded-full justify-center items-center"
//               testID={action.testId}
//             >
//               {action.icon}
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Content Area */}
//       {(showStatsCards || customContent) && (
//         <View className={`mt-5 ${contentClassName}`}>
//           {showStatsCards && statsCards.length > 0 && (
//             <View className="flex-row justify-between">
//               {statsCards.map((card, index) => (
//                 <StatCard key={index} {...card} />
//               ))}
//             </View>
//           )}

//           {customContent}
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// // Pre-configured variants for common use cases
// export const HomeScreenHeader = ({
//   onMenuPress,
//   onSearchPress,
//   onNotificationPress,
//   statsCards = [],
// }: {
//   onMenuPress?: () => void;
//   onSearchPress?: () => void;
//   onNotificationPress?: () => void;
//   statsCards?: StatCardData[];
// }) => (
//   <ScreenHeader
//     showMenuButton={true}
//     onMenuPress={onMenuPress}
//     rightActions={[
//       {
//         icon: <Fontisto name="search" size={18} color="white" />,
//         onPress: onSearchPress || (() => {}),
//       },
//       {
//         icon: (
//           <MaterialIcons name="notifications-active" size={20} color="white" />
//         ),
//         onPress: onNotificationPress || (() => {}),
//       },
//     ]}
//     showStatsCards={true}
//     statsCards={statsCards}
//   />
// );

// export const ProfileScreenHeader = ({
//   onSettingsPress,
// }: {
//   onSettingsPress?: () => void;
// }) => (
//   <ScreenHeader
//     rightActions={[
//       {
//         icon: <Ionicons name="settings" size={20} color="white" />,
//         onPress: onSettingsPress || (() => {}),
//       },
//     ]}
//     containerClassName="flex flex-row items-center justify-end gap-3 items-center px-4 pt-8 pb-9 bg-lightNeutralGray"
//   />
// );
