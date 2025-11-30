'use client';

import React from 'react';
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from '../../utils';

// Enhanced progress bar with multiple designs and compatibility
interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  design?: 'enhanced' | 'radix'; // Controls which design to use
  className?: string;
}

// Radix-based Progress component (for existing compatibility)
const RadixProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-primary transition-all",
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
RadixProgress.displayName = ProgressPrimitive.Root.displayName

// Enhanced progress bar with labels and variants
export function ProgressBar({
  value,
  label,
  variant = 'default',
  showPercentage = true,
  design = 'enhanced',
  className,
  indicatorClassName,
  ...props
}: ProgressBarProps & React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {

  // If radix design is requested, use the Radix component
  if (design === 'radix') {
    return <RadixProgress value={value} className={className} indicatorClassName={indicatorClassName} {...props} />
  }
  
  // Enhanced design with variants and labels
  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600', 
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };
  
  return (
    <div className="w-full space-y-1">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-gray-600">{label}</span>}
          {showPercentage && <span className="text-gray-500">{value}%</span>}
        </div>
      )}
      
      <div className={cn("w-full bg-gray-200 rounded-full h-2 overflow-hidden", className)}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantClasses[variant],
            indicatorClassName
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// Compatibility alias - Progress component that looks exactly like the old Radix version
export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, _ref) => (
  <ProgressBar
    value={value || 0}
    design="radix"
    showPercentage={false}
    className={className}
    indicatorClassName={indicatorClassName}
    {...props}
  />
))
Progress.displayName = "Progress"