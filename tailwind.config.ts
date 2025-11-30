import type { Config } from 'tailwindcss'
import baseConfig from './shared/ui/design-system/tailwind.config'

const sharedUiSources = [
  './shared/ui/index.{ts,tsx,js,jsx}',
  './shared/ui/atoms/**/*.{ts,tsx,js,jsx}',
  './shared/ui/molecules/**/*.{ts,tsx,js,jsx}',
  './shared/ui/organisms/**/*.{ts,tsx,js,jsx}',
  './shared/ui/templates/**/*.{ts,tsx,js,jsx}',
  './shared/ui/core/**/*.{ts,tsx,js,jsx}',
  './shared/ui/design-system/**/*.{ts,tsx,js,jsx}',
  './shared/ui/utils/**/*.{ts,tsx,js,jsx}',
]

const config: Config = {
  ...baseConfig,
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    ...sharedUiSources,
    ...(Array.isArray(baseConfig.content) ? baseConfig.content : []),
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      colors: {
        ...baseConfig.theme?.extend?.colors,
        primary: {
          DEFAULT: "#111827",
          foreground: "#ffffff",
        },
        brand: {
          red: "#f35549",
          blue: "#62bad0",
          navy: "#111827",
          primary: "#f35549",
          secondary: "#62bad0",
        }
      },
      fontFamily: {
        ...baseConfig.theme?.extend?.fontFamily,
        sans: ["var(--font-poppins)"],
      },
    },
  },
}

export default config
