'use client';

import React from 'react';
import { colorTokens } from '../../design-system/tokens/colors';

/**
 * Gradient Background Component
 * Uses design system color tokens for consistency
 * Creates subtle light grey gradient effect with soft diffusion
 */
export const GradientBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: -1,
        backgroundColor: colorTokens.bg['light-grey'],
        background: `
          radial-gradient(circle 650px at 30% 15%, ${colorTokens['noble-black'][100]}40 0%, transparent 70%),
          radial-gradient(circle 400px at 80% 25%, ${colorTokens['noble-black'][200]}30 0%, transparent 70%),
          radial-gradient(circle 420px at 15% 80%, ${colorTokens['noble-black'][100]}35 0%, transparent 70%),
          radial-gradient(circle 480px at 85% 75%, ${colorTokens['noble-black'][200]}38 0%, transparent 70%)
        `,
        filter: 'blur(8px)',
        backdropFilter: 'blur(2px)'
      }}
    />
  );
};