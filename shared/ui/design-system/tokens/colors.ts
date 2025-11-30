export const colorTokens = {
  // Primary Orange Colors
  primary: {
    50: "#fff1e6", // linen-200
    100: "#fff2e9", // linen-100
    200: "#ffd4b0", // peachpuff
    300: "#ffc08a", // burlywood
    400: "#ffa354", // sandybrown
    500: "#ff9133", // darkorange-100
    600: "#ff7500", // darkorange-200
    700: "#e86a00", // chocolate-200
    800: "#b55300", // chocolate-300
    900: "#8c4000", // saddlebrown-100
  },
  // Noble Black - Deep, elegant black for text and backgrounds
  "noble-black": {
    100: "#e8e9e9", // whitesmoke-300
    200: "#cdcecf", // lightgray
    300: "#9b9c9e", // darkgray
    400: "#686b6e", // dimgray
    500: "#363a3d", // darkslategray-200
    600: "#1a1d21", // gray-300c
    700: "#131619", // gray-500
    800: "#0d0f10", // gray-700
    900: "#060708", // gray-800
  },
  // Day Blue - Vibrant blue for highlights and interactive elements
  "day-blue": {
    100: "#ebedfc", // lavender-100
    200: "#d2d8f9", // lavender-300
    300: "#a6b0f2", // cornflowerblue-100
    400: "#7989ec", // cornflowerblue-200
    500: "#4d62e5", // royalblue
    600: "#3045c9", // slateblue
    700: "#243497", // midnightblue-100
    800: "#182364", // darkslateblue
    900: "#0c1132", // gray-600
  },
  // Facebook Blue - Facebook's signature blue color for brand consistency
  "facebook-blue": {
    100: "#e7f3ff", // Very light blue background
    200: "#cce7ff", // Light blue background
    300: "#b3d9ff", // Soft blue background
    400: "#8fc9ff", // Medium light blue
    500: "#66b3ff", // Facebook-style blue
    600: "#1877f2", // Facebook primary blue (#1877f2)
    700: "#166fe5", // Darker Facebook blue
    800: "#0d47a1", // Deep Facebook blue
    900: "#0a2d5c", // Very dark Facebook blue
  },
  // Purple Blue - Sophisticated blue with purple undertones
  "purple-blue": {
    100: "#f0e8fd", // lavender-200
    200: "#deccfb", // thistle
    300: "#bd9af8", // mediumpurple
    400: "#9c67f4", // mediumslateblue
    500: "#7c35f1", // blueviolet-100
    600: "#5f18d4", // blueviolet-200
    700: "#47129f", // darkblue
    800: "#300c6a", // midnightblue-200
    900: "#180635", // midnightblue-300
  },
  // Sunglow - Warm, inviting yellow for accents
  sunglow: {
    100: "#fffaea", // oldlace
    200: "#fff3d1", // cornsilk
    300: "#ffe8a3", // palegoldenrod-100
    400: "#ffdc75", // khaki
    500: "#ffd147", // goldenrod-100
    600: "#e2b42b", // goldenrod-200
    700: "#aa8720", // darkgoldenrod
    800: "#715a15", // darkolivegreen-200
    900: "#392d0b", // gray-100
  },
  // Stem Green - Natural green for success or positive feedback
  "stem-green": {
    100: "#f7fdf4", // mintcream-100
    200: "#edfbe6", // honeydew
    300: "#dbf7cd", // lightgoldenrodyellow
    400: "#c8f4b4", // palegoldenrod-200
    500: "#b6f09c", // lightgreen-100
    600: "#9ad37f", // lightgreen-200
    700: "#739f5f", // darkseagreen
    800: "#4d6a3f", // darkolivegreen-100
    900: "#263520", // darkslategray-300
  },
  // Heisenberg Blue - Cool, neutral gray-blue for backgrounds and borders
  "heisenberg-blue": {
    100: "#f1fbfe", // aliceblue-100
    200: "#e0f6fd", // aliceblue-200
    300: "#c0edfb", // powderblue
    400: "#a1e4f9", // lightblue
    500: "#82dbf7", // skyblue-100
    600: "#65beda", // skyblue-200
    700: "#4c8fa4", // cadetblue
    800: "#335f6d", // darkslategray-100
    900: "#193037", // darkslategray-400
  },
  // Happy Orange - Cheerful orange for alerts and warnings
  "happy-orange": {
    100: "#fff2e9", // linen-100
    600: "#e26f20", // chocolate-100
    900: "#391c08", // gray-200
  },
  // Electric Green - Bright green for active states or emphasis
  "electric-green": {
    100: "#f3fbf7", // mintcream-200
    600: "#4ac97e", // mediumseagreen
    900: "#122b1d", // darkslategray-500
  },
  // Red Power - Bold red for errors and destructive actions
  "red-power": {
    100: "#fbecec", // lavenderblush
    600: "#d0302f", // firebrick
    900: "#2f0f0e", // gray-400
  },
  // Background colors
  bg: {
    DEFAULT: "#f9fafb", // whitesmoke-100
    "light-grey": "#f4f6f8", // whitesmoke-200
    neutral: "#ffffff", // white
  },
} as const

export type ColorToken = keyof typeof colorTokens
export type ColorShade = keyof typeof colorTokens.primary
