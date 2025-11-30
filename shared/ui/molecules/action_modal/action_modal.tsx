"use client";

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

export interface ActionItem {
  id: string
  label: string
  onClick?: () => void
  variant?: "default" | "primary" | "destructive" | "outline"
  disabled?: boolean
  closesModal?: boolean
}

export interface ActionModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  icon?: React.ReactNode
  iconBgColor?: string // Custom background color for icon circle (e.g., "bg-happy-orange-500")
  iconTextColor?: string // Custom text color for icon (e.g., "text-white")
  title?: string
  description?: string | React.ReactNode // Support both string and complex JSX
  actions: ActionItem[]
  cancelLabel?: string
  hideCloseButton?: boolean
  hideCancelButton?: boolean // Hide the cancel button in inline actions mode
  inlineActions?: boolean // New prop to show actions and cancel inline
  size?: "sm" | "default" | "lg" | "xl"
  className?: string
  children?: React.ReactNode // Alternative to description for complex content
  contentAlign?: "left" | "center" // Content alignment: left or center (default: center)
}

const ActionModal = ({
  isOpen,
  onOpenChange,
  icon,
  iconBgColor = "bg-primary-100",
  iconTextColor = "text-primary-600",
  title,
  description,
  actions,
  cancelLabel = "Cancel",
  hideCloseButton = false,
  hideCancelButton = false,
  inlineActions = false,
  size = "default",
  className,
  children,
  contentAlign = "center",
}: ActionModalProps) => {
  // Debug logging for icon props
  React.useEffect(() => {
    if (isOpen) {
      uiLogger.info('ActionModal opened', {
        hasIcon: !!icon,
        iconBgColor,
        iconTextColor,
        title
      })
    }
  }, [isOpen, icon, iconBgColor, iconTextColor, title])

  const handleActionClick = (action: ActionItem) => {
    uiLogger.info('Action clicked', { actionId: action.id, label: action.label })

    if (action.onClick) {
      action.onClick()
    }

    if (action.closesModal !== false) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "px-8 py-8 gap-8 shadow-[0px_24px_64px_-16px_rgba(0,0,0,0.24)] grid place-items-center",
          size === "sm" && "max-w-md w-full",
          size === "default" && "max-w-lg w-full",
          size === "lg" && "max-w-2xl w-full",
          size === "xl" && "max-w-4xl w-full",
          className
        )}
        onPointerDownOutside={(event) => event.preventDefault()}
        hideCloseButton={hideCloseButton}
      >

      <div className={cn(
        "flex flex-col space-y-6",
        contentAlign === "center" ? "items-center justify-center text-center" : "items-start text-left"
      )}>
        {/* Centered Icon with Circular Background */}
        {icon && (
          <div
            className={cn("w-20 h-20 rounded-full flex items-center justify-center", iconBgColor, iconTextColor)}
            style={{ flexShrink: 0 }}
          >
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, {
              className: cn((icon as any).props?.className, iconTextColor),
              style: { ...(icon as any).props?.style }
            }) : icon}
          </div>
        )}

        {title && (
          <DialogTitle className={cn(
            "text-2xl font-semibold text-noble-black-800",
            contentAlign === "center" ? "text-center" : "text-left"
          )}>
            {title}
          </DialogTitle>
        )}

        {/* Render children if provided (for complex content), otherwise render description */}
        {children ? (
          <div className={cn(
            "text-sm text-noble-black-300 leading-5 w-full",
            contentAlign === "center" ? "text-center max-w-sm px-4" : "text-left"
          )}>
            {children}
          </div>
        ) : description && (
          <p className={cn(
            "text-sm text-noble-black-300 leading-5",
            contentAlign === "center" ? "text-center max-w-sm px-4" : "text-left w-full"
          )}>
            {description}
          </p>
        )}

        {/* Action Buttons */}
        {inlineActions ? (
          // Inline layout: actions and cancel button side by side
          <div className={cn(
            "flex gap-3 flex-col sm:flex-row mt-8",
            contentAlign === "center" ? "justify-center" : "justify-start"
          )}>
            {actions.map((action) => {
              const buttonVariant = action.variant === "primary" ? "default" :
                                  action.variant === "destructive" ? "destructive" :
                                  action.variant === "outline" ? "outline" : "secondary"

              // Add text-white for primary variant to ensure white text
              const buttonClassName = cn(
                "flex-1 h-12 min-w-[120px]",
                action.variant === "primary" && "text-white"
              )

              return action.closesModal !== false ? (
                <DialogClose key={action.id} asChild>
                  <Button
                    variant={buttonVariant}
                    className={buttonClassName}
                    onClick={() => !action.disabled && handleActionClick(action)}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                </DialogClose>
              ) : (
                <Button
                  key={action.id}
                  variant={buttonVariant}
                  className={buttonClassName}
                  onClick={() => !action.disabled && handleActionClick(action)}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              )
            })}
            {!hideCancelButton && (
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="flex-1 h-12 min-w-[120px]"
                >
                  {cancelLabel}
                </Button>
              </DialogClose>
            )}
          </div>
        ) : (
          // Stacked layout: actions stacked, cancel in footer
          <>
            <div className="space-y-3">
              {actions.map((action) => {
                const buttonVariant = action.variant === "primary" ? "default" :
                                    action.variant === "destructive" ? "destructive" :
                                    action.variant === "outline" ? "outline" : "secondary"

                return action.closesModal !== false ? (
                  <DialogClose key={action.id} asChild>
                    <Button
                      variant={buttonVariant}
                      className="w-full h-12"
                      onClick={() => !action.disabled && handleActionClick(action)}
                      disabled={action.disabled}
                    >
                      {action.label}
                    </Button>
                  </DialogClose>
                ) : (
                  <Button
                    key={action.id}
                    variant={buttonVariant}
                    className="w-full h-12"
                    onClick={() => !action.disabled && handleActionClick(action)}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                )
              })}
            </div>

            {/* Cancel Button */}
            <DialogFooter className="gap-3 flex-col-reverse sm:flex-row sm:justify-center">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {cancelLabel}
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </div>
      </DialogContent>
    </Dialog>
  )
}

export { ActionModal }
