"use client";

/**
 * InfoModal Component
 * Purpose: Specialized modal for displaying detailed information/data with maximum content area
 * Location: shared/ui/molecules/info_modal/info_modal.tsx
 *
 * Features:
 * - Wide layout optimized for displaying data (90% viewport width)
 * - Minimal padding for maximum content display
 * - Clean, focused design without decorative icons
 * - Proper scrolling with constrained height
 * - Simple close action
 *
 * Usage:
 * <InfoModal
 *   isOpen={showModal}
 *   onOpenChange={setShowModal}
 *   title="Details"
 *   description="View complete information"
 * >
 *   <div>Your content here</div>
 * </InfoModal>
 *
 * Logging:
 * - Logs modal open/close events
 * - Logs close button clicks
 */

import * as React from "react"
import { cn } from "../../utils"
import { Button } from "../../atoms/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../organisms/dialog"

// Local logger fallback
const uiLogger = {
  info: (message: string, context?: unknown) => console.log('[' + new Date().toISOString() + '] UI ' + message, context || ''),
  error: (message: string, context?: unknown) => console.error('[' + new Date().toISOString() + '] UI ERROR ' + message, context || ''),
  warn: (message: string, context?: unknown) => console.warn('[' + new Date().toISOString() + '] UI WARN ' + message, context || ''),
  debug: (message: string, context?: unknown) => console.debug('[' + new Date().toISOString() + '] UI DEBUG ' + message, context || '')
}

export interface InfoModalProps {
  /** Controls modal open/close state */
  isOpen: boolean
  /** Callback when modal state changes */
  onOpenChange: (isOpen: boolean) => void
  /** Modal title */
  title?: string
  /** Modal description/subtitle */
  description?: string | React.ReactNode
  /** Close button label */
  closeLabel?: string
  /** Hide the close button in header */
  hideCloseButton?: boolean
  /** Custom className for modal content */
  className?: string
  /** Modal content */
  children?: React.ReactNode
  /** Content alignment: left or center (default: left for info display) */
  contentAlign?: "left" | "center"
  /** Maximum height for scrollable content (default: 60vh) */
  maxHeight?: string
  /** Maximum width as percentage of viewport (default: 90, range: 50-95) */
  maxWidthPercent?: number
}

/**
 * InfoModal
 * Purpose: Display detailed information with maximum screen usage
 * @param props - InfoModalProps
 * @returns InfoModal component
 */
const InfoModal = ({
  isOpen,
  onOpenChange,
  title,
  description,
  closeLabel = "Close",
  hideCloseButton = false,
  className,
  children,
  contentAlign = "left",
  maxHeight = "60vh",
  maxWidthPercent = 90,
}: InfoModalProps) => {
  const [modalWidth, setModalWidth] = React.useState<string>('90vw')
  const [horizontalMargin, setHorizontalMargin] = React.useState<string>('1rem')

  /**
   * calculate_responsive_dimensions
   * Purpose: Calculate modal width and margins dynamically based on viewport width
   */
  const calculate_responsive_dimensions = React.useCallback(() => {
    const viewport_width = window.innerWidth

    // Clamp maxWidthPercent between 50 and 95
    const clamped_percent = Math.max(50, Math.min(95, maxWidthPercent))

    // Use simpler approach: percentage with safe max
    let calculated_width = ''
    let margin_rem = '1rem'

    if (viewport_width < 640) {
      // Mobile: use 92% to leave room for close button
      calculated_width = '92vw'
      margin_rem = '0.75rem'
    } else if (viewport_width < 768) {
      // Tablet: use 88% with safe margins
      calculated_width = '88vw'
      margin_rem = '1rem'
    } else if (viewport_width < 1024) {
      // Small desktop: use 85%
      calculated_width = '85vw'
      margin_rem = '1.5rem'
    } else {
      // Large desktop: use configured % but cap at 85%
      const safe_percent = Math.min(clamped_percent, 85)
      calculated_width = `${safe_percent}vw`
      margin_rem = '2rem'
    }

    setModalWidth(calculated_width)
    setHorizontalMargin(margin_rem)

    uiLogger.debug('InfoModal dimensions calculated', {
      viewport_width,
      modal_width: calculated_width,
      horizontal_margin: margin_rem,
      timestamp: new Date().toISOString()
    })
  }, [maxWidthPercent])

  // Calculate dynamic width and margins based on screen size
  React.useEffect(() => {
    // Calculate on mount and when modal opens
    if (isOpen) {
      calculate_responsive_dimensions()

      // Recalculate on window resize
      window.addEventListener('resize', calculate_responsive_dimensions)

      return () => {
        window.removeEventListener('resize', calculate_responsive_dimensions)
      }
    }
  }, [isOpen, calculate_responsive_dimensions])

  // Log modal state changes
  React.useEffect(() => {
    if (isOpen) {
      uiLogger.info('InfoModal opened', {
        title,
        modal_width: modalWidth,
        horizontal_margin: horizontalMargin,
        timestamp: new Date().toISOString()
      })
    } else {
      uiLogger.info('InfoModal closed', {
        title,
        timestamp: new Date().toISOString()
      })
    }
  }, [isOpen, title, modalWidth, horizontalMargin])

  /**
   * handle_close
   * Purpose: Handle close button click
   */
  const handle_close = () => {
    uiLogger.info('InfoModal close button clicked', { title })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!p-0 gap-0 shadow-[0px_24px_64px_-16px_rgba(0,0,0,0.24)] w-full !mx-0",
          className
        )}
        style={{
          maxWidth: modalWidth,
          marginLeft: 0,
          marginRight: 0,
        }}
        onPointerDownOutside={(event) => event.preventDefault()}
        hideCloseButton={hideCloseButton}
      >
        <div
          className={cn(
            "flex flex-col space-y-4 py-6 overflow-hidden",
            contentAlign === "center" ? "items-center justify-center text-center" : "items-start text-left"
          )}
          style={{
            paddingLeft: horizontalMargin,
            paddingRight: horizontalMargin,
          }}
        >
          {/* Header */}
          <DialogHeader className="w-full overflow-hidden">
            {title && (
              <DialogTitle className={cn(
                "text-2xl font-semibold text-noble-black-800",
                contentAlign === "center" ? "text-center" : "text-left"
              )}>
                {title}
              </DialogTitle>
            )}

            {description && (
              <DialogDescription className={cn(
                "text-sm text-noble-black-400 leading-5 mt-2",
                contentAlign === "center" ? "text-center" : "text-left"
              )}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Content - scrollable area */}
          {children && (
            <div
              className="w-full overflow-y-auto overflow-x-hidden break-words"
              style={{
                maxHeight,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}
            >
              {children}
            </div>
          )}

          {/* Footer with Close button - only show if not hidden */}
          {!hideCloseButton && (
            <DialogFooter className="w-full flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={handle_close}
                className="min-w-[100px]"
              >
                {closeLabel}
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

InfoModal.displayName = "InfoModal"

export { InfoModal }
