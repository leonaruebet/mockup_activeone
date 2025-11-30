import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils"

/**
 * Button component using design system colors via Tailwind utilities
 *
 * IMPORTANT: Uses Tailwind color classes (e.g., bg-primary-600) instead of
 * hardcoded hex values to ensure colors render correctly from the design system.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none active:ring-0 active:shadow-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary - Uses ActiveOne brand orange from design system
        default:
          "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md",
        primary:
          "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md",
        // Secondary - Neutral background using design system tokens
        secondary:
          "bg-whitesmoke-200 text-noble-black-500 hover:bg-noble-black-100 active:bg-noble-black-200 border border-noble-black-200",
        // Outline - Border with brand color from design system
        outline:
          "border border-noble-black-200 bg-white text-noble-black-500 hover:bg-whitesmoke-100 hover:border-primary-600 active:bg-whitesmoke-200",
        // Ghost - Minimal styling using design system colors
        ghost:
          "text-noble-black-500 hover:bg-whitesmoke-100 active:bg-whitesmoke-200",
        // Link - Text-only with brand color from design system
        link:
          "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 active:text-primary-800",
        // Semantic variants using design system semantic colors (matching toast colors)
        destructive:
          "bg-red-power-600 text-white hover:bg-red-power-700 active:bg-red-power-800 shadow-sm",
        success:
          "bg-electric-green-600 text-white hover:bg-electric-green-700 active:bg-electric-green-800 shadow-sm",
        warning:
          "bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 shadow-sm",
        info:
          "bg-day-blue-500 text-white hover:bg-day-blue-600 active:bg-day-blue-700 shadow-sm",
      },
      size: {
        // Mobile-optimized: min 44px touch targets (iOS/Android guideline)
        // Uses design system typography tokens (text-body-s, text-body-m) - font inherits from global design system
        default: "h-11 px-4 py-2.5 text-body-s", // 44px
        sm: "h-10 rounded-md px-3 py-2 text-body-s", // 40px - increased from 32px
        lg: "h-12 rounded-lg px-6 py-3 text-body-m", // 48px
        icon: "h-11 w-11 p-0", // 44px - increased from 40px
        "icon-sm": "h-10 w-10 p-0", // 40px - increased from 32px
        "icon-lg": "h-12 w-12 p-0", // 48px
        md: "h-11 px-4 py-2.5 text-body-s",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }: ButtonProps, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
