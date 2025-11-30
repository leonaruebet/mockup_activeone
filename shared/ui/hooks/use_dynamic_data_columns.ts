'use client';

/**
 * useDynamicDataColumns Hook
 * Purpose: Dynamically analyze MongoDB data structure and generate table columns
 * Location: shared/ui/hooks/use_dynamic_data_columns.ts
 *
 * Features:
 * - Discovers available fields from data objects
 * - Generates meaningful column definitions
 * - Handles nested objects and arrays
 * - Prioritizes important fields for display
 * - Handles different actor data structures
 */

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

/**
 * Field priority for display - higher priority = shown first
 */
const FIELD_PRIORITIES: Record<string, number> = {
  // Content fields
  text: 100,
  content: 100,
  caption: 100,
  message: 100,
  title: 90,
  description: 80,
  body: 70,

  // Author/User fields
  author: 95,
  username: 95,
  name: 90,
  displayName: 85,

  // Media/URL fields
  url: 85,
  link: 85,
  source_url: 85,
  images: 70,
  videos: 70,

  // Engagement fields
  likes: 60,
  shares: 60,
  comments: 60,
  views: 60,

  // Metadata fields
  type: 50,
  platform: 40,
  published_at: 90,
  created_at: 90,
};

/**
 * Column definition for dynamic table
 */
export interface DynamicColumn {
  key: string;
  label: string;
  width?: string;
  priority: number;
  type: 'text' | 'date' | 'url' | 'number' | 'array' | 'object';
  formatter?: (value: any) => string;
  platforms?: string[]; // Which platforms this column appears in
  visible?: boolean; // Column visibility state
  examples?: any[];
}

/**
 * DataFieldTag
 * Purpose: Represents data.* leaf fields surfaced as quick-toggle tags
 */
export interface DataFieldTag {
  columnKey: string;
  label: string;
  fullPath: string;
  visible: boolean;
  platforms: string[];
  sampleValue?: string;
}

/**
 * Column preset for specific platforms
 */
export interface ColumnPreset {
  id: string;
  name: string;
  description: string;
  platform?: string;
  columns: string[]; // Column keys to show
  icon?: string;
}

/**
 * Platform-specific column presets
 */
const PLATFORM_PRESETS: ColumnPreset[] = [
  {
    id: 'general',
    name: 'General Columns',
    description: 'Essential columns that work across all platforms',
    columns: ['platform', 'created_at'] // Only show essential system columns by default
  },
  {
    id: 'all',
    name: 'All Available Columns',
    description: 'Show all columns found in the current datasets',
    columns: [] // Will be filled with all discovered columns
  },
  {
    id: 'core',
    name: 'Core Fields',
    description: 'Essential fields common to all platforms',
    columns: ['platform', 'created_at', 'stage', 'content_type']
  },
  {
    id: 'content',
    name: 'Content Focus',
    description: 'Text and media content fields',
    columns: ['text', 'content', 'caption', 'title', 'description', 'url', 'images', 'videos']
  },
  {
    id: 'engagement',
    name: 'Engagement Metrics',
    description: 'Likes, shares, views, and other metrics',
    columns: ['likes', 'shares', 'comments', 'views', 'engagement']
  },
  {
    id: 'facebook',
    name: 'Facebook Fields',
    description: 'Facebook-specific fields',
    platform: 'facebook',
    columns: ['reactions', 'shares', 'comments', 'link', 'message', 'story']
  },
  {
    id: 'instagram',
    name: 'Instagram Fields',
    description: 'Instagram-specific fields',
    platform: 'instagram',
    columns: ['likes', 'comments', 'caption', 'media_url', 'media_type', 'owner']
  },
  {
    id: 'tiktok',
    name: 'TikTok Fields',
    description: 'TikTok-specific fields',
    platform: 'tiktok',
    columns: ['likes', 'shares', 'comments', 'play_count', 'digg_count', 'text', 'music']
  },
  {
    id: 'twitter',
    name: 'Twitter Fields',
    description: 'Twitter-specific fields',
    platform: 'twitter',
    columns: ['retweets', 'likes', 'replies', 'text', 'hashtags', 'mentions']
  },
  {
    id: 'youtube',
    name: 'YouTube Fields',
    description: 'YouTube-specific fields',
    platform: 'youtube',
    columns: ['views', 'likes', 'dislikes', 'comments', 'duration', 'title', 'description']
  }
];

/**
 * analyze_data_fields
 * Purpose: Recursively analyze data objects to discover all available fields
 */
function analyze_data_fields(data: any[], depth = 0, maxDepth = 3): Record<string, { count: number; type: string; examples: any[] }> {
  const fields: Record<string, { count: number; type: string; examples: any[] }> = {};

  for (const item of data) {
    if (!item || typeof item !== 'object') continue;

    const analyze_object = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (depth >= maxDepth && typeof value === 'object') continue;

        const fieldKey = prefix ? `${prefix}.${key}` : key;

        if (!fields[fieldKey]) {
          fields[fieldKey] = {
            count: 0,
            type: typeof value,
            examples: []
          };
        }

        fields[fieldKey].count++;

        // Add examples (limit to 3 per field)
        if (fields[fieldKey].examples.length < 3 && value !== null && value !== undefined) {
          fields[fieldKey].examples.push(value);
        }

        // Recursively analyze nested objects
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && depth < maxDepth) {
          analyze_object(value, fieldKey);
        }
      }
    };

    // Analyze the main dataset object
    analyze_object(item);

    // Also analyze the nested data object separately to expose its fields
    if (item.data && typeof item.data === 'object') {
      analyze_object(item.data, 'data');
    }
  }

  return fields;
}

/**
 * generate_column_from_field
 * Purpose: Create a column definition from field analysis
 */
function generate_column_from_field(fieldKey: string, analysis: { count: number; type: string; examples: any[] }, platforms: string[]): DynamicColumn {
  // Determine column type
  let columnType: DynamicColumn['type'] = 'text';

  if (fieldKey.includes('url') || fieldKey.includes('link')) {
    columnType = 'url';
  } else if (fieldKey.includes('date') || fieldKey.includes('published') || fieldKey.includes('created')) {
    columnType = 'date';
  } else if (fieldKey.includes('count') || fieldKey.includes('likes') || fieldKey.includes('shares')) {
    columnType = 'number';
  } else if (analysis.type === 'array') {
    columnType = 'array';
  } else if (analysis.type === 'object') {
    columnType = 'object';
  }

  // Generate readable label
  const rawLabelParts = fieldKey.split('.');
  const filteredLabelParts = rawLabelParts.filter((part, index) => !(index === 0 && part === 'data'));
  const labelSourceParts = filteredLabelParts.length > 0 ? filteredLabelParts : rawLabelParts;
  const label = labelSourceParts
    .map(part => part.replace(/_/g, ' '))
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' > ');

  // Determine priority
  let priority = FIELD_PRIORITIES[fieldKey.toLowerCase()] || 0;
  if (priority === 0) {
    // Base priority on field occurrence frequency
    priority = Math.min(analysis.count, 50);
  }

  // Create formatter
  let formatter: ((value: any) => string) | undefined;

  if (columnType === 'date') {
    formatter = (value: any) => {
      if (!value) return 'N/A';
      const date = new Date(value);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };
  } else if (columnType === 'url') {
    formatter = (value: any) => {
      if (!value) return 'N/A';
      if (typeof value === 'string' && value.length > 50) {
        return value.substring(0, 47) + '...';
      }
      return String(value);
    };
  } else if (columnType === 'array') {
    formatter = (value: any) => {
      if (!Array.isArray(value)) return String(value || 'N/A');
      return `${value.length} items`;
    };
  } else if (columnType === 'object') {
    if (fieldKey === 'data') {
      // Special formatter for the main data field - show as JSON preview
      formatter = (value: any) => {
        if (!value || typeof value !== 'object') return String(value || 'N/A');
        try {
          const jsonStr = JSON.stringify(value);
          if (jsonStr.length > 50) {
            return jsonStr.substring(0, 47) + '...';
          }
          return jsonStr;
        } catch {
          return '[Object]';
        }
      };
    } else {
      formatter = (value: any) => {
        if (!value || typeof value !== 'object') return String(value || 'N/A');
        const keys = Object.keys(value);
        return `${keys.length} fields`;
      };
    }
  } else {
    formatter = (value: any) => {
      if (value === null || value === undefined) return 'N/A';
      if (typeof value === 'string' && value.length > 100) {
        return value.substring(0, 97) + '...';
      }
      return String(value);
    };
  }

  return {
    key: fieldKey,
    label,
    priority,
    type: columnType,
    formatter,
    platforms: [...new Set(platforms)], // Unique platforms where this field appears
    visible: true, // Default to visible
    width: columnType === 'text' ? '300px' : columnType === 'date' ? '150px' : '120px',
    examples: analysis.examples
  };
}

/**
 * useDynamicDataColumns Hook
 * Purpose: Generate dynamic columns from MongoDB data with platform presets
 * Params:
 *   - data: Array of data objects from MongoDB
 *   - maxColumns: Maximum number of columns to generate (default: 20)
 *   - initialPreset: Initial preset to apply (default: 'all')
 * Returns: Enhanced column management object
 */
export function useDynamicDataColumns(
  data: any[],
  maxColumns = 20,
  initialPreset = 'all'
): {
  columns: DynamicColumn[];
  visibleColumns: DynamicColumn[];
  availablePresets: ColumnPreset[];
  activePreset: string;
  setActivePreset: (presetId: string) => void;
  availablePlatforms: string[];
  toggleColumn: (columnKey: string) => void;
  resetToDefault: () => void;
  dataFieldTags: DataFieldTag[];
} {
  // Memoize the data analysis
  const analysisResult = useMemo(() => {
    console.log('[useDynamicDataColumns] Analyzing data:', data?.length || 0, 'items');

    if (!data || data.length === 0) {
      console.log('[useDynamicDataColumns] No data available, creating basic columns');

      // Create basic columns even when no data is available
      const basicColumns: DynamicColumn[] = [
        {
          key: 'platform',
          label: 'Platform',
          priority: 100,
          type: 'text',
          formatter: (value: any) => value || 'Unknown',
          platforms: [],
          visible: true,
          width: '120px'
        },
        {
          key: 'created_at',
          label: 'Created At',
          priority: 90,
          type: 'date',
          formatter: (value: any) => {
            if (!value) return 'N/A';
            const date = new Date(value);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
          },
          platforms: [],
          visible: true,
          width: '150px'
        },
        {
          key: 'stage',
          label: 'Stage',
          priority: 85,
          type: 'text',
          formatter: (value: any) => value || 'Unknown',
          platforms: [],
          visible: false,
          width: '100px'
        },
        {
          key: 'content_type',
          label: 'Content Type',
          priority: 80,
          type: 'text',
          formatter: (value: any) => value || 'Unknown',
          platforms: [],
          visible: false,
          width: '120px'
        },
        {
          key: 'data',
          label: 'Data',
          priority: 80,
          type: 'object',
          formatter: (value: any) => {
            if (!value || typeof value !== 'object') return String(value || 'N/A');
            try {
              const jsonStr = JSON.stringify(value);
              if (jsonStr.length > 50) {
                return jsonStr.substring(0, 47) + '...';
              }
              return jsonStr;
            } catch {
              return '[Object]';
            }
          },
          platforms: [],
          visible: true,
          width: '300px'
        }
      ];

      return {
        allColumns: basicColumns,
        updatedPresets: PLATFORM_PRESETS.map(preset => ({
          ...preset,
          columns: preset.id === 'general' ? ['platform', 'created_at'] :
                   preset.id === 'all' ? basicColumns.map(col => col.key) :
                   preset.columns
        })),
        availablePlatforms: []
      };
    }

    console.log('[useDynamicDataColumns] Analyzing data structure from', data.length, 'items');

    // Collect platforms and track which fields appear in which platforms
    const platformsSet = new Set<string>();
    const fieldPlatforms: Record<string, string[]> = {};

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      if (item.platform) {
        platformsSet.add(item.platform);
      }

      const analyze_object = (obj: any, prefix = '') => {
        for (const [key] of Object.entries(obj)) {
          const fieldKey = prefix ? `${prefix}.${key}` : key;

          if (!fieldPlatforms[fieldKey]) {
            fieldPlatforms[fieldKey] = [];
          }

          if (item.platform && !fieldPlatforms[fieldKey].includes(item.platform)) {
            fieldPlatforms[fieldKey].push(item.platform);
          }

          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && prefix.split('.').length < 3) {
            analyze_object(obj[key], fieldKey);
          }
        }
      };

      // Define allowed system fields (everything else is filtered out)
      const allowedSystemFields = ['platform', 'created_at', 'stage', 'content_type'];

      // Only analyze allowed system fields from the main dataset object
      for (const [key, value] of Object.entries(item)) {
        if (allowedSystemFields.includes(key)) {
          const fieldKey = key;

          if (!fieldPlatforms[fieldKey]) {
            fieldPlatforms[fieldKey] = [];
          }

          if (item.platform && !fieldPlatforms[fieldKey].includes(item.platform)) {
            fieldPlatforms[fieldKey].push(item.platform);
          }

          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            analyze_object(value, fieldKey);
          }
        }
      }

      // Analyze the nested data object to expose all its fields
      if (item.data && typeof item.data === 'object') {
        analyze_object(item.data, 'data');
      }

      // Log what we found for debugging
      if (i === 0) {
        console.log('[useDynamicDataColumns] Analyzing sample item structure:', {
          _id: item._id,
          platform: item.platform,
          topLevelKeys: Object.keys(item),
          dataKeys: item.data ? Object.keys(item.data) : 'No data field',
          fullDataSample: item.data
        });
      }
    }

    // Analyze all fields in the data
    const fieldAnalysis = analyze_data_fields(data);
    console.log('[useDynamicDataColumns] Discovered fields:', Object.keys(fieldAnalysis));

    // Generate columns from fields with platform tracking
    const allColumns = Object.entries(fieldAnalysis)
      .map(([fieldKey, analysis]) => generate_column_from_field(fieldKey, analysis, fieldPlatforms[fieldKey] || []))
      .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)

    console.log('[useDynamicDataColumns] Generated columns:', allColumns.length);

    // Update presets with actual columns
    const updatedPresets = PLATFORM_PRESETS.map(preset => {
      if (preset.id === 'all') {
        return { ...preset, columns: allColumns.map(col => col.key) };
      }
      return preset;
    });

    const availablePlatforms = Array.from(platformsSet).sort();

    return {
      allColumns,
      updatedPresets,
      availablePlatforms
    };
  }, [data]);

  // State management
  const [activePreset, setActivePresetState] = useState(initialPreset);
  const previousPresetRef = useRef(initialPreset);

  const mapColumnsForPreset = useCallback((
    preset: ColumnPreset | undefined,
    previousColumns: DynamicColumn[] | null,
    forcePresetVisibility: boolean
  ) => {
    if (analysisResult.allColumns.length === 0) {
      return [];
    }

    const previousVisibility = new Map((previousColumns || []).map(col => [col.key, col.visible ?? true]));
    const shouldDefaultToPreset = forcePresetVisibility || !previousColumns || previousColumns.length === 0;

    return analysisResult.allColumns.map((col, index) => {
      const presetVisible = preset?.id === 'all'
        ? true
        : preset
          ? preset.columns.includes(col.key) || preset.columns.some(presetCol => col.key.includes(presetCol))
          : index < maxColumns;

      const inheritedVisible = shouldDefaultToPreset
        ? presetVisible
        : previousVisibility.has(col.key)
          ? (previousVisibility.get(col.key) ?? presetVisible)
          : presetVisible;

      return {
        ...col,
        visible: inheritedVisible
      };
    });
  }, [analysisResult, maxColumns]);

  const [columns, setColumns] = useState(() => {
    const preset = analysisResult.updatedPresets.find(p => p.id === initialPreset);
    return mapColumnsForPreset(preset, null, true);
  });

  useEffect(() => {
    const preset = analysisResult.updatedPresets.find(p => p.id === activePreset);
    const shouldForcePreset = previousPresetRef.current !== activePreset;

    setColumns(prev => {
      const nextColumns = mapColumnsForPreset(preset, shouldForcePreset ? null : prev, shouldForcePreset);

      const isDifferentLength = prev.length !== nextColumns.length;
      const hasDifferences = isDifferentLength || prev.some((prevCol, index) => {
        const nextCol = nextColumns[index];
        if (!nextCol) {
          return true;
        }

        return prevCol.key !== nextCol.key || prevCol.visible !== nextCol.visible;
      });

      return hasDifferences ? nextColumns : prev;
    });

    previousPresetRef.current = activePreset;
  }, [analysisResult, activePreset, mapColumnsForPreset]);

  const setActivePreset = useCallback((presetId: string) => {
    const preset = analysisResult.updatedPresets.find(p => p.id === presetId);
    if (!preset) return;

    setActivePresetState(presetId);
  }, [analysisResult.updatedPresets]);

  const toggleColumn = useCallback((columnKey: string) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  const resetToDefault = useCallback(() => {
    setActivePreset('core');
  }, [setActivePreset]);

  const visibleColumns = useMemo(() => columns.filter(col => col.visible), [columns]);

  const dataFieldTags: DataFieldTag[] = useMemo(() => {
    const humanize = (value: string) => {
      return value
        .replace(/[_-]/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, char => char.toUpperCase());
    };

    const formatSampleValue = (value: any): string | undefined => {
      if (value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === 'string') {
        return value.length > 60 ? `${value.substring(0, 57)}…` : value;
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        const preview = JSON.stringify(value.slice(0, 2));
        return value.length > 2 ? `${preview.substring(0, 57)}…` : preview;
      }

      if (typeof value === 'object') {
        const preview = JSON.stringify(value);
        return preview.length > 60 ? `${preview.substring(0, 57)}…` : preview;
      }

      return undefined;
    };

    const deduped = new Map<string, DataFieldTag>();

    columns.forEach(col => {
      if (!col.key.startsWith('data.')) {
        return;
      }

      const pathParts = col.key.split('.').slice(1);
      if (pathParts.length === 0) {
        return;
      }

      const label = pathParts.map(part => humanize(part)).join(' / ');
      const sampleValue = col.examples && col.examples.length > 0 ? formatSampleValue(col.examples[0]) : undefined;

      deduped.set(col.key, {
        columnKey: col.key,
        label,
        fullPath: col.key,
        visible: col.visible ?? true,
        platforms: col.platforms ?? [],
        sampleValue
      });
    });

    return Array.from(deduped.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [columns]);

  return {
    columns,
    visibleColumns,
    availablePresets: analysisResult.updatedPresets,
    activePreset,
    setActivePreset,
    availablePlatforms: analysisResult.availablePlatforms,
    toggleColumn,
    resetToDefault,
    dataFieldTags
  };
}
