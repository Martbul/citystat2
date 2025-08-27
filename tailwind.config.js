
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
        // Base colors
        // background: "#f3f3f3ff",
        darkBackground: "#111111",
        // surface: "#ffffff",
        darkSurface: "#1a1a1a",
        text: "#111111",
        darkText: "#ffffff",
        muted: "#cecece",
        accent: "#c8f751",
        transparent: "transparent",
        
        // Light theme colors
        lightBackground: "#ebebeb",
        lightSurface: "#fafafa",
        lightPrimaryText: "#111111",
        lightContainerBg: "#1F2937",
        lightNeutralGray: "#c9c9c9ff",
        lightMutedText: "#cecece",
        lightBlackText: "#333333ff",
        lightPrimaryAccent: "#bddc62",
        
        // Panel and container colors
        panelDark: "#1F2937",
        panelDarker: "#111827",
        containerBg: "#F9FAFB",
        
        // Text colors hierarchy
        textDark: "#1F2937",
        textBlack: "#111827",
        textGray: "#9CA3AF",
        textDarkGray: "#6B7280",
        
        // Accent and status colors
        iconGreen: "#10B981",
        statusActive: "#059669",
        sessionBlue: "#3B82F6",
      },
      fontFamily: {
        anybody: ["Anybody-Regular"],
        anybodyBold: ["Anybody-Bold"],
      },
      
      // Custom spacing for consistent layout
      spacing: {
        '18': '4.5rem',  // 72px - for larger gaps
        '22': '5.5rem',  // 88px - for section spacing
      },
      
      // Custom border radius for modern rounded corners
      borderRadius: {
        '2xl': '1rem',   // 16px - standard card radius
        '3xl': '1.5rem', // 24px - larger card radius (your profile cards)
        '4xl': '2rem',   // 32px - extra large radius
      },
      
      // Custom shadows for depth
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'profile': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      
      // Custom backdrop blur
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
  
  // Add custom utility classes for your common patterns
  safelist: [
    // Icon container patterns
    'w-8', 'h-8', 'w-10', 'h-10', 'w-12', 'h-12', 'w-14', 'h-14',
    'rounded-xl', 'rounded-2xl', 'rounded-3xl',
    'bg-accent', 'bg-iconGreen/10', 'bg-sessionBlue/10', 'bg-white/10',
    'shadow-sm', 'shadow-lg',
    
    // Text size patterns
    'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
    'font-medium', 'font-semibold', 'font-bold',
    
    // Spacing patterns
    'p-4', 'p-6', 'px-4', 'py-6', 'mb-4', 'mb-6', 'mb-8',
    'gap-2', 'gap-3', 'gap-4',
    
    // Layout patterns
    'flex', 'flex-row', 'flex-col', 'items-center', 'justify-between', 'justify-center',
    
    // Border patterns
    'border', 'border-gray-100', 'border-white/20',
  ]
};
