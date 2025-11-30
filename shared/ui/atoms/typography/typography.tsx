import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      "heading-xl": "text-heading-xl",
      "heading-l": "text-heading-l",
      "heading-m": "text-heading-m",
      "heading-s": "text-heading-s",
      "heading-xs": "text-heading-xs",
      h1: "text-heading-xl",
      h2: "text-heading-l",
      h3: "text-heading-m",
      h4: "text-heading-s",
      h5: "text-heading-xs",
      h6: "text-heading-xs",
      "body-xl": "text-body-xl",
      "body-l": "text-body-l",
      "body-m": "text-body-m",
      "body-s": "text-body-s",
      body: "text-body-l",
      body1: "text-body-l",
      body2: "text-body-m",
      caption: "text-body-s",
      subtitle: "text-body-m",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    font: {
      sans: "font-kanit",
      kanit: "font-kanit",
      thai: "font-thai",
    },
  },
  defaultVariants: {
    variant: "body-l",
    font: "sans",
    weight: "normal",
  },
})

export interface TypographyProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
  as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, font, weight, as: Component, ...props }: TypographyProps, ref) => {
    // Auto-select appropriate HTML element based on variant
    const DefaultElement = Component || getDefaultElement(variant)

    return (
      <DefaultElement
        className={cn(typographyVariants({ variant, font, weight }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)

// Helper function to get default HTML element for each variant
function getDefaultElement(variant: TypographyProps['variant'] | undefined): React.ElementType {
  switch (variant) {
    case "heading-xl":
    case "h1":
      return "h1"
    case "heading-l":
    case "h2":
      return "h2"
    case "heading-m":
    case "h3":
      return "h3"
    case "heading-s":
    case "h4":
      return "h4"
    case "heading-xs":
    case "h5":
    case "h6":
      return "h5"
    default:
      return "p"
  }
}
Typography.displayName = "Typography"

export { Typography, typographyVariants }
