
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#f3f3f3ff",
        darkBackground: "#111111",
        surface: "#ffffff",
        darkSurface: "#1a1a1a",
        text: "#111111",
        darkText: "#ffffff",
        muted: "#cecece",
        accent: "#c8f751",

        lightBackground: "#ebebeb",
        lightSurface: "#fafafa",
        lightPrimaryText: "#111111",
        lightContainerBg: "#1F2937",
        lightNeutralGray: "#c9c9c9ff",
        lightMutedText: "#cecece",
        lightBlackText: "#333333ff",
        lightPrimaryAccent: "#bddc62",
        lightSecondaryAccent: "#c8f751",

        panelDark: "#1F2937",
         textDark: "#1F2937",
        panelDarker: "#111827", 
        cardBg: "rgba(255, 255, 255, 0.9)",
        iconGreen: "#10B981",
        textGray: "#9CA3AF",
        textLightGray: "#D1D5DB",
        textDarkGray: "#6B7280",
        textBlack: "#111827",
        statusActive: "#059669",
        sessionBlue: "#3B82F6",
        containerBg: "#F9FAFB",
      },
      fontFamily: {
        anybody: ["Anybody-Regular"],
        anybodyBold: ["Anybody-Bold"],
      },
    },
  },
  plugins: [],
};


