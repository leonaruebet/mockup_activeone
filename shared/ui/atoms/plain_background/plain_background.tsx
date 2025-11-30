'use client';

import React from 'react';
import { colorTokens } from '../../design-system/tokens/colors';

/**
 * Plain Background Component
 * Simple solid background without gradients
 * Uses design system color tokens for consistency
 */
export const PlainBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: -1,
        backgroundColor: colorTokens.bg.DEFAULT,
      }}
    />
  );
};
