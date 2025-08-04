
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
        lightContainerBg: "#212121",
        lightNeutralGray: "#c9c9c9ff",
        lightMutedText: "#cecece",
        lightBlackText: "#333333ff",
        lightPrimaryAccent: "#bddc62",
        lightSecondaryAccent: "#c8f751",
      },
      fontFamily: {
        anybody: ["Anybody-Regular"],
        anybodyBold: ["Anybody-Bold"],
      },
    },
  },
  plugins: [],
};


