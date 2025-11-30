import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../utils"
import { Typography } from "../../atoms/typography"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-none",
  {
    variants: {
      variant: {
        default: "border-border",
        outlined: "border-2 border-border",
        elevated: "border-border shadow-md",
        flat: "border-border shadow-none",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }: CardProps, ref) => (
    <div 
      ref={ref} 
      className={cn(cardVariants({ variant, padding }), className)} 
      {...props} 
    />
  )
)
Card.displayName = "Card"

type DivProps = React.HTMLAttributes<HTMLDivElement>
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>

const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }: DivProps, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>, ref) => (
    <Typography
      as="h3"
      variant="heading-m"
      weight="semibold"
      ref={ref as any}
      className={cn("leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </Typography>
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, children, ...props }: ParagraphProps, ref) => (
    <Typography
      as="p"
      variant="body-s"
      ref={ref as any}
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Typography>
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }: DivProps, ref) => (
    <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
  ),
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }: DivProps, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
