/**
 * UserListItem Component
 * Purpose: Reusable user list item with avatar, name, badge, and timestamp
 * Location: shared/ui/molecules/user_list_item/user_list_item.tsx
 */

import * as React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { Button } from '../../atoms/button';
import { Typography } from '../../atoms/typography';
import { Tag } from '../../atoms/tag';
import { cn } from '../../utils';

export interface UserListItemProps {
  /** User ID (unique identifier) */
  user_id: string;
  /** Display name */
  display_name?: string;
  /** Profile picture URL */
  profile_picture_url?: string;
  /** Badge count (e.g., message count) */
  badge_count?: number;
  /** Timestamp to display */
  timestamp?: string | Date;
  /** Whether this item is selected */
  is_selected?: boolean;
  /** Click handler */
  onClick?: (user_id: string) => void;
  /** Additional className for the button */
  className?: string;
}

/**
 * UserListItem component
 * Displays a user in a list with avatar, name, badge, and timestamp
 */
export function UserListItem({
  user_id,
  display_name,
  profile_picture_url,
  badge_count,
  timestamp,
  is_selected = false,
  onClick,
  className,
}: UserListItemProps) {
  const formatted_timestamp = timestamp
    ? new Date(timestamp).toLocaleDateString()
    : '';

  const handleClick = () => {
    if (onClick) {
      onClick(user_id);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={cn(
        'w-full justify-start text-left p-3 h-auto',
        is_selected
          ? 'bg-primary-50 border-2 border-primary-600'
          : 'bg-whitesmoke-100 border-2 border-transparent hover:border-noble-black-200',
        className
      )}
    >
      <div className="flex items-start gap-3 w-full">
        {/* Avatar */}
        {profile_picture_url ? (
          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-noble-black-100">
            <Image
              src={profile_picture_url}
              alt={display_name || user_id}
              width={40}
              height={40}
              className="object-cover"
              unoptimized={false}
            />
          </div>
        ) : (
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              is_selected ? 'bg-primary-600' : 'bg-noble-black-300'
            )}
          >
            <User className="h-5 w-5 text-white" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Typography
              variant="body-s"
              className={cn(
                'font-semibold truncate',
                is_selected ? 'text-primary-700' : 'text-noble-black-500'
              )}
            >
              {display_name || user_id}
            </Typography>
            {badge_count !== undefined && (
              <Tag
                variant={is_selected ? 'happy-orange' : 'default'}
                className="text-xs shrink-0"
              >
                {badge_count}
              </Tag>
            )}
          </div>
          {formatted_timestamp && (
            <Typography
              variant="body-s"
              className={cn(
                'text-xs',
                is_selected ? 'text-primary-500' : 'text-noble-black-400'
              )}
            >
              {formatted_timestamp}
            </Typography>
          )}
        </div>
      </div>
    </Button>
  );
}
