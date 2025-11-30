'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '../../utils';

// Loading spinner with timeout detection
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  timeout?: number; // milliseconds
  onTimeout?: () => void;
}

export function LoadingSpinner({ 
  size = 'md', 
  text,
  timeout = 30000,
  onTimeout 
}: LoadingSpinnerProps) {
  const [isTimeout, setIsTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeout(true);
      onTimeout?.();
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
      
      {text && (
        <p className="text-sm text-gray-600">
          {isTimeout ? 'This is taking longer than expected...' : text}
        </p>
      )}
      
      {isTimeout && (
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-primary-600 hover:text-primary-700 underline"
        >
          Reload page
        </button>
      )}
    </div>
  );
}