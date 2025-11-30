"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "../../utils"

const tagVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        // Standard Badge-style variants using design system colors
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-none bg-gradient-to-br from-red-power-100 to-red-power-600 !text-red-power-900",
        outline: "text-foreground border-border bg-background",
        ghost: "border-transparent bg-transparent text-muted-foreground",
        primary: "border-none bg-gradient-to-br from-primary-600 to-primary-700 text-primary-50",

        // Design system color variants with enhanced gradients and darker text colors (no hover)
        "day-blue": "border-none bg-gradient-to-br from-day-blue-200 to-day-blue-300 !text-day-blue-700",
        "blue": "border-none bg-gradient-to-br from-facebook-blue-200 to-facebook-blue-300 !text-facebook-blue-700",
        "stem-green": "border-none bg-gradient-to-br from-stem-green-200 to-stem-green-300 !text-stem-green-700",
        "heisenberg-blue": "border-none bg-gradient-to-br from-heisenberg-blue-200 to-heisenberg-blue-300 !text-heisenberg-blue-700",
        "happy-orange": "border-none bg-gradient-to-br from-primary-100 to-primary-200 !text-primary-600",
        "electric-green": "border-none bg-gradient-to-br from-stem-green-200 to-stem-green-300 !text-electric-green-600",
        "red-power": "border-none bg-gradient-to-br from-red-power-100 to-red-power-100 !text-red-power-600",
        "purple-blue": "border-none bg-gradient-to-br from-purple-blue-200 to-purple-blue-300 !text-purple-blue-700",
        sunglow: "border-none bg-gradient-to-br from-sunglow-200 to-sunglow-300 !text-sunglow-700",

        // Solid colored variants with enhanced gradients and light text (no hover)
        "day-blue-solid": "border-none bg-gradient-to-br from-day-blue-600 to-day-blue-700 text-day-blue-100",
        "blue-solid": "border-none bg-gradient-to-br from-facebook-blue-600 to-facebook-blue-700 text-facebook-blue-100",
        "stem-green-solid": "border-none bg-gradient-to-br from-stem-green-600 to-stem-green-700 text-stem-green-100",
        "heisenberg-blue-solid": "border-none bg-gradient-to-br from-heisenberg-blue-600 to-heisenberg-blue-700 text-heisenberg-blue-100",
        "happy-orange-solid": "border-none bg-gradient-to-br from-primary-600 to-primary-700 text-primary-50",
        "electric-green-solid": "border-none bg-gradient-to-br from-stem-green-700 to-stem-green-800 text-stem-green-100",
        "red-power-solid": "border-none bg-gradient-to-br from-red-power-600 to-red-power-600 text-red-power-100",
        "purple-blue-solid": "border-none bg-gradient-to-br from-purple-blue-600 to-purple-blue-700 text-purple-blue-100",
        "sunglow-solid": "border-none bg-gradient-to-br from-sunglow-600 to-sunglow-700 text-sunglow-100",

        // Simple gray variant (no hover to prevent black color)
        gray: "border-transparent bg-muted text-muted-foreground",

        // Legacy orange variant for backward compatibility with darker readable text color
        orange: "border-none bg-gradient-to-br from-primary-100 to-primary-200 !text-primary-600",

        // Semantic variants (success, warning, info, error)
        success: "border-none bg-gradient-to-br from-electric-green-200 to-electric-green-300 !text-electric-green-700",
        warning: "border-none bg-gradient-to-br from-sunglow-200 to-sunglow-300 !text-sunglow-700",
        info: "border-none bg-gradient-to-br from-day-blue-200 to-day-blue-300 !text-day-blue-700",
        error: "border-none bg-gradient-to-br from-red-power-200 to-red-power-300 !text-red-power-700",
      },
      size: {
        sm: "px-2 py-0.5 text-body-s",
        md: "px-3 py-1.5 text-body-s",
        lg: "px-4 py-2 text-body-m",
      },
      removable: {
        true: "pr-6",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      removable: false,
    },
  },
)

export interface TagProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tagVariants> {
  onRemove?: () => void
  children: React.ReactNode
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, variant, size, removable, onRemove, children, ...props }, ref) => {
    const isRemovable = removable || onRemove !== undefined

    return (
      <div ref={ref} className={cn(tagVariants({ variant, size, removable: isRemovable }), className)} {...props}>
        {children}

        {/* Remove button for removable variants */}
        {isRemovable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Remove tag"
          >
            <X className="w-2 h-2" />
          </button>
        )}
      </div>
    )
  },
)
Tag.displayName = "Tag"

// Unified Tag/Badge component
export { Tag, tagVariants }

// Legacy Badge alias for backward compatibility
export const Badge = Tag
export const badgeVariants = tagVariants
export type BadgeProps = TagProps
