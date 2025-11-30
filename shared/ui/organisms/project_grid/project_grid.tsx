/**
 * Project Grid Organism - Atomic Design
 * Responsive project display with grid/list layouts, pagination, and loading states
 */
'use client'

import React from 'react'
import { Grid3X3, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils'
import { Button } from '../../atoms/button'
import { Skeleton } from '../../atoms/skeleton'

export interface ProjectGridProps {
  projects: any[]
  totalProjects: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  onProjectEdit?: (project: any) => void
  onProjectDelete?: (project: any) => void
  onProjectView?: (project: any) => void
  onProjectDuplicate?: (project: any) => void
  onProjectClick?: (project: any) => void
  showActions?: boolean
  showProgress?: boolean
  showTeamMembers?: boolean
  showBudget?: boolean
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateAction?: React.ReactNode
  renderProjectCard?: (project: any, props: any) => React.ReactNode
}

export function ProjectGrid({
  projects,
  totalProjects,
  viewMode,
  onViewModeChange,
  currentPage,
  pageSize,
  onPageChange,
  isLoading = false,
  onProjectEdit,
  onProjectDelete,
  onProjectView,
  onProjectDuplicate,
  onProjectClick,
  showActions = true,
  showProgress = true,
  showTeamMembers = true,
  showBudget = false,
  emptyStateTitle = "No projects found",
  emptyStateDescription = "Create your first project to get started",
  emptyStateAction,
  renderProjectCard
}: ProjectGridProps) {
  const totalPages = Math.ceil(totalProjects / pageSize)
  const hasProjects = projects.length > 0
  const showPagination = totalPages > 1

  const handleViewModeToggle = (mode: 'grid' | 'list') => {
    onViewModeChange(mode)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  // Default project card renderer
  const defaultProjectCard = (project: any) => (
    <div
      key={project.id}
      className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onProjectClick?.(project)}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-foreground truncate">
            {project.name || project.title || 'Untitled Project'}
          </h3>
          {showActions && (
            <div className="flex gap-1">
              {onProjectEdit && (
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onProjectEdit(project) }}>
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || 'No description available'}
        </p>
        {showProgress && project.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'No date'}</span>
          <span>{project.status || 'Active'}</span>
        </div>
      </div>
    </div>
  )

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className={viewMode === 'grid'
          ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          : "space-y-4"
        }>
          {Array.from({ length: pageSize }).map((_, index) => (
            <div key={index} className="rounded-lg border bg-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-6" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (!hasProjects && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="rounded-full bg-muted p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Grid3X3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {emptyStateTitle}
          </h3>
          <p className="text-muted-foreground mb-6">
            {emptyStateDescription}
          </p>
          {emptyStateAction}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {projects.length} of {totalProjects} projects
        </div>

        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeToggle('grid')}
            className="h-7 px-2"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeToggle('list')}
            className="h-7 px-2"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects display */}
      <div className={cn(
        viewMode === 'grid'
          ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          : "space-y-4"
      )}>
        {projects.map((project) =>
          renderProjectCard
            ? renderProjectCard(project, {
                onEdit: onProjectEdit,
                onDelete: onProjectDelete,
                onView: onProjectView,
                onDuplicate: onProjectDuplicate,
                onClick: onProjectClick,
                showActions,
                showProgress,
                showTeamMembers,
                showBudget,
                compact: viewMode === 'list'
              })
            : defaultProjectCard(project)
        )}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { ProjectGrid as default }
