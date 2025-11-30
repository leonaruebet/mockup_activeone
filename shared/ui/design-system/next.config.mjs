/** @type {import('next').NextConfig} */
const nextConfig = {
  // [2025-01-15T16:05:07+07:00] SECURITY FIX design-system/next.config.mjs - removed dangerous bypasses
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Proper TypeScript configuration - no bypasses
  typescript: {
    // Build will fail on TypeScript errors - as it should for security
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration - no bypasses
  eslint: {
    // Build will fail on ESLint errors - as it should for security
    ignoreDuringBuilds: false,
  },
  
  // Proper image optimization - security enabled
  images: {
    // Enable image optimization for security and performance
    unoptimized: false,
  },
}

// Log the security fix
console.log("[2025-01-15T16:05:07+07:00] SECURITY_FIX design-system/next.config.mjs – removed dangerous build bypasses");

export default nextConfig
