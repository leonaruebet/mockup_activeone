import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../utils"

const inputVariants = cva(
  "flex w-full rounded-lg bg-background ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none active:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-whitesmoke-300 dark:border-gray-700 active:border-whitesmoke-300 dark:active:border-gray-700",
        ghost: "border-0 border-transparent active:border-transparent",
      },
      size: {
        default: "h-9 px-3 py-2 text-body-m file:text-body-m",
        sm: "h-8 px-3 py-1.5 text-body-s file:text-body-s",
        lg: "h-11 px-4 py-3 text-body-l file:text-body-l",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", size, variant, ...props }: InputProps, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, variant }), className)}
        data-variant={variant}
        ref={ref}
        suppressHydrationWarning={true}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
