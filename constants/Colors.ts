/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// const tintColorLight = '#0a7ea4';
// const tintColorDark = '#fff';

// export const Colors = {
//   light: {
//     text: '#11181C',
//     background: '#fff',
//     tint: tintColorLight,
//     icon: '#687076',
//     tabIconDefault: '#687076',
//     tabIconSelected: tintColorLight,
//   },
//   dark: {
//     text: '#ECEDEE',
//     background: '#151718',
//     tint: tintColorDark,
//     icon: '#9BA1A6',
//     tabIconDefault: '#9BA1A6',
//     tabIconSelected: tintColorDark,
//   },
// };


// src/theme/colors.js

// src/theme/colors.js

const LightColors = {
  background: "#f0f0f0",
  surface: "#fafafa",
  primaryText: "#111111",
  containerBg: "#212121",
  neutralGray: "#949494",
  mutedText: "#cecece",
  primaryAccent: "#c8f751",
  secondaryAccent: "#bddc62",
};

const DarkColors = {
  background: '#111111',
  surface: '#1a1a1a',
  text: '#ffffff',
  muted: '#cecece',
  accent: '#c8f751', // Keep it the same to maintain brand color
};

export const Colors = {
  light: LightColors,
  dark: DarkColors,
};
