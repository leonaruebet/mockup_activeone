/**
 * ProjectCard Component
 * Purpose: Display project information in a card format matching the workspace overview design
 * Location: shared/ui/molecules/project-card/project_card.tsx
 * Updated: 2025-10-12 - Redesigned to match screenshot with folder icon, description, date, and Open button
 * Updated: 2025-10-18 - Added edit/delete action menu
 */

import { Folder, Clock, ArrowRight, MoreVertical, Edit, Trash2, Share2 } from 'lucide-react'
import { cn } from "../../utils"
import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { createScopedLogger } from '../../utils'

const logger = createScopedLogger('ui:project_card')

export type ProjectCardProps = {
  title: string
  subtitle?: string | ReactNode  // Subtitle displayed under title (e.g., price)
  description?: string | null
  lastUpdated?: string
  status?: "In Progress" | "Completed" | "Archived"
  memberCount?: number
  inviteCode?: string
  createdAt?: Date | string
  isSelected?: boolean
  onClick?: () => void
  onEdit?: () => void  // Callback for edit action
  onShare?: () => void  // Callback for share action
  onDelete?: () => void  // Callback for delete action
  href?: string
  className?: string
  children?: ReactNode
  icon?: ReactNode  // Custom icon to replace Folder icon
  iconBgColor?: string  // Custom background color for icon (Tailwind class, e.g., "bg-green-50")
  statusBadge?: ReactNode  // Custom status badge to replace Open button
  footerInfo?: ReactNode  // Custom footer info to replace "Updated" date
}

/**
 * Formats a date string or Date object for display in "Month Day, Year" format
 *
 * @param date - Date string or Date object to format
 * @returns Formatted date string or empty string if no date provided
 */
function formatDate(date?: Date | string): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    logger.error('format_date_error', { error, date });
    return '';
  }
}

export function ProjectCard({
  title,
  subtitle,
  description,
  lastUpdated,
  status,
  memberCount,
  inviteCode,
  createdAt,
  isSelected = false,
  onClick,
  onEdit,
  onShare,
  onDelete,
  href,
  className,
  children,
  icon,
  iconBgColor = "bg-orange-50",
  statusBadge,
  footerInfo
}: ProjectCardProps) {
  logger.debug('project_card_render_enter', { title, has_href: Boolean(href) });

  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const displayDate = formatDate(createdAt);
  const displayDescription = description || 'No description provided';

  const cardContent = (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-2xl bg-white p-6 transition-all duration-200",
        "border border-noble-black-100 hover:shadow-lg hover:border-noble-black-200",
        "dark:bg-gray-800 dark:border-gray-700",
        isSelected && "border-primary-600 bg-orange-50/30 shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={() => {
        if (onClick) {
          logger.info('project_card_click', { title });
          onClick();
        }
      }}
    >
      {/* Actions Menu Button - Top Right Corner */}
      {(onEdit || onShare || onDelete) && (
        <div className="absolute top-4 right-4">
          <button
            className={cn(
              "flex items-center justify-center rounded-lg p-2 text-noble-black-300",
              "transition-all duration-200 hover:bg-noble-black-100 hover:text-noble-black-400",
              "dark:hover:bg-gray-700 dark:hover:text-gray-300"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowActionsMenu(!showActionsMenu);
              logger.info('project_card_actions_menu_toggle', { title, show: !showActionsMenu });
            }}
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {/* Dropdown Menu */}
          {showActionsMenu && (
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(false);
                }}
              />

              <div className="absolute right-0 top-12 z-20 w-48 rounded-lg border border-noble-black-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {onEdit && (
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-noble-black-400",
                      "transition-colors hover:bg-whitesmoke-100 dark:text-gray-300 dark:hover:bg-gray-700",
                      !onShare && !onDelete ? "rounded-lg" : "rounded-t-lg"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowActionsMenu(false);
                      logger.info('project_card_edit_click', { title });
                      onEdit();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Project
                  </button>
                )}
                {onShare && (
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-noble-black-400",
                      "transition-colors hover:bg-whitesmoke-100 dark:text-gray-300 dark:hover:bg-gray-700",
                      !onEdit && !onDelete ? "rounded-lg" : !onEdit ? "rounded-t-lg" : !onDelete ? "rounded-b-lg" : ""
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowActionsMenu(false);
                      logger.info('project_card_share_click', { title });
                      onShare();
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Share Project
                  </button>
                )}
                {onDelete && (
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600",
                      "transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
                      "rounded-b-lg"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowActionsMenu(false);
                      logger.info('project_card_delete_click', { title });
                      onDelete();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Project
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Status Badge - Bottom Right */}
      {statusBadge && (
        <div className="absolute bottom-6 right-6">
          {statusBadge}
        </div>
      )}

      {/* Folder Icon */}
      <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-full", iconBgColor)}>
        {icon || <Folder className="h-6 w-6 text-primary-600" />}
      </div>

      {/* Title and Subtitle (e.g., price) */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-semibold text-noble-black-500 dark:text-white line-clamp-1 flex-1 pr-20">
          {title}
        </h3>
        {subtitle && (
          <div className="flex-shrink-0">
            {typeof subtitle === 'string' ? (
              <p className="text-sm text-noble-black-400">{subtitle}</p>
            ) : (
              subtitle
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mb-4 flex-grow text-sm text-noble-black-300 dark:text-gray-400 line-clamp-2">
        {displayDescription}
      </p>

      {/* Footer: Info and Open Button */}
      <div className="mt-auto flex items-center justify-between pt-4">
        {/* Footer Info (Custom or Updated Date) */}
        {footerInfo || (
          <div className="flex items-center gap-1.5 text-xs text-noble-black-300 dark:text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated</span>
            <span className="font-medium text-noble-black-400">{displayDate || 'Recently'}</span>
          </div>
        )}

        {/* Open Button (only if no statusBadge provided) */}
        {!statusBadge && (
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white",
              "transition-all duration-200 hover:bg-primary-700 hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
            )}
            onClick={(e) => {
              if (!href) {
                e.stopPropagation();
                logger.info('project_card_open_click', { title });
              }
            }}
          >
            Open
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {children}
    </div>
  )

  logger.debug('project_card_render_exit', { title });

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
