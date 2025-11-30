export const typographyTokens = {
  fontFamily: {
    sans: "var(--font-plus-jakarta-sans)",
    kanit: "var(--font-kanit)",
  },
  fontSize: {
    "heading-xl": { size: "36px", lineHeight: "44px" },
    "heading-l": { size: "32px", lineHeight: "40px" },
    "heading-m": { size: "28px", lineHeight: "36px" },
    "heading-s": { size: "24px", lineHeight: "32px" },
    "heading-xs": { size: "20px", lineHeight: "28px" },
    "body-xl": { size: "18px", lineHeight: "28px" },
    "body-l": { size: "16px", lineHeight: "24px" },
    "body-m": { size: "14px", lineHeight: "20px" },
    "body-s": { size: "12px", lineHeight: "18px" },
  },
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const

export type TypographyVariant = keyof typeof typographyTokens.fontSize
export type FontWeight = keyof typeof typographyTokens.fontWeight
