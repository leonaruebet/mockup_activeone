/**
 * ActiveOne Brand Tokens
 * Core brand identity that should remain consistent across projects
 */

export const brandTokens = {
  // Brand Identity - LOCKED for ActiveOne
  brand: {
    primary: {
      orange: {
        50: '#fff1e6',
        100: '#fff2e9',
        200: '#ffd4b0',
        300: '#ffc08a',
        400: '#ffa354',
        500: '#ff9133',
        600: '#ff7500', // Main brand orange
        700: '#e86a00',
        800: '#b55300',
        900: '#8c4000',
      }
    },
    fonts: {
      // ActiveOne brand fonts - LOCKED
      primary: 'var(--font-plus-jakarta-sans)',
      secondary: 'var(--font-kanit)',
      display: 'var(--font-plus-jakarta-sans)',
    },
    logo: {
      // Logo configuration - LOCKED
      colors: {
        primary: '#ff7500',
        secondary: '#363a3d',
      }
    }
  },

  // Semantic Colors - Can be customized per project
  semantic: {
    // Noble Black - Deep, elegant black for text and backgrounds
    'noble-black': {
      100: '#e8e9e9',
      200: '#cdcecf',
      300: '#9b9c9e',
      400: '#686b6e',
      500: '#363a3d',
      600: '#1a1d21',
      700: '#131619',
      800: '#0d0f10',
      900: '#060708',
    },
    // Day Blue - Vibrant blue for highlights and interactive elements
    'day-blue': {
      100: '#ebedfc',
      200: '#d2d8f9',
      300: '#a6b0f2',
      400: '#7989ec',
      500: '#4d62e5',
      600: '#3045c9',
      700: '#243497',
      800: '#182364',
      900: '#0c1132',
    },
    // Stem Green - Natural green for success
    'stem-green': {
      100: '#f7fdf4',
      200: '#edfbe6',
      300: '#dbf7cd',
      400: '#c8f4b4',
      500: '#b6f09c',
      600: '#9ad37f',
      700: '#739f5f',
      800: '#4d6a3f',
      900: '#263520',
    },
    // Red Power - Bold red for errors
    'red-power': {
      100: '#fbecec',
      600: '#d0302f',
      900: '#2f0f0e',
    },
  },

  // System Colors - Fully customizable
  system: {
    background: {
      DEFAULT: '#f9fafb',
      'light-grey': '#f4f6f8',
      neutral: '#ffffff',
    },
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
  }
} as const;

export type BrandTokens = typeof brandTokens;