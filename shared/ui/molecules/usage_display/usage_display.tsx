'use client'

import React from 'react'
import { Activity, TrendingUp, AlertCircle } from 'lucide-react'
import { Progress } from '../../atoms/progress_bar'
import { cn } from '../../utils'

/**
 * Usage display interface
 * Purpose: Type definition for usage data to be displayed
 */
export interface UsageDisplayData {
  metric: string
  label: string
  current_usage: number
  limit: number | null
  unit?: string
  icon?: React.ReactNode
  color?: 'orange' | 'blue' | 'green' | 'red' | 'purple'
}

/**
 * UsageDisplay component props
 */
export interface UsageDisplayProps {
  usages: UsageDisplayData[]
  is_collapsed?: boolean
  is_loading?: boolean
  on_upgrade?: () => void
  className?: string
}

/**
 * format_usage_number
 * Purpose: Format usage numbers for display with appropriate units
 * @param value - The numeric value to format
 * @param unit - Optional unit (e.g., 'tokens', 'requests', 'GB')
 * @returns Formatted string
 */
function format_usage_number(value: number, unit?: string): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M ${unit || ''}`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K ${unit || ''}`
  }
  return `${value} ${unit || ''}`
}

/**
 * calculate_percentage
 * Purpose: Calculate usage percentage with safeguards
 * @param current - Current usage
 * @param limit - Usage limit
 * @returns Percentage (0-100)
 */
function calculate_percentage(current: number, limit: number | null): number {
  if (!limit || limit === 0) return 0
  const percentage = (current / limit) * 100
  return Math.min(100, Math.max(0, percentage))
}

/**
 * get_color_classes
 * Purpose: Get color classes based on color variant
 */
function get_color_classes(color: string = 'orange', percentage: number = 0) {
  // Determine status color based on percentage
  if (percentage >= 90) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-600',
      progress: 'bg-red-500',
      icon: 'text-red-500'
    }
  } else if (percentage >= 75) {
    return {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      progress: 'bg-orange-500',
      icon: 'text-orange-500'
    }
  }

  // Default colors based on variant
  const colorMap: Record<string, any> = {
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      progress: 'bg-orange-500',
      icon: 'text-orange-500'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      progress: 'bg-blue-500',
      icon: 'text-blue-500'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      progress: 'bg-green-500',
      icon: 'text-green-500'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      progress: 'bg-red-500',
      icon: 'text-red-500'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      progress: 'bg-purple-500',
      icon: 'text-purple-500'
    },
  }

  return colorMap[color] || colorMap.orange
}

/**
 * UsageDisplay Component
 * Purpose: Display organization usage metrics with progress bars and limits
 * Features:
 * - Multiple metric support
 * - Progress visualization
 * - Limit warnings
 * - Responsive collapsed/expanded states
 * - Loading states
 */
export function UsageDisplay({
  usages,
  is_collapsed = false,
  is_loading = false,
  on_upgrade,
  className
}: UsageDisplayProps) {
  console.log(`[${new Date().toISOString()}] UsageDisplay render`, {
    usages_count: usages.length,
    is_collapsed,
    is_loading,
    usages
  })

  // Loading state
  if (is_loading) {
    return (
      <div className={cn('px-4 py-3', className)}>
        <div className={cn(
          'rounded-lg p-3 space-y-2',
          is_collapsed ? 'bg-gray-50' : 'bg-gray-50'
        )}>
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // No usage data
  if (!usages || usages.length === 0) {
    return null
  }

  // Collapsed state - show icon only or minimal info
  if (is_collapsed) {
    const has_warning = usages.some(u => {
      const percentage = calculate_percentage(u.current_usage, u.limit)
      return percentage >= 75
    })

    return (
      <div className={cn('px-3 py-3', className)}>
        <div className={cn(
          'flex items-center justify-center p-2 rounded-lg',
          has_warning ? 'bg-orange-50' : 'bg-blue-50'
        )}>
          {has_warning ? (
            <AlertCircle className="w-4 h-4 text-orange-500" />
          ) : (
            <Activity className="w-4 h-4 text-blue-500" />
          )}
        </div>
      </div>
    )
  }

  // Expanded state - show full usage details
  return (
    <div className={cn('px-4 py-3', className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-noble-black-300 uppercase tracking-wider">
            Usage
          </h3>
          {on_upgrade && (
            <button
              onClick={on_upgrade}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              Upgrade
            </button>
          )}
        </div>

        {/* Usage Cards */}
        <div className="space-y-2">
          {usages.map((usage, index) => {
            const percentage = calculate_percentage(usage.current_usage, usage.limit)
            const colors = get_color_classes(usage.color, percentage)
            const is_warning = percentage >= 75
            const is_critical = percentage >= 90

            return (
              <div
                key={index}
                className={cn(
                  'rounded-lg p-3 transition-colors',
                  colors.bg
                )}
              >
                {/* Metric Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {usage.icon ? (
                      <div className={cn('w-4 h-4', colors.icon)}>
                        {usage.icon}
                      </div>
                    ) : (
                      <Activity className={cn('w-4 h-4', colors.icon)} />
                    )}
                    <span className="text-xs font-medium text-noble-black-400">
                      {usage.label}
                    </span>
                  </div>
                  {(is_warning || is_critical) && (
                    <AlertCircle className={cn(
                      'w-3 h-3',
                      is_critical ? 'text-red-500' : 'text-orange-500'
                    )} />
                  )}
                </div>

                {/* Usage Numbers */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className={cn('text-sm font-bold', colors.text)}>
                      {format_usage_number(usage.current_usage, usage.unit)}
                    </span>
                    {usage.limit && (
                      <span className="text-xs text-noble-black-300">
                        of {format_usage_number(usage.limit, usage.unit)}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {usage.limit && (
                    <Progress
                      value={percentage}
                      className="h-1.5"
                      indicatorClassName={colors.progress}
                    />
                  )}

                  {/* Percentage */}
                  {usage.limit && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-noble-black-300">
                        {percentage.toFixed(0)}% used
                      </span>
                      {is_warning && on_upgrade && (
                        <button
                          onClick={on_upgrade}
                          className="text-[10px] text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                        >
                          <TrendingUp className="w-3 h-3" />
                          Add more
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default UsageDisplay
