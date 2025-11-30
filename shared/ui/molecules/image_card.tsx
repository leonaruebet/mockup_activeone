/**
 * Image Card Component
 * Purpose: Reusable card component with image display - extends base Card
 * Location: shared/ui/molecules/image_card.tsx
 *
 * Features:
 * - Extends shared/ui/molecules/card/ base Card component
 * - Image display with fallback placeholder
 * - Status badges
 * - Customizable content sections
 * - Action buttons (configurable)
 * - Error handling for image loading
 *
 * Changelog:
 * - 2025-11-14: Created as generic reusable component with image support
 */

'use client';

import * as React from 'react';
import { Eye } from 'lucide-react';
import { Button, Tag } from '../atoms';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { cn } from '../utils';

export interface ImageCardProps {
  /** Unique ID for the card */
  id: string | number;
  /** Card title */
  title?: string;
  /** Card subtitle (shown below title in smaller text) */
  subtitle?: string;
  /** Card description */
  description?: string;
  /** Image URL */
  imageUrl?: string | null;
  /** Image alt text */
  imageAlt?: string;
  /** Image height class (e.g., 'h-48', 'h-64') */
  imageHeight?: string;
  /** Image border radius (e.g., 'rounded-lg', 'rounded-xl') */
  imageRounded?: string;
  /** Status text for badge */
  status?: string;
  /** Status badge variant */
  statusVariant?: 'default' | 'info' | 'success' | 'warning' | 'danger' | 'outline';
  /** Show status badge or not */
  showStatus?: boolean;
  /** Primary content sections to display */
  content?: React.ReactNode;
  /** Additional metadata sections */
  metadata?: React.ReactNode;
  /** Action buttons configuration */
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'destructive' | 'ghost' | 'outline' | 'default';
    icon?: React.ComponentType<{ className?: string }>;
    fullWidth?: boolean;
  }[];
  /** Icon to show when no image available */
  placeholderIcon?: React.ComponentType<{ className?: string }>;
  /** Callback when view image button is clicked */
  onViewImage?: () => void;
  /** i18n dictionary for labels */
  dict?: any;
  /** Additional CSS classes for card */
  className?: string;
  /** Card variant (from base Card) */
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  /** Card padding (from base Card) */
  padding?: 'none' | 'sm' | 'default' | 'lg';
  /** Card border radius */
  cardRounded?: string;
}

/**
 * get_image_url
 * Purpose: Extract and validate image URL
 * @param imageUrl - URL or object with image data
 * @returns Valid image URL or null
 */
function get_image_url(imageUrl: string | null | undefined | any): string | null {
  console.log('[ImageCard] get_image_url_enter', {
    imageUrl,
    type: typeof imageUrl,
  });

  if (!imageUrl) return null;

  // Handle string URLs
  if (typeof imageUrl === 'string') {
    console.log('[ImageCard] Image is string:', imageUrl);
    return imageUrl;
  }

  // Handle object with URL properties
  if (typeof imageUrl === 'object' && imageUrl !== null) {
    if (imageUrl.url) {
      console.log('[ImageCard] Using imageUrl.url:', imageUrl.url);
      return typeof imageUrl.url === 'string' ? imageUrl.url : null;
    }
    if (imageUrl.data) {
      console.log('[ImageCard] Using imageUrl.data:', imageUrl.data);
      return typeof imageUrl.data === 'string' ? imageUrl.data : null;
    }
  }

  console.log('[ImageCard] Could not extract image URL from:', imageUrl);
  return null;
}

/**
 * ImageCard Component
 * Purpose: Display card with image, content, and action buttons (extends base Card)
 *
 * @param id - Unique identifier
 * @param title - Card title
 * @param description - Card description
 * @param imageUrl - Image URL or object
 * @param imageAlt - Image alt text
 * @param imageHeight - Image height Tailwind class
 * @param status - Status badge text
 * @param statusVariant - Status badge variant
 * @param content - Primary content section
 * @param metadata - Additional metadata section
 * @param actions - Action buttons configuration
 * @param placeholderIcon - Icon component for no-image state
 * @param dict - i18n dictionary
 * @param className - Additional CSS classes
 * @param variant - Card variant from base Card
 * @param padding - Card padding from base Card
 */
export function ImageCard({
  id,
  title,
  subtitle,
  description,
  imageUrl,
  imageAlt = 'Image',
  imageHeight = 'h-48',
  imageRounded = 'rounded-xl',
  status,
  statusVariant = 'warning',
  showStatus = true,
  content,
  metadata,
  actions = [],
  placeholderIcon: PlaceholderIcon,
  onViewImage,
  dict,
  className = '',
  variant = 'default',
  padding = 'none',
  cardRounded = 'rounded-2xl',
}: ImageCardProps) {
  console.log('[ImageCard] Rendering card', {
    id,
    has_image: !!imageUrl,
  });

  const validImageUrl = get_image_url(imageUrl);

  return (
    <Card
      variant={variant}
      padding={padding}
      className={cn('overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col', cardRounded, className)}
    >
      {/* Image Section */}
      <div className={cn('relative overflow-hidden p-3', imageHeight)}>
        {validImageUrl ? (
          <img
            src={validImageUrl}
            alt={imageAlt}
            className={cn('w-full h-full object-cover', imageRounded)}
            onError={(e) => {
              console.error('[ImageCard] Image failed to load:', validImageUrl);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className={cn('w-full h-full flex items-center justify-center text-noble-black-400 bg-noble-black-50', imageRounded)}>
            {PlaceholderIcon ? (
              <PlaceholderIcon className="w-12 h-12" />
            ) : (
              <span className="text-sm">{dict?.common?.no_image || 'No Image'}</span>
            )}
          </div>
        )}

        {/* View Image Button - Top Right */}
        {onViewImage && (
          <button
            onClick={onViewImage}
            className="absolute top-5 right-5 bg-white hover:bg-noble-black-50 rounded-md p-1.5 border border-noble-black-300 shadow-sm transition-colors"
            aria-label="View details"
          >
            <Eye className="w-3 h-3 text-noble-black-500" />
          </button>
        )}

        {/* Status Badge */}
        {status && showStatus && (
          <div className="absolute top-5 left-5">
            <Tag variant={statusVariant} size="sm">
              {status}
            </Tag>
          </div>
        )}
      </div>

      {/* Content Section using Card components */}
      <CardContent className="px-4 pb-4 pt-2 flex flex-col flex-1">
        {/* Title & Subtitle - Fixed height */}
        <div className="mb-3 min-h-[3rem]">
          {title && (
            <h3 className="text-sm font-semibold text-noble-black-700 line-clamp-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-noble-black-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Description - Fixed height (moved above content) */}
        {description && (
          <div className="mb-3 min-h-[3rem]">
            <p className="text-xs text-noble-black-500 line-clamp-3">
              {description}
            </p>
          </div>
        )}

        {/* Primary Content - Fixed height */}
        <div className="mb-3 min-h-[4rem]">{content}</div>

        {/* Metadata - Fixed height */}
        <div className="mb-3 min-h-[1.5rem]">{metadata}</div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1"></div>

        {/* Action Buttons - Always at bottom */}
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                size="md"
                className={cn(
                  action.fullWidth || actions.length === 1 ? 'w-full' : 'flex-1',
                  action.variant === 'default' && 'bg-noble-black-900 hover:bg-noble-black-800 text-white',
                  action.variant === 'primary' && 'bg-primary-600 hover:bg-primary-700 text-white'
                )}
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="w-4 h-4 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
