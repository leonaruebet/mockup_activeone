/**
 * Logo SVG Data
 * SVG path data for ActiveOne logo variants
 * Navy blue "A" with arrow notch design
 */

export const logoSvgPaths = {
  mainColor: {
    width: 100,
    height: 100,
    color: '#1e3a5f', // Navy blue - ActiveOne brand color
    paths: [
      // Main "A" shape with inner triangle cutout
      'M50 8 C48 8 46 9 45 11 L12 88 C10 92 12 95 16 95 L32 95 C35 95 37 93 38 91 L44 75 L56 75 L62 91 C63 93 65 95 68 95 L84 95 C88 95 90 92 88 88 L55 11 C54 9 52 8 50 8 Z M50 35 L54 62 L46 62 L50 35 Z',
      // Arrow notch at bottom right
      'M56 75 L62 91 C63 93 65 95 68 95 L72 95 L68 85 L60 75 Z'
    ]
  },
  black: {
    width: 100,
    height: 100,
    color: '#231f20',
    paths: [
      'M50 8 C48 8 46 9 45 11 L12 88 C10 92 12 95 16 95 L32 95 C35 95 37 93 38 91 L44 75 L56 75 L62 91 C63 93 65 95 68 95 L84 95 C88 95 90 92 88 88 L55 11 C54 9 52 8 50 8 Z M50 35 L54 62 L46 62 L50 35 Z',
      'M56 75 L62 91 C63 93 65 95 68 95 L72 95 L68 85 L60 75 Z'
    ]
  },
  white: {
    width: 100,
    height: 100,
    color: '#ffffff',
    paths: [
      'M50 8 C48 8 46 9 45 11 L12 88 C10 92 12 95 16 95 L32 95 C35 95 37 93 38 91 L44 75 L56 75 L62 91 C63 93 65 95 68 95 L84 95 C88 95 90 92 88 88 L55 11 C54 9 52 8 50 8 Z M50 35 L54 62 L46 62 L50 35 Z',
      'M56 75 L62 91 C63 93 65 95 68 95 L72 95 L68 85 L60 75 Z'
    ]
  }
};