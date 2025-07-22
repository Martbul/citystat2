// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   // NOTE: Update this to include the paths to all files that contain Nativewind classes.
//   content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"],
//   presets: [require("nativewind/preset")],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
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


//TODO: USE LATER FOR THEME CHANGE

// // tailwind.config.js
// module.exports = {
//   content: [
//     "./App.{js,jsx,ts,tsx}",
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   darkMode: 'class', // important!
//   theme: {
//     extend: {
//       colors: {
//         background: '#f0f0f0',
//         darkBackground: '#111111',
//         surface: '#ffffff',
//         darkSurface: '#1a1a1a',
//         text: '#111111',
//         darkText: '#ffffff',
//         muted: '#cecece',
//         accent: '#c8f751',
//       },
//       fontFamily: {
//         anybody: ['Anybody-Regular'],
//         anybodyBold: ['Anybody-Bold'],
//       },
//     },
//   },
//   plugins: [],
// };
