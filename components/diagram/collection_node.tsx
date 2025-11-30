/**
 * collection_node.tsx
 * Purpose: Custom ReactFlow node component for MongoDB collections
 * Features: Beautiful UI, field list, document count badge
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Database } from 'lucide-react';

type CollectionNodeData = {
  label: string;
  fields: Array<{
    name: string;
    types: Set<string>;
    is_array: boolean;
  }>;
  total_fields: number;
  document_count: number;
};

export const CollectionNode = memo(({ data }: NodeProps<CollectionNodeData>) => {
  const { label, fields, total_fields, document_count } = data;

  return (
    <div className="relative bg-white border-2 border-primary-600 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 min-w-[280px]">
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary-600 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary-600 !border-2 !border-white"
      />

      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-white" />
            <h3 className="font-bold text-white text-sm">{label}</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Document count badge */}
            <span className="text-[10px] text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
              {document_count.toLocaleString()} docs
            </span>
          </div>
        </div>
      </div>

      {/* Fields List */}
      <div className="px-4 py-3 max-h-[140px] overflow-y-auto">
        {fields.length > 0 ? (
          <div className="space-y-1.5">
            {fields.slice(0, 8).map((field) => {
              // Handle both Set and Array for types (Set from deserialization, Array from old cache)
              const types_array = field.types instanceof Set
                ? Array.from(field.types)
                : Array.isArray(field.types)
                  ? field.types
                  : [];

              const type = types_array[0] || 'unknown';
              const display_type = field.is_array ? `${type}[]` : type;

              // Debug logging (remove after fixing)
              if (type === 'unknown') {
                console.log('[CollectionNode] Unknown type detected:', {
                  field_name: field.name,
                  types_value: field.types,
                  types_type: typeof field.types,
                  is_set: field.types instanceof Set,
                  is_array: Array.isArray(field.types),
                });
              }

              return (
                <div
                  key={field.name}
                  className="flex items-start gap-2 text-xs group hover:bg-whitesmoke-100 px-2 py-1 rounded transition-colors"
                >
                  <span
                    className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      type === 'ObjectId'
                        ? 'bg-primary-100 text-primary-700'
                        : type === 'string'
                        ? 'bg-blue-100 text-blue-700'
                        : type === 'number'
                        ? 'bg-green-100 text-green-700'
                        : type === 'Date'
                        ? 'bg-purple-100 text-purple-700'
                        : type === 'boolean'
                        ? 'bg-amber-100 text-amber-700'
                        : type === 'object'
                        ? 'bg-indigo-100 text-indigo-700'
                        : type === 'array'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-slate-200 text-slate-800' // Better contrast for unknown
                    }`}
                  >
                    {display_type}
                  </span>
                  <span className="text-noble-black-500 font-medium truncate">
                    {field.name}
                  </span>
                </div>
              );
            })}

            {/* Show "more fields" indicator */}
            {total_fields > 8 && (
              <div className="text-[10px] text-noble-black-400 italic px-2 pt-1 border-t border-noble-black-100">
                + {total_fields - 8} more fields...
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-noble-black-400 italic text-center py-2">
            No fields (empty collection)
          </div>
        )}
      </div>

      {/* Footer with field count */}
      {fields.length > 0 && (
        <div className="px-4 py-2 border-t border-noble-black-100 bg-whitesmoke-50 rounded-b-xl">
          <div className="text-[10px] text-noble-black-400 font-medium">
            {total_fields} field{total_fields !== 1 ? 's' : ''} total
          </div>
        </div>
      )}
    </div>
  );
});

CollectionNode.displayName = 'CollectionNode';
