/**
 * use_indexing_status Hook
 * Purpose: Centralized RAG indexing status management
 * Location: shared/ui/hooks/use_indexing_status.ts
 *
 * Usage: Replace duplicated indexing status logic
 * Example:
 *   import { use_indexing_status } from '@shared/ui/hooks'
 *   const { status, isIndexing, triggerIndexing, resetStatus } = use_indexing_status();
 *
 * Changelog:
 * - 2025-10-26: Initial extraction from 3 files with identical indexing patterns
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Indexing status types
 */
export type IndexingStatus = 'idle' | 'indexing' | 'success' | 'error';

/**
 * Indexing status hook options
 */
export interface IndexingStatusOptions {
  /** Auto-reset duration in ms (default: 5000) */
  autoResetDuration?: number;
  /** Callback when indexing starts */
  onStart?: () => void;
  /** Callback when indexing succeeds */
  onSuccess?: () => void;
  /** Callback when indexing fails */
  onError?: (error: Error) => void;
}

/**
 * Indexing status hook
 * Purpose: Manage RAG indexing status with auto-reset and callbacks
 *
 * Features:
 * - Status state machine (idle → indexing → success/error → idle)
 * - Auto-reset after success/error
 * - Progress tracking
 * - Callback support for lifecycle events
 *
 * @param options - Configuration options
 * @returns Indexing status state and control functions
 *
 * @example
 * ```tsx
 * const { status, isIndexing, triggerIndexing, progress } = use_indexing_status({
 *   autoResetDuration: 3000,
 *   onSuccess: () => console.log('Indexing complete!'),
 * });
 *
 * // Trigger indexing
 * await triggerIndexing(async () => {
 *   await api.index.trigger();
 * });
 * ```
 */
export function use_indexing_status(options: IndexingStatusOptions = {}) {
  const {
    autoResetDuration = 5000,
    onStart,
    onSuccess,
    onError,
  } = options;

  console.log('[use_indexing_status] Initializing with options:', {
    autoResetDuration,
  });

  const [status, setStatus] = useState<IndexingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear any pending reset timeout
   * Purpose: Prevent memory leaks and unwanted resets
   */
  const clearResetTimeout = useCallback(() => {
    if (resetTimeoutRef.current) {
      console.log('[use_indexing_status] Clearing reset timeout');
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  /**
   * Reset status to idle
   * Purpose: Manually reset or auto-reset after delay
   *
   * @param delay - Optional delay in ms before reset
   */
  const resetStatus = useCallback((delay?: number) => {
    clearResetTimeout();

    if (delay) {
      console.log(`[use_indexing_status] Scheduling reset in ${delay}ms`);
      resetTimeoutRef.current = setTimeout(() => {
        console.log('[use_indexing_status] Auto-resetting to idle');
        setStatus('idle');
        setProgress(0);
        setErrorMessage(null);
      }, delay);
    } else {
      console.log('[use_indexing_status] Resetting to idle immediately');
      setStatus('idle');
      setProgress(0);
      setErrorMessage(null);
    }
  }, [clearResetTimeout]);

  /**
   * Trigger indexing operation
   * Purpose: Execute indexing with status management
   *
   * @param indexingFn - Async function that performs the indexing
   * @returns Promise that resolves when indexing completes
   *
   * @example
   * ```tsx
   * await triggerIndexing(async () => {
   *   const result = await trpc.rag_indexing.trigger_indexing.mutate({ project_id });
   *   return result;
   * });
   * ```
   */
  const triggerIndexing = useCallback(async <T = any>(
    indexingFn: () => Promise<T>
  ): Promise<T | null> => {
    console.log('[use_indexing_status] Starting indexing operation');
    clearResetTimeout();

    setStatus('indexing');
    setProgress(0);
    setErrorMessage(null);

    if (onStart) {
      console.log('[use_indexing_status] Calling onStart callback');
      onStart();
    }

    try {
      const result = await indexingFn();

      console.log('[use_indexing_status] Indexing succeeded');
      setStatus('success');
      setProgress(100);

      if (onSuccess) {
        console.log('[use_indexing_status] Calling onSuccess callback');
        onSuccess();
      }

      // Auto-reset after success
      resetStatus(autoResetDuration);

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown indexing error');
      console.error('[use_indexing_status] Indexing failed:', err);

      setStatus('error');
      setErrorMessage(err.message);
      setProgress(0);

      if (onError) {
        console.log('[use_indexing_status] Calling onError callback');
        onError(err);
      }

      // Auto-reset after error
      resetStatus(autoResetDuration);

      return null;
    }
  }, [clearResetTimeout, autoResetDuration, onStart, onSuccess, onError, resetStatus]);

  /**
   * Update progress manually
   * Purpose: For custom progress tracking
   *
   * @param value - Progress value (0-100)
   */
  const updateProgress = useCallback((value: number) => {
    console.log(`[use_indexing_status] Updating progress: ${value}%`);
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[use_indexing_status] Cleaning up');
      clearResetTimeout();
    };
  }, [clearResetTimeout]);

  return {
    // State
    status,
    progress,
    errorMessage,
    isIndexing: status === 'indexing',
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle',

    // Actions
    triggerIndexing,
    resetStatus,
    updateProgress,
  };
}
