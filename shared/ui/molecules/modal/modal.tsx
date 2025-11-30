"use client";

import * as React from "react"
// Local logger fallback
const uiLogger = {
  info: (message: string, context?: any) => console.log('[' + new Date().toISOString() + '] UI ' + message, context || ''),
  error: (message: string, context?: any) => console.error('[' + new Date().toISOString() + '] UI ERROR ' + message, context || ''),
  warn: (message: string, context?: any) => console.warn('[' + new Date().toISOString() + '] UI WARN ' + message, context || ''),
  debug: (message: string, context?: any) => console.debug('[' + new Date().toISOString() + '] UI DEBUG ' + message, context || '')
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../organisms/dialog'
import { Button, buttonVariants, type ButtonProps } from "../../atoms/button"
import { cn } from "../../utils"

export interface ModalAction extends ButtonProps {
  label: string
  onClick?: () => void
  closesModal?: boolean
}

export interface ModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  title?: string
  description?: string | React.ReactNode
  children?: React.ReactNode
  icon?: React.ReactNode
  actions?: ModalAction[]
  primaryAction?: ModalAction
  secondaryAction?: ModalAction
  hideCloseButton?: boolean
  size?: "sm" | "default" | "lg" | "xl"
  titleAlignment?: "left" | "center"
}

const modalSizeVariants = {
  sm: "max-w-md w-full",
  default: "max-w-lg w-full",
  lg: "max-w-2xl w-full",
  xl: "max-w-4xl w-full",
}

const Modal = ({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  icon,
  actions,
  primaryAction,
  secondaryAction,
  hideCloseButton = false,
  size = "default",
  titleAlignment = "left",
}: ModalProps) => {
  const effectiveActions = React.useMemo(() => {
    const builtInActions: ModalAction[] = []
    if (secondaryAction) {
      builtInActions.push({ closesModal: true, variant: "outline", ...secondaryAction })
    }
    if (primaryAction) {
      builtInActions.push({ closesModal: false, variant: "default", ...primaryAction })
    }
    return actions || builtInActions
  }, [actions, primaryAction, secondaryAction])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "px-8 py-6 sm:px-10 sm:py-8 gap-6 sm:gap-8 shadow-[0px_24px_64px_-16px_rgba(0,0,0,0.24)]",
          modalSizeVariants[size],
        )}
        onPointerDownOutside={(e) => e.preventDefault()} // Prevents closing on outside click if not desired via explicit action
        hideCloseButton={hideCloseButton}
      >
        {/* Enhanced modal gutters with constrained width and proper horizontal padding for better layout on large screens */}
        {null}
        
        <DialogHeader className={cn("space-y-2", titleAlignment === "center" && "text-center")}>
          {title && (
            <DialogTitle
              className={cn(
                "text-2xl font-semibold text-noble-black-800 flex items-center gap-3",
                titleAlignment === "center" && "justify-center",
              )}
            >
              {icon && <span className="text-primary-600">{icon}</span>}
              {title}
            </DialogTitle>
          )}
          {description && (
            <DialogDescription
              className={cn(
                "text-base text-noble-black-500 tracking-[0.15px] leading-6",
                titleAlignment === "center" ? "px-0" : "pl-0", // Adjusted based on title icon presence
                icon && titleAlignment === "left" && "pl-0 sm:pl-[calc(1.25rem+0.75rem)]", // approx icon width + gap
              )}
            >
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && <div className="text-noble-black-600">{children}</div>}

        {effectiveActions.length > 0 && (
          <DialogFooter
            className={cn(
              "gap-4 sm:gap-6 flex-col-reverse sm:flex-row",
              effectiveActions.length === 1 && titleAlignment === "center" ? "sm:justify-center" : "sm:justify-end",
            )}
          >
            {effectiveActions.map(({ label, closesModal, ...buttonProps }, index) =>
              closesModal ? (
                <DialogClose key={index} asChild>
                  <Button {...buttonProps}>{label}</Button>
                </DialogClose>
              ) : (
                <Button key={index} {...buttonProps}>
                  {label}
                </Button>
              ),
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { Modal }
