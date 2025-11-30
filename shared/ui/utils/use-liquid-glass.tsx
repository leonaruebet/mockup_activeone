'use client';

import { useMemo } from 'react';
import { CSSProperties } from 'react';
import { colorTokens } from '../design-system/tokens/colors';

interface UseLiquidGlassOptions {
  blur?: number;
  brightness?: number;
  borderRadius?: string;
  withNobleGradient?: boolean;
  withSpecularHighlights?: boolean;
  enableHoverGlow?: boolean;
  glassOpacity?: number;
  useWhiteBackground?: boolean; // Use pure white instead of whitesmoke
}

interface LiquidGlassStyles {
  containerStyles: CSSProperties;
  beforePseudo: string;
  afterPseudo: string;
}

/**
 * useLiquidGlass Hook
 * Returns CSS properties for authentic liquid glass effects without DOM wrappers
 * 
 * Usage:
 * const glassStyles = useLiquidGlass({ withNobleGradient: true, blur: 10 });
 * <div style={glassStyles} className="your-existing-classes">content</div>
 * 
 * Note: For hover effects, use CSS classes or styled-components since inline styles
 * don't support pseudo-selectors like :hover
 */
export function useLiquidGlass({
  blur = 10,
  brightness = 0.95,
  borderRadius = '16px',
  withNobleGradient = false,
  withSpecularHighlights = true,
  enableHoverGlow = true,
  glassOpacity = 0.25,
  useWhiteBackground = false,
}: UseLiquidGlassOptions = {}): CSSProperties {
  
  // Design system colors from tokens
  const whitesmoke100 = colorTokens.bg.DEFAULT;
  const pureWhite = colorTokens.bg.neutral;
  const nobleBlack200 = colorTokens['noble-black'][200];
  const nobleBlack300 = colorTokens['noble-black'][300];
  
  // Choose background color based on option
  const backgroundColor = useWhiteBackground ? pureWhite : whitesmoke100;
  
  const glassStyles = useMemo((): CSSProperties => {
    // Base glass background layers
    const backgroundLayers = [
      // Specular highlights layer
      withSpecularHighlights ? `linear-gradient(45deg, 
        rgba(255, 255, 255, 0.3) 0%, 
        transparent 30%, 
        transparent 70%, 
        rgba(255, 255, 255, 0.1) 100%
      )` : '',
      
      // Main glass gradient using selected background color from design system
      `linear-gradient(135deg, 
        ${backgroundColor}${Math.round(glassOpacity * 255).toString(16).padStart(2, '0')} 0%, 
        ${backgroundColor}${Math.round(glassOpacity * 255).toString(16).padStart(2, '0')} 50%, 
        ${backgroundColor}${Math.round(glassOpacity * 255).toString(16).padStart(2, '0')} 100%
      )`,
      
      // Noble black gradient orbs using design system colors with reduced opacity (if enabled)
      withNobleGradient ? `
        radial-gradient(circle 300px at -100px -100px, ${nobleBlack300}0d 0%, transparent 50%),
        radial-gradient(circle 300px at calc(100% + 150px) -150px, ${nobleBlack200}05 0%, transparent 50%),
        radial-gradient(circle 300px at -150px calc(100% + 150px), ${nobleBlack200}05 0%, transparent 50%),
        radial-gradient(circle 300px at calc(100% + 100px) calc(100% + 100px), ${nobleBlack300}0d 0%, transparent 50%)
      ` : '',
    ].filter(Boolean).join(', ');

    return {
      position: 'relative',
      borderRadius,
      background: backgroundLayers,
      backdropFilter: `blur(${blur}px) saturate(1.0) brightness(${brightness})`,
      WebkitBackdropFilter: `blur(${blur}px) saturate(1.0) brightness(${brightness})`,
      
      // Glass borders with variable transparency (bottom-left 100% transparent, top-right 5%)
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(255, 255, 255, 0)',
      borderLeft: '1px solid rgba(255, 255, 255, 0)',
      
      // Orange shadow as requested using design system primary colors
      boxShadow: withSpecularHighlights ? `
        inset 1px 1px 2px rgba(255, 255, 255, 0.4),
        inset 0 0 8px rgba(255, 255, 255, 0.2),
        0 8px 32px hsl(24 100% 58% / 0.08),
        0 2px 8px hsl(24 100% 58% / 0.05)
      ` : `
        0 8px 32px hsl(24 100% 58% / 0.08),
        0 2px 8px hsl(24 100% 58% / 0.05)
      `,
      
      // No transitions/motion effects
      // Proper box sizing for accurate dimensions
      boxSizing: 'border-box' as const,
      
      // Note: Hover effects need to be handled via CSS classes or styled-components
      // Inline styles don't support pseudo-selectors like :hover
    };
  }, [blur, brightness, borderRadius, withNobleGradient, withSpecularHighlights, enableHoverGlow, glassOpacity]);

  return glassStyles;
}

/**
 * useLiquidGlassWithSVG Hook
 * Includes SVG displacement filter support for liquid distortion
 */
export function useLiquidGlassWithSVG(options: UseLiquidGlassOptions = {}) {
  const baseStyles = useLiquidGlass(options);
  
  const stylesWithSVG = useMemo((): CSSProperties => ({
    ...baseStyles,
    filter: `${baseStyles.filter || ''} url(#liquidGlassDisplacementFilter)`.trim(),
  }), [baseStyles]);
  
  // SVG Filter component to be used alongside the styles
  const SVGFilter = () => (
    <svg style={{ display: 'none' }}>
      <filter id="liquidGlassDisplacementFilter">
        <feTurbulence
          type="turbulence"
          baseFrequency="0.01"
          numOctaves="2"
          result="turbulence"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="turbulence"
          scale="200"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
  
  return {
    styles: stylesWithSVG,
    SVGFilter,
  };
}

/**
 * Utility function to generate CSS class names for liquid glass
 * Useful for dynamic styling or external CSS generation
 */
export function getLiquidGlassClassName(options: UseLiquidGlassOptions = {}): string {
  const hash = btoa(JSON.stringify(options)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
  return `liquid-glass-${hash}`;
}

export default useLiquidGlass;