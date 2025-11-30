/**
 * Data Table Organism - Atomic Design
 * Comprehensive data table with sorting, filtering, pagination, and selection
 */
'use client'

import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Filter } from 'lucide-react'
import { cn } from '../../utils'
import { Button } from '../../atoms/button'
import { Input } from '../../atoms/input'
import { Checkbox } from '../../atoms/checkbox'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../table'

export interface DataTableColumn {
  key: string
  title: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps {
  data: any[]
  columns: DataTableColumn[]
  loading?: boolean
  selectable?: boolean
  selectedRows?: any[]
  onSelectionChange?: (selectedRows: any[]) => void
  pagination?: {
    currentPage: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  className?: string
  emptyStateMessage?: string
  onRowClick?: (row: any) => void
}

export function DataTable({
  data,
  columns,
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  pagination,
  className,
  emptyStateMessage = "No data available",
  onRowClick
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterText, setFilterText] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!filterText) return data

    return data.filter(row => {
      return columns.some(column => {
        const value = row[column.key]
        if (value == null) return false
        return String(value).toLowerCase().includes(filterText.toLowerCase())
      })
    })
  }, [data, filterText, columns])

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sortDirection === 'desc' ? -result : result
    })
  }, [filteredData, sortColumn, sortDirection])

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column?.sortable) return

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    onSelectionChange(checked ? sortedData : [])
  }

  const handleSelectRow = (row: any, checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      onSelectionChange([...selectedRows, row])
    } else {
      onSelectionChange(selectedRows.filter(r => r !== row))
    }
  }

  const isRowSelected = (row: any) => selectedRows.includes(row)
  const isAllSelected = selectedRows.length === sortedData.length && sortedData.length > 0
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < sortedData.length

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return <ChevronsUpDown className="h-4 w-4" />
    return sortDirection === 'asc'
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  const renderCell = (column: DataTableColumn, row: any) => {
    const value = row[column.key]
    if (column.render) return column.render(value, row)
    return value?.toString() || ''
  }

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div className="h-9 w-64 bg-muted animate-pulse rounded" />
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
        </div>
        <div className="border rounded-lg">
          <div className="h-12 border-b bg-muted/50" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          {selectable && selectedRows.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedRows.length} selected
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(ref) => {
                      if (ref) (ref as any).indeterminate = isIndeterminate
                    }}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    column.sortable && "cursor-pointer hover:bg-muted/50",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    isRowSelected(row) && "bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={isRowSelected(row)}
                        onCheckedChange={(checked) => handleSelectRow(row, !!checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right"
                      )}
                    >
                      {renderCell(column, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > pagination.pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage * pagination.pageSize >= pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Legacy export for backward compatibility
export function DataTableView(props: DataTableProps) {
  return <DataTable {...props} />
}

export { DataTable as default }
