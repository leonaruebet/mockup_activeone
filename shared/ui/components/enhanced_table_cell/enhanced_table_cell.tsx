'use client';

/**
 * Enhanced Table Cell Component
 * Purpose: Reusable table cell with hover tooltip for full data preview
 * Location: shared/ui/components/enhanced_table_cell/enhanced_table_cell.tsx
 *
 * Features:
 * - Hover tooltip with full data preview
 * - Pastel orange theme
 * - JSON formatting for objects
 * - URL handling with external links
 * - Text truncation with line clamping
 * - Portal-based rendering to break out of containers
 * - Responsive and accessible design
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink } from 'lucide-react';

export interface EnhancedTableCellProps {
  /** Cell content value */
  value: any;
  /** Column configuration */
  column: {
    key: string;
    label: string;
    type?: string;
    formatter?: (value: any) => string;
  };
  /** Custom className for additional styling */
  className?: string;
  /** Maximum length before showing hover tooltip */
  hoverThreshold?: number;
}

/**
 * EnhancedTableCell Component
 * Purpose: Renders table cell with hover tooltip for full data preview
 * Params: value - cell content, column - column configuration, className - additional styling
 * Returns: Enhanced table cell with hover functionality
 */
export function EnhancedTableCell({
  value,
  column,
  className = '',
  hoverThreshold = 50
}: EnhancedTableCellProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const cellRef = React.useRef<HTMLDivElement>(null);

  // Handle ESC key to close tooltip
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showTooltip) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTooltip]);

  // Format the display value
  const displayValue = column.formatter ? column.formatter(value) : String(value || 'N/A');
  const fullValue = String(value || 'N/A');

  // Determine if hover tooltip is needed
  const needsHover =
    (typeof value === 'object' && value !== null) ||
    (typeof value === 'string' && value.length > hoverThreshold) ||
    (typeof value === 'number' && value.toString().length > hoverThreshold);

  // Calculate content dimensions once
  const getContentDimensions = () => {
    const content = typeof value === 'object' && value !== null
      ? JSON.stringify(value, null, 2)
      : fullValue;

    // Calculate width needed
    let tooltipWidth = 350;
    if (typeof content === 'string') {
      const lines = content.split('\n');
      const maxLineLength = Math.max(...lines.map(line => line.length));
      const charWidth = 7; // Average character width
      tooltipWidth = Math.min(600, Math.max(250, maxLineLength * charWidth + 80));
    }

    // Calculate height needed
    let actualHeight;
    if (typeof value === 'object' && value !== null) {
      const lines = content.split('\n');
      const lineHeight = 16; // Height per line for monospace font
      actualHeight = lines.length * lineHeight + 80;
    } else {
      const avgCharsPerLine = 60;
      const estimatedLines = Math.ceil(content.length / avgCharsPerLine);
      const lineHeight = 14; // Height per line for regular text
      actualHeight = estimatedLines * lineHeight + 80;
    }

    return { width: tooltipWidth, height: actualHeight, content };
  };

  // Position tooltip relative to cell
  const getTooltipPosition = () => {
    if (!cellRef.current) return { top: 0, left: 0, width: 300, height: 150 };

    const rect = cellRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const { width: tooltipWidth, height: actualHeight } = getContentDimensions();

    // Try to position above the cell first
    let top = rect.top - actualHeight - 20;
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

    // Check if tooltip fits above cell
    if (top < 20) {
      // Position below instead
      top = rect.bottom + 20;
    }

    // Adjust horizontal position
    if (left < 20) {
      left = 20;
    } else if (left + tooltipWidth > viewportWidth - 20) {
      left = viewportWidth - tooltipWidth - 20;
    }

    // Final height calculation - ensure it fits in viewport
    let finalHeight = actualHeight;
    if (top + actualHeight > viewportHeight - 20) {
      finalHeight = viewportHeight - top - 20;
      if (finalHeight < 100) {
        finalHeight = 100;
        top = 20;
      }
    }

    return { top, left, width: tooltipWidth, height: finalHeight, fullHeight: actualHeight };
  };

  /**
   * renderContent
   * Purpose: Render the appropriate content based on column type
   */
  const renderContent = () => {
    if (column.type === 'url' && value) {
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline flex items-center gap-1"
        >
          {displayValue}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }

    return (
      <div
        ref={cellRef}
        className="relative cursor-pointer"
        onMouseEnter={() => needsHover && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="line-clamp-2 block">{displayValue}</span>
        {needsHover && renderHoverTooltip()}
      </div>
    );
  };

  /**
   * renderHoverTooltip
   * Purpose: Render the hover tooltip with full content using portal
   */
  const renderHoverTooltip = () => {
    if (!showTooltip || !needsHover) return null;

    const content = typeof value === 'object' && value !== null
      ? JSON.stringify(value, null, 2)
      : fullValue;

    const dimensions = getContentDimensions();
    const position = getTooltipPosition();
    const fullHeight = dimensions.height;

    return createPortal(
      <div
        className="z-[99999999] bg-orange-100 text-orange-900 border border-orange-200 p-4 rounded-lg shadow-xl break-words pointer-events-none transition-opacity duration-200"
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
          height: `${position.height}px`,
          opacity: showTooltip ? 1 : 0,
          zIndex: 99999999,
          maxWidth: '90vw'
        }}
      >
        <div className="absolute w-3 h-3 bg-orange-100 rotate-45 border-l border-b border-orange-200"
             style={{
               bottom: position.top < (cellRef.current?.getBoundingClientRect().top || 0) ? 'auto' : '-6px',
               top: position.top >= (cellRef.current?.getBoundingClientRect().top || 0) ? '-6px' : 'auto',
               left: '50%',
               transform: 'translateX(-50%)'
             }}
        />
        <div className="text-xs font-semibold text-orange-700 mb-2 uppercase tracking-wider border-b border-orange-300 pb-1">
          {column.label}
        </div>
        <div className="text-xs whitespace-pre-wrap overflow-hidden"
             style={{
               height: 'calc(100% - 40px)', // Account for header and help text
               fontFamily: typeof value === 'object' ? 'monospace' : 'inherit',
               wordBreak: 'break-word',
               overflow: position.height < fullHeight ? 'auto' : 'hidden'
             }}>
          {typeof value === 'object' && value !== null
            ? JSON.stringify(value, null, 2)
            : content
          }
        </div>
        <div className="text-orange-600 text-xs opacity-75 mt-2 text-center">
          {position.height < fullHeight ? 'Scroll to view • ESC to close' : 'ESC to close'}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <td className={`border-b border-noble-black-100 px-4 py-3 text-sm relative group ${className}`}>
      <div className="text-noble-black-600">
        {renderContent()}
      </div>
    </td>
  );
}