/**
 * Scraping Logs Organism - Atomic Design
 * Self-contained scraping logs display with filtering and data management
 */
'use client'

import React, { useState } from 'react'
import { Search, Filter, Download, RefreshCw } from 'lucide-react'
import { cn } from '../../utils'
import { Button } from '../../atoms/button'
import { Input } from '../../atoms/input'
import { LoadingIndicator } from '../../atoms/loading-indicator'
import { LogCard } from '../../molecules/log-card'

export interface ScrapingLogEntry {
  id: string
  timestamp: string
  message: string
  status: 'success' | 'error' | 'warning' | 'info'
  details?: string
  projectId?: string
  jobId?: string
}

export interface ScrapingLogsProps {
  logs: ScrapingLogEntry[]
  loading?: boolean
  onRefresh?: () => void
  onExport?: () => void
  className?: string
  emptyStateMessage?: string
  showFilters?: boolean
  showExport?: boolean
  maxHeight?: string
}

export function ScrapingLogs({
  logs,
  loading = false,
  onRefresh,
  onExport,
  className,
  emptyStateMessage = "No scraping logs available",
  showFilters = true,
  showExport = true,
  maxHeight = "600px"
}: ScrapingLogsProps) {
  const [filterText, setFilterText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter logs based on search text and status
  const filteredLogs = logs.filter(log => {
    const matchesText = !filterText ||
      log.message.toLowerCase().includes(filterText.toLowerCase()) ||
      log.details?.toLowerCase().includes(filterText.toLowerCase())

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter

    return matchesText && matchesStatus
  })

  const statusCounts = {
    all: logs.length,
    success: logs.filter(log => log.status === 'success').length,
    error: logs.filter(log => log.status === 'error').length,
    warning: logs.filter(log => log.status === 'warning').length,
    info: logs.filter(log => log.status === 'info').length
  }

  const statusOptions = [
    { value: 'all', label: `All (${statusCounts.all})` },
    { value: 'success', label: `Success (${statusCounts.success})` },
    { value: 'error', label: `Error (${statusCounts.error})` },
    { value: 'warning', label: `Warning (${statusCounts.warning})` },
    { value: 'info', label: `Info (${statusCounts.info})` }
  ]

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <LoadingIndicator text="Loading scraping logs..." />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="text-lg font-semibold">Scraping Logs</h3>
          <span className="text-sm text-muted-foreground">
            ({filteredLogs.length} of {logs.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}

          {showExport && onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Logs Display */}
      <div
        className="space-y-3 overflow-y-auto pr-2"
        style={{ maxHeight }}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filterText || statusFilter !== 'all'
              ? "No logs match your current filters"
              : emptyStateMessage
            }
          </div>
        ) : (
          filteredLogs.map((log) => (
            <LogCard
              key={log.id}
              title={`Log Entry ${log.id}`}
              status={log.status}
              timestamp={log.timestamp}
              message={log.message}
              details={log.details}
            />
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
        <div>
          Total: {logs.length} logs
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            {statusCounts.success} Success
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            {statusCounts.error} Error
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            {statusCounts.warning} Warning
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            {statusCounts.info} Info
          </span>
        </div>
      </div>
    </div>
  )
}

// Legacy exports for backward compatibility
export function ScrapingLogsContainer(props: ScrapingLogsProps) {
  return <ScrapingLogs {...props} />
}

export function ScrapingLogsList(props: ScrapingLogsProps) {
  return <ScrapingLogs {...props} />
}

export { ScrapingLogs as default }
