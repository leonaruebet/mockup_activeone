/**
 * Design System Styles Index
 * 
 * This file exports the design system styles for use across the application.
 * Import this to get access to all design system utilities.
 */

// Local logger fallback for styles module
const styleLogger = {
  info: (message: string) => console.log(`[${new Date().toISOString()}] STYLES: ${message}`)
};

// Export the main design system CSS - this will need to be imported as CSS
export const DESIGN_SYSTEM_CSS_PATH = './design-system.css'

// Export the global CSS with design system
export const GLOBAL_CSS_PATH = './globals.css'

/**
 * Usage in Next.js applications:
 * 
 * // In your layout.tsx or app.tsx
 * import '@/libs/ui/design-system/styles/globals.css'
 * 
 * // Or if you want only the design system without Tailwind:
 * import '@/libs/ui/design-system/styles/design-system.css'
 */

styleLogger.info('Design system styles export configuration initialized'); 