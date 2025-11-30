import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils"

const gridVariants = cva("grid", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      12: "grid-cols-12",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
    },
    responsive: {
      true: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      false: "",
    },
  },
  defaultVariants: {
    cols: 1,
    gap: "md",
    responsive: false,
  },
})

export interface GridProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(({ className, cols, gap, responsive, ...props }, ref) => {
  return <div className={cn(gridVariants({ cols, gap, responsive }), className)} ref={ref} {...props} />
})
Grid.displayName = "Grid"

export { Grid, gridVariants }
