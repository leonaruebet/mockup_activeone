/**
 * Textarea Component - Design System Compliant
 * Location: shared/ui/atoms/textarea/textarea.tsx
 *
 * Changelog:
 * - 2025-11-01: Refactored to use CVA pattern with size variants
 * - Removed hardcoded font-plus-jakarta-sans (inherits from design system)
 * - Added size variants matching Input component (sm, default, lg)
 * - Uses design system typography tokens (text-body-s, text-body-m, text-body-l)
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../utils"

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-lg border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      size: {
        sm: "px-3 py-1.5 text-body-s",
        default: "px-3 py-2 text-body-m",
        lg: "px-4 py-3 text-body-l",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
