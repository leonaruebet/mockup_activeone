'use client';

/**
 * Column Selector Component
 * Purpose: Interactive dropdown for selecting which columns to display in dynamic tables
 * Location: shared/ui/components/column_selector/column_selector.tsx
 *
 * Features:
 * - Individual column visibility toggles
 * - Platform preset selection
 * - Search functionality for columns
 * - Column grouping by type
 * - Clear all/Select all functionality
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Settings } from 'lucide-react';
import { Button } from '../../atoms/button/button';
import { Modal } from '../../molecules/modal/modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../molecules/select/select';
import { DynamicColumn, ColumnPreset, DataFieldTag } from '../../hooks/use_dynamic_data_columns';

interface ColumnSelectorProps {
  columns: DynamicColumn[];
  availablePresets: ColumnPreset[];
  activePreset: string;
  onPresetChange: (presetId: string) => void;
  onColumnToggle: (columnKey: string) => void;
  availablePlatforms: string[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  dataFieldTags: DataFieldTag[];
}

/**
 * Column Selector Component
 * Purpose: Provides UI for managing column visibility and presets
 */
export function ColumnSelector({
  columns,
  availablePresets,
  activePreset,
  onPresetChange,
  onColumnToggle,
  availablePlatforms: _availablePlatforms,
  isOpen,
  onOpenChange,
  dataFieldTags
}: ColumnSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expectedVisibleCount, setExpectedVisibleCount] = useState<number | null>(null);

  // Filter columns based on search query
  // TODO: Use filteredColumns in the UI for search functionality
  const _filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) return columns;

    const query = searchQuery.toLowerCase();
    return columns.filter(col =>
      col.label.toLowerCase().includes(query) ||
      col.key.toLowerCase().includes(query) ||
      col.type.toLowerCase().includes(query)
    );
  }, [columns, searchQuery]);

  
  /**
   * handleTagToggle
   * Purpose: Toggle visibility for a single data.* field
   */
  const handleTagToggle = useCallback((tag: DataFieldTag) => {
    console.log('[ColumnSelector] Toggling data field tag', tag.columnKey, { visible: tag.visible });
    onColumnToggle(tag.columnKey);
  }, [onColumnToggle]);

  const toggleAllColumns = (visible: boolean) => {
    console.log('[ColumnSelector] Toggle All Columns clicked, target visible:', visible);
    const columnsToToggle = columns.filter(col => col.visible !== visible);
    console.log('[ColumnSelector] Columns to toggle:', columnsToToggle.map(c => c.key));

    // Set expected count immediately for instant UI update
    const newVisibleCount = visible ? totalCount : 0;
    setExpectedVisibleCount(newVisibleCount);

    // Use setTimeout to ensure state updates are processed correctly
    const maxDelay = columnsToToggle.length * 10;
    columnsToToggle.forEach((col, index) => {
      setTimeout(() => {
        onColumnToggle(col.key);
      }, index * 10); // Small delay between toggles
    });

    // Reset expected count after operations complete
    setTimeout(() => {
      setExpectedVisibleCount(null);
    }, maxDelay + 100);
  };

  // TODO: Wire this up to a button in the UI
  const _showAllDatasetColumns = () => {
    console.log('[ColumnSelector] Show All Dataset Columns clicked');
    const generalColumns = ['platform', 'created_at', 'data'];
    const columnsToToggle = columns.filter(col =>
      !generalColumns.includes(col.key) && !col.visible
    );
    console.log('[ColumnSelector] Columns to show:', columnsToToggle.map(c => c.key));

    // Set expected count immediately for instant UI update
    const generalColumnCount = columns.filter(col => generalColumns.includes(col.key)).length;
    const newVisibleCount = generalColumnCount + columnsToToggle.length;
    setExpectedVisibleCount(newVisibleCount);

    // Use setTimeout to ensure state updates are processed correctly
    const maxDelay = columnsToToggle.length * 10;
    columnsToToggle.forEach((col, index) => {
      setTimeout(() => {
        onColumnToggle(col.key);
      }, index * 10); // Small delay between toggles
    });

    // Reset expected count after operations complete
    setTimeout(() => {
      setExpectedVisibleCount(null);
    }, maxDelay + 100);
  };

  const hideAdditionalColumns = () => {
    console.log('[ColumnSelector] Hide Additional Columns clicked');
    const generalColumns = ['platform', 'created_at', 'data'];
    const columnsToToggle = columns.filter(col =>
      !generalColumns.includes(col.key) && col.visible
    );
    console.log('[ColumnSelector] Columns to hide:', columnsToToggle.map(c => c.key));

    // Set expected count immediately for instant UI update
    const generalColumnCount = columns.filter(col =>
      generalColumns.includes(col.key) && col.visible
    ).length;
    setExpectedVisibleCount(generalColumnCount);

    // Use setTimeout to ensure state updates are processed correctly
    const maxDelay = columnsToToggle.length * 10;
    columnsToToggle.forEach((col, index) => {
      setTimeout(() => {
        onColumnToggle(col.key);
      }, index * 10); // Small delay between toggles
    });

    // Reset expected count after operations complete
    setTimeout(() => {
      setExpectedVisibleCount(null);
    }, maxDelay + 100);
  };

  const currentPreset = availablePresets.find(p => p.id === activePreset);

  const generalColumns = ['platform', 'created_at', 'data'];

  // Memoized counts that update when columns change
  const visibleCount = useMemo(() => {
    if (expectedVisibleCount !== null) {
      return expectedVisibleCount;
    }
    return columns.filter(c => c.visible).length;
  }, [columns, expectedVisibleCount]);
  const totalCount = useMemo(() => columns.length, [columns]);
  // TODO: Use generalCount in UI to show count of general columns
  const _generalCount = useMemo(() => columns.filter(c => generalColumns.includes(c.key) && c.visible).length, [columns, generalColumns]);
  const additionalCount = useMemo(() => columns.filter(c => !generalColumns.includes(c.key) && c.visible).length, [columns, generalColumns]);

  // Determine current state for button highlighting
  const currentVisibleState = useMemo(() => {
    if (expectedVisibleCount !== null) {
      if (expectedVisibleCount === totalCount) return 'all';
      if (expectedVisibleCount === generalColumns.length) return 'general-only';
      if (expectedVisibleCount === 0) return 'none';
      return 'partial';
    }

    const visibleColumns = columns.filter(c => c.visible);
    const visibleGeneralColumns = visibleColumns.filter(c => generalColumns.includes(c.key));
    const visibleAdditionalColumns = visibleColumns.filter(c => !generalColumns.includes(c.key));

    if (visibleColumns.length === totalCount) return 'all';
    if (visibleColumns.length === 0) return 'none';
    if (visibleAdditionalColumns.length === 0 && visibleGeneralColumns.length === generalColumns.length) return 'general-only';
    return 'partial';
  }, [columns, expectedVisibleCount, totalCount, generalColumns.length]);

  // Button to open modal
  const triggerButton = (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-noble-black-600 border-noble-black-200 hover:bg-noble-black-50"
      onClick={() => onOpenChange(true)}
    >
      <Eye className="w-4 h-4" />
      <span>Columns ({visibleCount})</span>
      {additionalCount > 0 && (
        <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
          +{additionalCount}
        </span>
      )}
      <Settings className="w-4 h-4" />
    </Button>
  );

  return (
    <>
      {triggerButton}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Column Selector"
        description="Manage column visibility and presets"
        size="xl"
        actions={[
          {
            label: 'Close',
            variant: 'outline',
            size: 'sm',
            closesModal: true,
            onClick: () => onOpenChange(false),
          },
        ]}
      >
      <div className="space-y-6">
        {/* General Settings Content */}
        <div className="space-y-6 min-h-[500px]">
            {/* Preset Selection */}
            <div>
              <label className="block text-sm font-medium text-noble-black-700 mb-2">Presets</label>
              <Select value={activePreset} onValueChange={onPresetChange}>
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Select a preset">
                    {currentPreset ? `${currentPreset.name} ${currentPreset.platform ? `(${currentPreset.platform})` : ''}` : 'Select a preset'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availablePresets.map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name} {preset.platform && `(${preset.platform})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-noble-black-500">General Columns Essential columns that work across all platforms</p>
            </div>

        {/* Search */}
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-noble-black-400" />
            <input
              type="text"
              placeholder="Search columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-noble-black-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Data Field Tags */}
        {dataFieldTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-noble-black-700 mb-2">Data Field Tags</label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
              {dataFieldTags.map(tag => {
                const isActive = tag.visible;
                const tooltip = [
                  `Field: ${tag.fullPath}`,
                  tag.sampleValue ? `Sample: ${tag.sampleValue}` : null,
                  tag.platforms.length > 0 ? `Platforms: ${tag.platforms.join(', ')}` : null
                ].filter(Boolean).join(' | ');

                return (
                  <button
                    key={tag.columnKey}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-noble-black-200 text-noble-black-600 hover:bg-noble-black-50'
                    }`}
                    title={tooltip}
                  >
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-noble-black-500">
              These tags come directly from nested <code>data.*</code> fields (sampled from the latest datasets).
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="border border-noble-black-200 rounded-lg p-4 bg-noble-black-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-noble-black-700">
              {visibleCount} of {totalCount} columns visible
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleAllColumns(true)}
              className={`text-xs transition-all duration-200 active:scale-95 ${
                currentVisibleState === 'all'
                  ? 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                  : 'text-noble-black-600 hover:text-noble-black-700'
              }`}
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={hideAdditionalColumns}
              className={`text-xs transition-all duration-200 active:scale-95 ${
                currentVisibleState === 'general-only'
                  ? 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                  : 'text-noble-black-600 hover:text-noble-black-700'
              }`}
            >
              Hide Additional Columns
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleAllColumns(false)}
              className={`text-xs transition-all duration-200 active:scale-95 ${
                currentVisibleState === 'none'
                  ? 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                  : 'text-noble-black-600 hover:text-noble-black-700'
              }`}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
      </div>
    </Modal>
    </>
  );
}
