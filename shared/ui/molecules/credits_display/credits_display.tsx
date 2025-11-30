'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '../../utils'

/**
 * CreditsDisplay component props
 */
export interface CreditsDisplayProps {
  credits: number
  label: string
  on_add_credits?: () => void
  is_loading?: boolean
  className?: string
}

/**
 * format_number
 * Purpose: Format number with commas
 */
function format_number(value: number): string {
  return value.toLocaleString('en-US')
}

/**
 * CreditsDisplay component
 * Purpose: Display remaining credits with skeleton loading and always-visible UI
 * Note: label should be passed from parent with i18n translation
 *
 * Optimizations:
 * - Skeleton loader prevents layout shift
 * - Button always renders (prevents flash)
 * - Smooth transitions between loading and loaded states
 */
export function CreditsDisplay({
  credits,
  label,
  on_add_credits,
  is_loading = false,
  className,
}: CreditsDisplayProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg p-5 mx-4 mb-4 border border-noble-black-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Label and Credits */}
        <div className="flex-1">
          {/* Label - Always visible */}
          <div className="text-xs text-noble-black-400 mb-1 font-medium">
            {label}
          </div>

          {/* Credits Amount */}
          <div className="text-2xl font-semibold transition-opacity duration-200">
            {is_loading ? (
              <span className="text-noble-black-300">---</span>
            ) : (
              <span className="text-noble-black-600">{format_number(credits)}</span>
            )}
          </div>
        </div>

        {/* Right side - Add Button - ALWAYS VISIBLE */}
        {on_add_credits && (
          <button
            onClick={on_add_credits}
            disabled={is_loading}
            className={cn(
              "flex items-center justify-center w-6 h-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200",
              is_loading
                ? "opacity-70 cursor-not-allowed"
                : "hover:scale-105"
            )}
            aria-label="Add credits"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}
