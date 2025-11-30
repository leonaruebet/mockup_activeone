'use client';

/**
 * Data Table Component
 * Purpose: Reusable data table with pagination, filtering, and enhanced cells
 * Location: shared/ui/components/data_table/data_table.tsx
 *
 * Features:
 * - Dynamic columns with hover tooltips
 * - Pagination controls
 * - Search and filtering
 * - Sortable columns
 * - Loading and empty states
 * - Responsive design
 * - Customizable actions
 */

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Database, Layers } from 'lucide-react';
import { Button, Tag } from '@shared/ui';
import { EnhancedTableCell } from '../enhanced_table_cell/enhanced_table_cell';

export interface DataTableColumn {
  key: string;
  label: string;
  type?: string;
  formatter?: (value: any) => string;
  width?: string;
  sortable?: boolean;
  visible?: boolean;
}

export interface DataTableProps<T = any> {
  /** Data array to display */
  data: T[];
  /** Column configuration */
  columns: DataTableColumn[];
  /** Loading state */
  isLoading?: boolean;
  /** Search query state */
  searchQuery?: string;
  /** Search query handler */
  onSearchChange?: (query: string) => void;
  /** Current page */
  page?: number;
  /** Page size */
  pageSize?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Total items count */
  totalItems?: number;
  /** Platform filter state */
  platformFilter?: string;
  /** Platform filter handler */
  onPlatformFilterChange?: (platform: string) => void;
  /** Available platforms for filtering */
  availablePlatforms?: string[];
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Custom empty state content */
  emptyContent?: React.ReactNode;
  /** Additional actions */
  actions?: React.ReactNode;
  /** Platform getter function for data items */
  getPlatform?: (item: T) => string;
  /** Platform variant getter */
  getPlatformVariant?: (platform: string) => any;
  /** Custom cell renderer */
  customCellRenderer?: (item: T, column: DataTableColumn) => React.ReactNode;
  /** Additional className */
  className?: string;
  /** Make actions column sticky on the left */
  stickyActionsColumn?: boolean;
}

/**
 * DataTable Component
 * Purpose: Renders a reusable data table with advanced features
 * Params: data - array of items, columns - column configuration, various options
 * Returns: Complete data table with pagination, filtering, and enhanced cells
 */
export function DataTable<T = any>({
  data,
  columns,
  isLoading = false,
  searchQuery: _searchQuery = '',
  onSearchChange: _onSearchChange,
  page = 0,
  pageSize = 20,
  onPageChange,
  totalItems,
  platformFilter: _platformFilter = 'all',
  onPlatformFilterChange: _onPlatformFilterChange,
  availablePlatforms: _availablePlatforms = [],
  emptyTitle = 'No data found',
  emptyDescription = 'No data available to display',
  emptyContent,
  actions: _actions,
  getPlatform,
  getPlatformVariant,
  customCellRenderer,
  className = '',
  stickyActionsColumn = false
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(page);
  const currentPage = onPageChange ? page : internalPage;

  // Calculate visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter(col => col.visible !== false);
  }, [columns]);

  // Handle page changes
  const handlePrevPage = () => {
    const newPage = Math.max(0, currentPage - 1);
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleNextPage = () => {
    const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : Math.ceil(data.length / pageSize);
    const newPage = Math.min(currentPage + 1, totalPages - 1);
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  // Paginate data
  const paginatedData = useMemo(() => {
    if (totalItems) {
      // If totalItems is provided, assume pagination is handled externally
      return data;
    }
    const startIndex = currentPage * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize, totalItems]);

  /**
   * renderPaginationControls
   * Purpose: Render pagination controls
   */
  const renderPaginationControls = () => {
    const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : Math.ceil(data.length / pageSize);
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalItems || data.length);

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-noble-black-100">
        <div className="text-sm text-noble-black-500">
          Page {currentPage + 1} of {totalPages}
          <span className="ml-2">
            Showing {startItem}-{endItem} of {totalItems || data.length} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-1 text-noble-black-500 hover:text-noble-black-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-1 text-noble-black-500 hover:text-noble-black-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  /**
   * renderEmptyState
   * Purpose: Render empty state when no data is available
   */
  const renderEmptyState = () => {
    if (emptyContent) {
      return emptyContent;
    }

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Layers className="w-12 h-12 text-noble-black-300 mb-4" />
        <div className="text-noble-black-400 mb-2">
          {emptyTitle}
        </div>
        <p className="text-sm text-noble-black-300">
          {emptyDescription}
        </p>
      </div>
    );
  };

  /**
   * renderLoadingState
   * Purpose: Render loading state
   */
  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <Database className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );

  /**
   * renderPlatformColumn
   * Purpose: Render the platform column with tag
   */
  const renderPlatformColumn = (item: T) => {
    if (!getPlatform || !getPlatformVariant) return null;

    const platform = getPlatform(item);
    return (
      <td className="border-b border-noble-black-100 px-4 py-3 text-sm sticky left-0 bg-white z-10 min-w-[140px] w-[140px]" style={{ boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }}>
        <Tag variant={getPlatformVariant(platform || 'unknown')} size="sm">
          {(platform || 'UNKNOWN').toUpperCase()}
        </Tag>
      </td>
    );
  };

  return (
    <div className={`space-y-0 ${className}`} style={{ isolation: 'isolate' }}>
      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          renderLoadingState()
        ) : !data || data.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-0">
            <table className="w-full">
              <thead className="bg-whitesmoke-100">
                <tr>
                  {/* Platform column if platform getter is provided */}
                  {getPlatform && (
                    <th className="border-b border-noble-black-100 px-4 py-3 text-left text-xs font-medium text-noble-black-500 uppercase sticky left-0 bg-whitesmoke-100 z-10 min-w-[140px] w-[140px]" style={{ boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                      Platform
                    </th>
                  )}

                  {/* Dynamic columns */}
                  {visibleColumns.map((column, index) => {
                    const isActionsColumn = column.key === 'actions' && stickyActionsColumn;
                    const stickyLeftPosition = getPlatform ? '140px' : '0';

                    return (
                      <th
                        key={column.key}
                        className={`border-b border-noble-black-100 px-4 py-3 text-left text-xs font-medium text-noble-black-500 uppercase ${
                          isActionsColumn ? 'sticky bg-whitesmoke-100 z-10' : ''
                        }`}
                        style={{
                          width: column.width,
                          ...(isActionsColumn ? {
                            left: stickyLeftPosition,
                            boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)'
                          } : {})
                        }}
                      >
                        {column.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white">
                {paginatedData.map((item, index) => (
                  <tr key={(item as any)._id || index} className="hover:bg-whitesmoke-100 transition-colors">
                    {/* Platform column */}
                    {getPlatform && renderPlatformColumn(item)}

                    {/* Dynamic data columns */}
                    {visibleColumns.map((column) => {
                      if (customCellRenderer) {
                        return customCellRenderer(item, column);
                      }

                      const value = (item as any)[column.key];
                      return (
                        <EnhancedTableCell
                          key={column.key}
                          value={value}
                          column={column}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && data && data.length > 0 && renderPaginationControls()}
    </div>
  );
}