/**
 * EmptyState Component
 * Purpose: Reusable empty state component with icon, message, and optional action
 * Location: shared/ui/molecules/empty_state/empty_state.tsx
 */

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Typography } from '../../atoms/typography';
import { Button } from '../../atoms/button';
import { cn } from '../../utils';

export interface EmptyStateProps {
  /** Icon to display (Lucide icon component) */
  icon?: LucideIcon;
  /** Main title/message */
  title?: string;
  /** Optional description */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  /** Custom icon size (default: h-12 w-12) */
  iconSize?: string;
  /** Custom icon color (default: text-noble-black-300) */
  iconColor?: string;
  /** Custom text color for title (default: text-noble-black-400) */
  textColor?: string;
  /** Additional className for the container */
  className?: string;
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * EmptyState component
 * Displays a centered empty state with icon, message, and optional action button
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconSize = 'h-12 w-12',
  iconColor = 'text-noble-black-300',
  textColor = 'text-noble-black-400',
  className,
  padding = 'lg',
}: EmptyStateProps) {
  const paddingClasses = {
    sm: 'py-6 px-4',
    md: 'py-8 px-4',
    lg: 'py-12 px-4',
  };

  return (
    <div className={cn('text-center', paddingClasses[padding], className)}>
      {Icon && (
        <Icon className={cn('mx-auto mb-4', iconSize, iconColor)} />
      )}
      {title && (
        <Typography variant="body-s" className={cn('mb-2', textColor)}>
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body-s" className={cn('mb-4', textColor)}>
          {description}
        </Typography>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
