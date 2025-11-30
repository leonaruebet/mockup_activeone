'use client';

import { useState, useEffect } from 'react';

// Breakpoint constants for responsive design
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const DESKTOP_BREAKPOINT = 1440;
const LARGE_DESKTOP_BREAKPOINT = 1920;

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'large' | 'xlarge';

export interface ResponsiveSize {
  screenSize: ScreenSize;
  width: number;
  height: number;
  scale: number;
  isDesktop: boolean;
  isMobile: boolean;
}

export function useResponsiveSize(): ResponsiveSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });

      let size: ScreenSize;
      if (width < MOBILE_BREAKPOINT) size = 'mobile';
      else if (width < TABLET_BREAKPOINT) size = 'tablet';
      else if (width < DESKTOP_BREAKPOINT) size = 'desktop';
      else if (width < LARGE_DESKTOP_BREAKPOINT) size = 'large';
      else size = 'xlarge';

      setScreenSize(size);
    }

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const scale = {
    mobile: 0.8,
    tablet: 0.9,
    desktop: 1.0,
    large: 1.1,
    xlarge: 1.2
  }[screenSize];

  return {
    screenSize,
    width: windowSize.width,
    height: windowSize.height,
    scale,
    isDesktop: screenSize === 'desktop' || screenSize === 'large' || screenSize === 'xlarge',
    isMobile: screenSize === 'mobile'
  };
}

export function getResponsiveChartSize(
  baseWidth: number, 
  baseHeight: number, 
  screenSize: ScreenSize,
  compact?: boolean
): { width: number; height: number } {
  const multipliers = {
    mobile: { width: 0.9, height: 0.8 },
    tablet: { width: 0.95, height: 0.9 },
    desktop: { width: 1.0, height: 1.0 },
    large: { width: 1.1, height: 1.1 },
    xlarge: { width: 1.2, height: 1.2 }
  };

  // For compact mode, use smaller base sizes for better grid fitting
  if (compact) {
    baseWidth = Math.min(baseWidth * 0.85, 500);
    baseHeight = Math.min(baseHeight * 0.8, 350);
  }

  const multiplier = multipliers[screenSize];
  return {
    width: Math.round(baseWidth * multiplier.width),
    height: Math.round(baseHeight * multiplier.height)
  };
}