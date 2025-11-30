"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Building2 } from "lucide-react"
import { cn } from "../../utils"
import { Typography } from '../../atoms/display'
import { Button } from '../../atoms/buttons'
import { useLiquidGlass } from "../../utils/use-liquid-glass"

/**
 * Organization Display Component
 * Clean card design with company avatar and switch functionality
 */

const organizationDisplayVariants = cva(
  "w-full mx-2 my-2 rounded-lg flex items-center hover:bg-accent/50 transition-colors cursor-pointer",
  {
    variants: {
      size: {
        default: "gap-2 p-2.5",
        compact: "gap-1.5 p-2",
        expanded: "gap-3 p-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

// Company Avatar Component
const CompanyAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    organizationName: string
  }
>(({ className, organizationName, ...props }, ref) => {
  // Get first letter of organization name for avatar
  const avatarLetter = organizationName.charAt(0).toUpperCase()
  
  return (
    <div
      ref={ref}
      className={cn(
        "w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0",
        className
      )}
      {...props}
    >
      <span className="text-white font-bold text-xs">{avatarLetter}</span>
    </div>
  )
})
CompanyAvatar.displayName = "CompanyAvatar"

export interface OrganizationDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof organizationDisplayVariants> {
  organizationName: string
  tier: 'free' | 'pro' | 'plus' | 'enterprise'
  onSwitchOrganization?: () => void
  onManageOrganization?: () => void
  showDropdown?: boolean
  isLoading?: boolean
  sidebarWidth?: number // Optional sidebar width for dynamic sizing
}

const OrganizationDisplay = React.forwardRef<HTMLDivElement, OrganizationDisplayProps>(
  ({ 
    className, 
    size, 
    organizationName, 
    tier, 
    onSwitchOrganization, 
    onManageOrganization,
    showDropdown = true,
    isLoading = false,
    sidebarWidth = 280,
    ...props 
  }, ref) => {
    // Debug log to see actual sidebar width
    console.log('🔍 OrganizationDisplay sidebarWidth:', sidebarWidth)
    
    // The issue: component needs to fit INSIDE the sidebar completely
    // Calculate maximum component width that fits within sidebar
    const maxComponentWidth = sidebarWidth - 16 // Leave 8px margin on each side
    
    // Dynamic sizing based on available space
    const isCompact = sidebarWidth < 250
    const isVeryCompact = sidebarWidth < 220
    const isUltraCompact = sidebarWidth < 200
    
    // Responsive margins and padding that scale down
    const horizontalMargin = isUltraCompact ? 4 : isVeryCompact ? 6 : 8 // px value for mx-1, mx-1.5, mx-2
    const cardPadding = isUltraCompact ? "px-2 py-1.5" : isVeryCompact ? "px-2.5 py-2" : "px-3 py-2"
    const cardGap = isUltraCompact ? "gap-1" : isVeryCompact ? "gap-1.5" : "gap-2"
    
    // Component sizing
    const avatarSize = isUltraCompact ? "w-4 h-4" : isVeryCompact ? "w-5 h-5" : isCompact ? "w-6 h-6" : "w-7 h-7"
    const textSize = isUltraCompact ? "text-xs" : "text-xs"
    const showIcon = sidebarWidth > 200
    const showLabel = sidebarWidth > 220
    
    // Generate liquid glass styles for the organization card
    const liquidGlassStyles = useLiquidGlass({
      blur: 6,
      brightness: 1.02,
      borderRadius: '8px',
      withNobleGradient: false,
      withSpecularHighlights: false,
      enableHoverGlow: false,
      glassOpacity: 0.6,
      useWhiteBackground: true
    });
    
    return (
      <div 
        ref={ref} 
        className={cn(
          "rounded-lg flex items-center hover:bg-accent/50 transition-colors cursor-pointer",
          cardPadding,
          cardGap,
          className
        )}
        style={{
          width: `${maxComponentWidth}px`,
          maxWidth: `${maxComponentWidth}px`,
          marginLeft: `${horizontalMargin}px`,
          marginRight: `${horizontalMargin}px`,
          marginTop: '4px',
          marginBottom: '4px',
          ...liquidGlassStyles
        }} 
        onClick={onSwitchOrganization}
        {...props}
      >
        {/* Company Avatar */}
        <div className={cn("rounded-full bg-primary flex items-center justify-center flex-shrink-0", avatarSize)}>
          <span className={cn("text-white font-bold", textSize)}>
            {organizationName.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Company Info */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {isLoading ? (
            <div className="space-y-0.5">
              <div className="h-2 bg-muted rounded animate-pulse w-8" />
              <div className="h-2.5 bg-muted rounded animate-pulse w-12" />
            </div>
          ) : (
            <div className="space-y-0">
              {showLabel && (
                <div className={cn("text-muted-foreground leading-none", textSize)}>
                  Your company
                </div>
              )}
              <div 
                className={cn("font-semibold text-foreground truncate leading-none", textSize)} 
                title={organizationName}
              >
                {organizationName}
              </div>
            </div>
          )}
        </div>

        {/* Switch Icon - Only show if there's space */}
        {!isLoading && onSwitchOrganization && showIcon && (
          <div className="flex-shrink-0">
            <Building2 className="w-3 h-3 text-muted-foreground" />
          </div>
        )}
      </div>
    )
  }
)
OrganizationDisplay.displayName = "OrganizationDisplay"

export { OrganizationDisplay, CompanyAvatar }