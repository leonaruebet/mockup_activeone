"use client";

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Typography } from '../../atoms/typography/typography';
import { cn } from '../../utils/utils';

const glassPanelVariants = cva("relative overflow-hidden h-full max-h-full", {
  variants: {
    shape: {
      rounded_top: "rounded-t-3xl rounded-b-xl",
      rounded_top_only: "rounded-t-3xl rounded-b-none",
      rounded: "rounded-xl",
      square: "rounded-none",
    },
    elevation: {
      none: "shadow-none",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
    },
    bordered: {
      true: "border border-noble-black-200",
      false: "border-0",
    },
    glass: {
      true: "bg-white backdrop-blur-xl shadow-l border-noble-black-200",
      false: "bg-white",
    },
    padding: {
      none: "p-0",
      sm: "p-4 md:p-6",
      md: "p-6 md:p-8",
      lg: "p-8 md:p-10",
    },
  },
  defaultVariants: {
    shape: "rounded_top",
    elevation: "sm",
    bordered: true,
    glass: true,
    padding: "md",
  },
});

export interface GlassPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassPanelVariants> {
  /** Optional title text rendered in a header section */
  title?: string;
  /** Optional subtitle under the title */
  subtitle?: string;
  /** Optional header actions rendered to the right of the title */
  headerActions?: React.ReactNode;
  /** Optional content to render below title/subtitle in the header area (e.g., tabs) */
  headerExtension?: React.ReactNode;
  /** Whether to render the header if any header props are present (default: true) */
  showHeader?: boolean;
  /** Additional className for inner content wrapper beneath header */
  contentClassName?: string;
  /** Vertical spacing between header and content (default: md) */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether to show the white container layer (default: true) */
  showWhiteContainer?: boolean;
  /** Whether to show border line under header title/subtitle (default: false) */
  showHeaderBorder?: boolean;
}

/**
 * GlassPanel
 * Reusable glassmorphic card with variants for shape, elevation, border, padding, and spacing.
 * Designed to match workspace main content styling (rounded top corners by default).
 */
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  (
    {
      className,
      shape,
      elevation,
      bordered,
      glass,
      padding,
      spacing = 'md',
      title,
      subtitle,
      headerActions,
      headerExtension,
      showHeader = true,
      contentClassName,
      showWhiteContainer = true,
      showHeaderBorder = false,
      children,
      ...props
    },
    ref,
  ) => {
    // Simple lifecycle logs for traceability (non-blocking)
    React.useEffect(() => {
      // eslint-disable-next-line no-console
      console.debug('[GlassPanel] mounted', { time: new Date().toISOString() });
      return () => {
        // eslint-disable-next-line no-console
        console.debug('[GlassPanel] unmounted', { time: new Date().toISOString() });
      };
    }, []);

    const hasHeader = showHeader && (title || subtitle || headerActions);

    React.useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[GlassPanel] layout state', {
          hasHeader,
          showWhiteContainer,
          spacing,
          time: new Date().toISOString(),
        });
      }
    }, [hasHeader, showWhiteContainer, spacing]);

    const containerClass = cn(
      glassPanelVariants({ shape, elevation, bordered, glass, padding }),
      className,
    );

    const spacingMap: Record<NonNullable<GlassPanelProps['spacing']>, string> = {
      none: 'space-y-0',
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
    };

    return (
      <div
        ref={ref}
        className={cn(containerClass, "flex w-full flex-col min-h-0")}
        {...props}
      >
        {/* Header outside white container */}
        {hasHeader && (
          <div className="py-0.5">
            <div className={cn(
              "flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between",
              showHeaderBorder && "border-b border-noble-black-200 pb-4"
            )}>
              <div className="space-y-0.5">
                {title && (
                  <Typography variant="heading-l" weight="medium" className="text-lg tracking-tight">
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body-s" className="text-muted-foreground text-xs">
                    {subtitle}
                  </Typography>
                )}
              </div>
              {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
            </div>
            {/* Header Extension (e.g., tabs) */}
            {headerExtension && <div className="mt-4">{headerExtension}</div>}
          </div>
        )}

        {/* White container layer that fills remaining area - Fixed height, content scrolls */}
        {showWhiteContainer ? (
          <div
            className={cn(
              "flex w-full flex-1 min-h-0 flex-col px-2 pb-6",
              hasHeader ? "" : "pt-6",
            )}
          >
            <div
              className={cn(
                "flex w-full flex-1 min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm",
                hasHeader ? "mt-6" : "mt-0",
              )}
            >
              {/* Content layer with original spacing - Scrollable content inside fixed container */}
              <div
                className={cn(
                  spacingMap[spacing],
                  "flex-1 min-h-0 overflow-x-hidden overflow-y-auto pt-3 px-6 pb-6 md:pt-4 md:px-8 md:pb-8",
                  contentClassName,
                )}
              >
                {/* Content */}
                {children}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 w-full overflow-auto">
            {/* Content without white container */}
            {children}
          </div>
        )}
      </div>
    );
  },
);

GlassPanel.displayName = 'GlassPanel';

export { glassPanelVariants };
