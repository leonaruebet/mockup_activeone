'use client';

/**
 * AdvancedSearchConsole Component
 * Purpose: Provides comprehensive search and filtering interface for dashboard
 * Location: shared/ui/organisms/advanced_search_console/advanced_search_console.tsx
 *
 * Features:
 * - Search input for text-based filtering
 * - Industry/category dropdown filter
 * - Date range selection (start and end dates)
 * - Status filter tabs with counts
 * - Sort dropdown for ordering results
 */

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { SearchInput } from '../../molecules/search_input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../molecules/select';
import { DatePicker } from '../../molecules/date_picker';
import { Tabs, TabsList, TabsTrigger } from '../tabs';
import { createScopedLogger } from '../../utils';
import { cn } from '../../utils';

const logger = createScopedLogger('ui:advanced_search_console');

export type ProjectStatus = 'all' | 'active' | 'draft' | 'inactive';

export interface StatusCount {
  all: number;
  active: number;
  draft: number;
  inactive: number;
}

export interface SearchFilters {
  searchQuery: string;
  industry: string;
  startDate?: Date;
  endDate?: Date;
  status: ProjectStatus;
  sortBy: string;
}

export interface AdvancedSearchDictionary {
  labels: {
    search: string;
    industry: string;
    startDate: string;
    endDate: string;
  };
  placeholders: {
    searchProject: string;
    allIndustries: string;
    selectStartDate: string;
    selectEndDate: string;
  };
  status: {
    all: string;
    active: string;
    draft: string;
    inactive: string;
  };
  industries: {
    all: string;
    tech: string;
    finance: string;
    healthcare: string;
    education: string;
    retail: string;
  };
  sort: {
    updatedDesc: string;
    createdDesc: string;
    nameAsc: string;
    nameDesc: string;
  };
}

export interface AdvancedSearchConsoleProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  statusCounts: StatusCount;
  dict: AdvancedSearchDictionary;
  industries?: Array<{ value: string; label: string }>;
  sortOptions?: Array<{ value: string; label: string }>;
  searchPlaceholder?: string;
}

/**
 * AdvancedSearchConsole renders a comprehensive search interface with multiple filter options
 *
 * @param props - Component props
 * @param props.filters - Current filter state
 * @param props.onFiltersChange - Callback when filters change
 * @param props.statusCounts - Count of projects by status
 * @param props.industries - Available industry options
 * @param props.sortOptions - Available sort options
 * @param props.searchPlaceholder - Placeholder text for search input
 * @returns Search console JSX
 */
export function AdvancedSearchConsole({
  filters,
  onFiltersChange,
  statusCounts,
  dict,
  industries,
  sortOptions,
  searchPlaceholder,
}: AdvancedSearchConsoleProps) {
  // Use dictionary values with fallback to provided props
  const industriesList = industries || [
    { value: 'all', label: dict.industries.all },
    { value: 'tech', label: dict.industries.tech },
    { value: 'finance', label: dict.industries.finance },
    { value: 'healthcare', label: dict.industries.healthcare },
    { value: 'education', label: dict.industries.education },
    { value: 'retail', label: dict.industries.retail },
  ];

  const sortOptionsList = sortOptions || [
    { value: 'updated_desc', label: dict.sort.updatedDesc },
    { value: 'created_desc', label: dict.sort.createdDesc },
    { value: 'name_asc', label: dict.sort.nameAsc },
    { value: 'name_desc', label: dict.sort.nameDesc },
  ];

  const searchPlaceholderText = searchPlaceholder || dict.placeholders.searchProject;

  logger.debug('advanced_search_console_render_enter', {
    current_filters: filters,
    status_counts: statusCounts,
  });

  /**
   * Updates a specific filter field
   *
   * @param key - Filter field to update
   * @param value - New value for the field
   */
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    logger.info('search_filter_updated', { key, value });
    onFiltersChange({ ...filters, [key]: value });
  };

  /**
   * Handles status tab selection
   *
   * @param status - Selected project status
   */
  const handleStatusChange = (status: string) => {
    logger.info('search_status_changed', { status });
    updateFilter('status', status as ProjectStatus);
  };

  logger.debug('advanced_search_console_render_exit');

  return (
    <div className="space-y-4">
      {/* Top Row: Search, Industry, Dates */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Search Input */}
        <div className="md:col-span-1">
          <label className="mb-2 block text-sm font-medium text-dimgray dark:text-whitesmoke-200">
            {dict.labels.search}
          </label>
          <SearchInput
            placeholder={searchPlaceholderText}
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="w-full"
            rounded="lg"
            size="default"
          />
        </div>

        {/* Industry Filter */}
        <div className="md:col-span-1">
          <label className="mb-2 block text-sm font-medium text-dimgray dark:text-whitesmoke-200">
            <span className="hidden lg:inline">{dict.labels.industry}</span>
            <span className="lg:hidden">{dict.labels.industryShort || dict.labels.industry}</span>
          </label>
          <Select
            value={filters.industry}
            onValueChange={(value) => updateFilter('industry', value)}
          >
            <SelectTrigger size="default" className="w-full">
              <SelectValue placeholder={dict.placeholders.allIndustries} />
            </SelectTrigger>
            <SelectContent>
              {industriesList.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div className="md:col-span-1">
          <label className="mb-2 block text-sm font-medium text-dimgray dark:text-whitesmoke-200">
            <span className="hidden lg:inline">{dict.labels.startDate}</span>
            <span className="lg:hidden">{dict.labels.startDateShort || dict.labels.startDate}</span>
          </label>
          <DatePicker
            selectedDate={filters.startDate}
            onDateChange={(date) => updateFilter('startDate', date)}
            placeholder={dict.placeholders.selectStartDate}
            inputSize="default"
            showSetDateButton={false}
          />
        </div>

        {/* End Date */}
        <div className="md:col-span-1">
          <label className="mb-2 block text-sm font-medium text-dimgray dark:text-whitesmoke-200">
            <span className="hidden lg:inline">{dict.labels.endDate}</span>
            <span className="lg:hidden">{dict.labels.endDateShort || dict.labels.endDate}</span>
          </label>
          <DatePicker
            selectedDate={filters.endDate}
            onDateChange={(date) => updateFilter('endDate', date)}
            placeholder={dict.placeholders.selectEndDate}
            inputSize="default"
            showSetDateButton={false}
          />
        </div>
      </div>

      {/* Bottom Row: Status Tabs & Sort */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Status Filter Tabs */}
        <Tabs value={filters.status} onValueChange={handleStatusChange} className="w-full md:w-auto overflow-x-auto">
          <TabsList className="inline-flex h-9 items-center justify-start md:justify-center gap-0 bg-white dark:bg-gray-800 p-1 rounded-lg border border-whitesmoke-300 dark:border-gray-700 min-w-max">
            <TabsTrigger
              value="all"
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-normal transition-all font-kanit shadow-none border-0',
                'data-[state=active]:bg-primary-100 data-[state=active]:text-orange-600 data-[state=active]:shadow-none data-[state=active]:border-0',
                'data-[state=inactive]:bg-transparent data-[state=inactive]:text-dimgray data-[state=inactive]:border-0',
                'dark:data-[state=active]:bg-orange-900 dark:data-[state=active]:text-orange-200',
                'dark:data-[state=inactive]:text-whitesmoke-200'
              )}
            >
              <span className="text-sm leading-5 whitespace-nowrap">{dict.status.all}</span>
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold leading-[18px] min-w-[20px]',
                  filters.status === 'all'
                    ? 'bg-orange-500 text-white dark:bg-orange-600'
                    : 'bg-whitesmoke-300 text-dimgray dark:bg-gray-700 dark:text-gray-300'
                )}
              >
                {statusCounts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-normal transition-all font-kanit shadow-none border-0',
                'data-[state=active]:bg-primary-100 data-[state=active]:text-orange-600 data-[state=active]:shadow-none data-[state=active]:border-0',
                'data-[state=inactive]:bg-transparent data-[state=inactive]:text-dimgray data-[state=inactive]:border-0',
                'dark:data-[state=active]:bg-orange-900 dark:data-[state=active]:text-orange-200',
                'dark:data-[state=inactive]:text-whitesmoke-200'
              )}
            >
              <span className="text-sm leading-5 whitespace-nowrap">{dict.status.active}</span>
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold leading-[18px] min-w-[20px]',
                  filters.status === 'active'
                    ? 'bg-orange-500 text-white dark:bg-orange-600'
                    : 'bg-whitesmoke-300 text-dimgray dark:bg-gray-700 dark:text-gray-300'
                )}
              >
                {statusCounts.active}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-normal transition-all font-kanit shadow-none border-0',
                'data-[state=active]:bg-primary-100 data-[state=active]:text-orange-600 data-[state=active]:shadow-none data-[state=active]:border-0',
                'data-[state=inactive]:bg-transparent data-[state=inactive]:text-dimgray data-[state=inactive]:border-0',
                'dark:data-[state=active]:bg-orange-900 dark:data-[state=active]:text-orange-200',
                'dark:data-[state=inactive]:text-whitesmoke-200'
              )}
            >
              <span className="text-sm leading-5 whitespace-nowrap">{dict.status.draft}</span>
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold leading-[18px] min-w-[20px]',
                  filters.status === 'draft'
                    ? 'bg-orange-500 text-white dark:bg-orange-600'
                    : 'bg-whitesmoke-300 text-dimgray dark:bg-gray-700 dark:text-gray-300'
                )}
              >
                {statusCounts.draft}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-normal transition-all font-kanit shadow-none border-0',
                'data-[state=active]:bg-primary-100 data-[state=active]:text-orange-600 data-[state=active]:shadow-none data-[state=active]:border-0',
                'data-[state=inactive]:bg-transparent data-[state=inactive]:text-dimgray data-[state=inactive]:border-0',
                'dark:data-[state=active]:bg-orange-900 dark:data-[state=active]:text-orange-200',
                'dark:data-[state=inactive]:text-whitesmoke-200'
              )}
            >
              <span className="text-sm leading-5 whitespace-nowrap">{dict.status.inactive}</span>
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold leading-[18px] min-w-[20px]',
                  filters.status === 'inactive'
                    ? 'bg-orange-500 text-white dark:bg-orange-600'
                    : 'bg-whitesmoke-300 text-dimgray dark:bg-gray-700 dark:text-gray-300'
                )}
              >
                {statusCounts.inactive}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Sort Dropdown */}
        <div className="w-full md:w-auto md:min-w-[16rem]">
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger size="default" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptionsList.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
