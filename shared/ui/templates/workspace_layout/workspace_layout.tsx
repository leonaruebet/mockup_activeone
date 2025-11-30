"use client";

/**
 * Workspace Layout Template
 * Reusable template for workspace pages with sidebar, main content area, and page title
 *
 * @description
 * Provides a consistent layout structure for all workspace pages:
 * - Fixed resizable sidebar (via ResizableWorkspaceLayout)
 * - Main content area with glassmorphism background layer
 * - Inner white container for content with consistent spacing
 * - Optional page title + actions section
 * - 100% CSS compatibility with existing workspace implementation
 * - Dynamic height calculation to fill available viewport space
 *
 * @example
 * // Basic usage with title and subtitle
 * <WorkspaceLayout
 *   title="Dashboard"
 *   subtitle="Welcome to your workspace"
 *   organizationId={org.id}
 *   userTier="plus"
 * >
 *   <YourContent />
 * </WorkspaceLayout>
 *
 * @example
 * // Full-width content without white container (e.g., for pricing page)
 * <WorkspaceLayout
 *   title="Pricing"
 *   subtitle="Choose your plan"
 *   showWhiteContainer={false}
 *   organizationId={org.id}
 *   userTier="free"
 * >
 *   <PricingCards />
 * </WorkspaceLayout>
 *
 * @example
 * // With header actions (buttons, filters, etc.)
 * <WorkspaceLayout
 *   title="Projects"
 *   subtitle="Manage your projects"
 *   headerActions={
 *     <Button onClick={createProject}>Create Project</Button>
 *   }
 * >
 *   <ProjectList />
 * </WorkspaceLayout>
 *
 * @example
 * // Hide title section entirely
 * <WorkspaceLayout
 *   showTitle={false}
 *   organizationId={org.id}
 * >
 *   <CustomHeader />
 *   <Content />
 * </WorkspaceLayout>
 */

import * as React from 'react';
import { ResizableWorkspaceLayout } from '../resizable_workspace_layout';
import { GlassPanel } from '../glass_panel';
import { Typography } from '../../atoms/typography/typography';
import { cn } from '../../utils/utils';

export interface WorkspaceLayoutProps {
  /** Page title displayed at the top of the main content area */
  title?: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Main content to be rendered in the workspace */
  children: React.ReactNode;
  /** Additional className for the main content wrapper */
  className?: string;
  /** Organization ID for workspace sidebar (optional) */
  organizationId?: string;
  /** User tier from organization (free | plus | pro | enterprise) */
  userTier?: 'free' | 'plus' | 'pro' | 'enterprise';
  /** Organization name */
  orgName?: string;
  /** Custom header actions to display alongside the title */
  headerActions?: React.ReactNode;
  /** Whether to show the title section (default: true) */
  showTitle?: boolean;
  /** Whether to show the white container layer (default: true) - Set to false for full-width content */
  showWhiteContainer?: boolean;
  /** Whether to show topbar (default: false) - Set to true for project pages */
  showTopbar?: boolean;
  /** Whether to show company logo in topbar (default: true) */
  showLogo?: boolean;
  /** Project name to display in topbar breadcrumb (extracted from title if not provided) */
  projectName?: string;
  /** Project ID for topbar breadcrumb navigation */
  projectId?: string;
  /** Optional GlassPanel props to customize the content container (advanced) */
  panelProps?: Omit<React.ComponentProps<typeof GlassPanel>, 'children' | 'title' | 'subtitle' | 'headerActions' | 'showHeader' | 'showWhiteContainer' | 'className'>;
  /** Array of user roles for admin access check */
  userRoles?: string[];
  /** Lock sidebar in collapsed mode (for public pages) - disables toggle button */
  sidebarLockedCollapsed?: boolean;
  /** Custom logo URL (for public pages) - when provided, logo becomes clickable and navigates to this URL */
  logoUrl?: string;
  /** Custom navigation items for sidebar (for public pages with custom navigation) */
  customNavigationItems?: Array<{
    id: string;
    label: string;
    href: string;
    icon: any;
  }>;
  /** Custom mobile bottom navigation items (for public pages with custom navigation) */
  customBottomNavItems?: Array<{
    id: string;
    label: string;
    href: string;
    icon: any;
  }>;
  /** When true, skip rendering the outer ResizableWorkspaceLayout (used when parent already provides it) */
  use_existing_layout?: boolean;
  /** Whether to show border line under header title/subtitle (default: false) */
  showHeaderBorder?: boolean;
}

/**
 * Main workspace layout component
 * Wraps content with ResizableWorkspaceLayout and provides consistent page structure
 * Dynamically calculates min-height to fill viewport without hardcoded values
 */
export function WorkspaceLayout({
  title,
  subtitle,
  children,
  className = '',
  organizationId,
  userTier,
  orgName,
  headerActions,
  showTitle = true,
  showWhiteContainer = true,
  showTopbar = false,
  showLogo = false,
  projectName,
  projectId,
  panelProps,
  userRoles = [],
  sidebarLockedCollapsed = false,
  logoUrl,
  customNavigationItems,
  customBottomNavItems,
  use_existing_layout = false,
  showHeaderBorder = false,
}: WorkspaceLayoutProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Default to subtracting only the top padding (32px) so SSR render
  // already appears nearly flush before client-side recalculation.
  const [minHeight, setMinHeight] = React.useState<string>('calc(100vh - 32px)');

  // Extract project name from title if not explicitly provided
  // Title format is usually "{ProjectName} - {PageDescription}"
  const extractedProjectName = React.useMemo(() => {
    if (projectName) return projectName;
    if (!title) return undefined;

    // If title contains " - ", extract the first part as project name
    const parts = title.split(' - ');
    return parts.length > 1 ? parts[0] : title;
  }, [projectName, title]);

  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[WorkspaceLayout] mounted', { time: new Date().toISOString() });

    /**
     * Dynamically calculate the min-height based on viewport and parent padding
     * This ensures the white container fills to the bottom without hardcoded values
     */
    const calculateHeight = () => {
      if (containerRef.current) {
        const parentElement = containerRef.current.parentElement;
        if (parentElement) {
          const parentStyles = window.getComputedStyle(parentElement);
          const paddingTop = parseFloat(parentStyles.paddingTop) || 0;
          const paddingBottom = parseFloat(parentStyles.paddingBottom) || 0;
          const totalPadding = paddingTop + paddingBottom;

          // Calculate min-height: 100vh minus total vertical padding
          const calculatedHeight = `calc(100vh - ${totalPadding}px)`;
          setMinHeight(calculatedHeight);

          // eslint-disable-next-line no-console
          console.debug('[WorkspaceLayout] Height calculated', {
            paddingTop,
            paddingBottom,
            totalPadding,
            calculatedHeight,
            time: new Date().toISOString()
          });
        }
      }
    };

    // Calculate on mount
    calculateHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
      // eslint-disable-next-line no-console
      console.debug('[WorkspaceLayout] unmounted', { time: new Date().toISOString() });
    };
  }, []);

  const panel = (
    <GlassPanel
      ref={containerRef}
      className={cn("flex-1 h-full", className)}
      style={{ minHeight }}
      showHeader={showTitle}
      title={title}
      subtitle={subtitle}
      headerActions={headerActions}
      showWhiteContainer={showWhiteContainer}
      showHeaderBorder={showHeaderBorder}
      shape="rounded_top_only"
      glass={true}
      elevation="none"
      {...panelProps}
    >
      {children}
    </GlassPanel>
  );

  if (use_existing_layout) {
    return panel;
  }

  return (
    <ResizableWorkspaceLayout
      organizationId={organizationId}
      userTier={userTier}
      orgName={orgName}
      showTopbar={showTopbar}
      showLogo={showLogo}
      projectName={extractedProjectName}
      projectId={projectId}
      userRoles={userRoles}
      sidebarLockedCollapsed={sidebarLockedCollapsed}
      logoUrl={logoUrl}
      customNavigationItems={customNavigationItems}
      customBottomNavItems={customBottomNavItems}
    >
      {/* Glass panel container with enhanced glassmorphism */}
      {panel}
    </ResizableWorkspaceLayout>
  );
}

/**
 * Workspace Content Section
 * Helper component for organizing content sections within the workspace page
 */
export interface WorkspaceContentSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Section content */
  children: React.ReactNode;
  /** Additional className for the section */
  className?: string;
  /** Actions to display in the section header */
  actions?: React.ReactNode;
}

export function WorkspaceContentSection({
  title,
  description,
  children,
  className = '',
  actions,
}: WorkspaceContentSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title && (
              <Typography variant="heading-m" className="text-xl font-semibold">
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="body-m" className="text-sm text-muted-foreground">
                {description}
              </Typography>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

export default WorkspaceLayout;
