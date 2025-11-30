"use client";

/**
 * Sidebar glass background styles
 * Transparent sidebar with subtle glass effect
 * No white background - fully transparent
 */
export function useSidebarGlass(): React.CSSProperties {
  return {
    position: 'relative',
    background: 'transparent',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    boxShadow: 'none',
    boxSizing: 'border-box'
  } as React.CSSProperties;
}

