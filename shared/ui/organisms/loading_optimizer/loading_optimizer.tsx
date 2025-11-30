'use client'

// Local logger fallback
const uiLogger = {
  codeChange: (file: string, action: string, description: string) => console.log("[" + new Date().toISOString() + "] UI CHANGE " + file + " - " + action + ": " + description),
  functionEntry: (name: string, params?: any) => console.log("[" + new Date().toISOString() + "] UI ENTER " + name, params || ""),
  functionExit: (name: string, result?: any) => console.log("[" + new Date().toISOString() + "] UI EXIT " + name, result || ""),
  info: (message: string, context?: any) => console.log('[' + new Date().toISOString() + '] UI ' + message, context || ''),
  error: (message: string, context?: any) => console.error('[' + new Date().toISOString() + '] UI ERROR ' + message, context || ''),
  warn: (message: string, context?: any) => console.warn('[' + new Date().toISOString() + '] UI WARN ' + message, context || ''),
  debug: (message: string, context?: any) => console.debug('[' + new Date().toISOString() + '] UI DEBUG ' + message, context || '')
}

/**
 * Loading Optimizer Component
 * Advanced loading states with skeleton UI, progressive loading, and performance monitoring
 * @author Senior Developer (29 years experience)
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Loader2, RefreshCw, AlertCircle, TrendingUp, Clock } from 'lucide-react'

uiLogger.info(`[${new Date().toISOString()}]] INIT LoadingOptimizer.tsx – Advanced loading optimization component`)

/**
 * Loading State Types
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'refreshing'

/**
 * Performance Metrics Interface
 */
interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  cacheHitRate: number
  errorRate: number
  totalRequests: number
}

/**
 * Loading Optimizer Props
 */
interface LoadingOptimizerProps {
  loading: boolean
  error?: string | null
  children: React.ReactNode
  fallback?: React.ReactNode
  skeleton?: React.ReactNode
  showPerformanceMetrics?: boolean
  enableProgressiveLoading?: boolean
  minLoadingTime?: number
  maxLoadingTime?: number
  onLoadingStateChange?: (state: LoadingState) => void
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void
}

/**
 * Skeleton Loading Components
 */
export const ProjectCardSkeleton = () => (
  <div className="animate-pulse bg-card rounded-lg p-l border border-border">
    <div className="flex items-start justify-between mb-s">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-16"></div>
    </div>
    <div className="space-y-xs">
      <div className="h-3 bg-muted rounded w-full"></div>
      <div className="h-3 bg-muted rounded w-2/3"></div>
    </div>
    <div className="flex items-center justify-between mt-m">
      <div className="flex space-x-xs">
        <div className="h-6 bg-muted rounded w-16"></div>
        <div className="h-6 bg-muted rounded w-20"></div>
      </div>
      <div className="h-4 bg-muted rounded w-24"></div>
    </div>
  </div>
)

export const ProjectListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-l">
    {Array.from({ length: count }, (_, i) => (
      <ProjectCardSkeleton key={i} />
    ))}
  </div>
)

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="animate-pulse">
    <div className="grid grid-cols-4 gap-m p-l border-b border-border">
      {Array.from({ length: cols }, (_, i) => (
        <div key={i} className="h-4 bg-muted rounded"></div>
      ))}
    </div>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-4 gap-m p-l border-b border-border">
        {Array.from({ length: cols }, (_, colIndex) => (
          <div key={colIndex} className="h-4 bg-muted rounded"></div>
        ))}
      </div>
    ))}
  </div>
)

/**
 * Progressive Loading Component
 */
const ProgressiveLoader = ({ 
  stages, 
  currentStage, 
  onStageComplete 
}: { 
  stages: string[]
  currentStage: number
  onStageComplete?: (stage: number) => void
}) => {
  useEffect(() => {
    if (currentStage < stages.length && onStageComplete) {
      const timer = setTimeout(() => {
        onStageComplete(currentStage + 1)
      }, 500) // 500ms per stage

      return () => clearTimeout(timer)
    }
  }, [currentStage, stages.length, onStageComplete])

  return (
    <div className="flex flex-col items-center space-y-m p-xl">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center">
        <p className="text-body-m font-medium text-foreground font-kanit">
          {stages[currentStage] || 'Loading...'}
        </p>
        <div className="flex space-x-xs mt-s">
          {stages.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-8 rounded-full transition-colors duration-300 ${
                index <= currentStage ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Performance Monitor Component
 */
const PerformanceMonitor = ({ metrics }: { metrics: PerformanceMetrics }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-primary text-primary-foreground p-s rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        title="Performance Metrics"
      >
        <TrendingUp className="h-4 w-4" />
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-card border border-border rounded-lg p-m shadow-lg min-w-64">
          <h3 className="text-body-m font-semibold text-foreground font-kanit mb-s">
            Performance Metrics
          </h3>
          <div className="space-y-xs text-body-s font-kanit">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Load Time:</span>
              <span className="text-foreground">{metrics.loadTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Render Time:</span>
              <span className="text-foreground">{metrics.renderTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cache Hit Rate:</span>
              <span className="text-foreground">{metrics.cacheHitRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Error Rate:</span>
              <span className="text-foreground">{metrics.errorRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Requests:</span>
              <span className="text-foreground">{metrics.totalRequests}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Error Boundary Component
 */
const ErrorBoundary = ({ 
  error, 
  onRetry, 
  onClearError 
}: { 
  error: string
  onRetry?: () => void
  onClearError?: () => void
}) => (
  <div className="flex flex-col items-center justify-center p-xl text-center">
    <AlertCircle className="h-12 w-12 text-destructive mb-m" />
    <h3 className="text-heading-s font-semibold text-foreground font-kanit mb-s">
      Something went wrong
    </h3>
    <p className="text-body-m text-muted-foreground font-kanit mb-l max-w-md">
      {error}
    </p>
    <div className="flex space-x-s">
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-xs bg-primary text-primary-foreground px-m py-s rounded-lg hover:bg-primary/90 transition-colors font-kanit"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}
      {onClearError && (
        <button
          onClick={onClearError}
          className="px-m py-s text-muted-foreground hover:text-foreground transition-colors font-kanit"
        >
          Dismiss
        </button>
      )}
    </div>
  </div>
)

/**
 * Main Loading Optimizer Component
 */
export const AdvancedLoadingOptimizer: React.FC<LoadingOptimizerProps> = ({
  loading,
  error,
  children,
  fallback,
  skeleton,
  showPerformanceMetrics = false,
  enableProgressiveLoading = false,
  minLoadingTime = 300,
  maxLoadingTime = 10000,
  onLoadingStateChange,
  onPerformanceUpdate
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [progressiveStage, setProgressiveStage] = useState(0)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    totalRequests: 0
  })

  const loadStartTime = useRef<number>(0)
  const renderStartTime = useRef<number>(0)
  const minLoadingTimer = useRef<NodeJS.Timeout | null>(null)
  const maxLoadingTimer = useRef<NodeJS.Timeout | null>(null)

  // Progressive loading stages
  const progressiveStages = useMemo(() => [
    'Initializing...',
    'Connecting to server...',
    'Loading data...',
    'Processing results...',
    'Finalizing...'
  ], [])

  /**
   * Update loading state and notify parent
   */
  const updateLoadingState = useCallback((newState: LoadingState) => {
    setLoadingState(newState)
    onLoadingStateChange?.(newState)
    
    uiLogger.info(`[${new Date().toISOString()}]] STATE LoadingOptimizer.tsx – loading state changed to: ${newState}`)
  }, [onLoadingStateChange])

  /**
   * Update performance metrics
   */
  const updateMetrics = useCallback((updates: Partial<PerformanceMetrics>) => {
    setMetrics(prev => {
      const newMetrics = { ...prev, ...updates }
      onPerformanceUpdate?.(newMetrics)
      return newMetrics
    })
  }, [onPerformanceUpdate])

  /**
   * Handle loading start
   */
  useEffect(() => {
    if (loading && loadingState !== 'loading') {
      loadStartTime.current = performance.now()
      renderStartTime.current = performance.now()
      
      updateLoadingState('loading')
      setProgressiveStage(0)

      // Minimum loading time to prevent flashing
      minLoadingTimer.current = setTimeout(() => {
        uiLogger.info(`[${new Date().toISOString()}]] TIMING LoadingOptimizer.tsx – minimum loading time reached`)
      }, minLoadingTime)

      // Maximum loading time timeout
      maxLoadingTimer.current = setTimeout(() => {
        uiLogger.warn(`[${new Date().toISOString()}]] TIMEOUT LoadingOptimizer.tsx – maximum loading time exceeded`)
        updateLoadingState('error')
      }, maxLoadingTime)

      return () => {
        if (minLoadingTimer.current) clearTimeout(minLoadingTimer.current)
        if (maxLoadingTimer.current) clearTimeout(maxLoadingTimer.current)
      }
    }
  }, [loading, loadingState, minLoadingTime, maxLoadingTime, updateLoadingState])

  /**
   * Handle loading completion
   */
  useEffect(() => {
    if (!loading && loadingState === 'loading') {
      const loadTime = performance.now() - loadStartTime.current
      const renderTime = performance.now() - renderStartTime.current

      updateMetrics({
        loadTime,
        renderTime,
        totalRequests: metrics.totalRequests + 1
      })

      if (error) {
        updateLoadingState('error')
        updateMetrics({
          errorRate: ((metrics.totalRequests * metrics.errorRate + 100) / (metrics.totalRequests + 1))
        })
      } else {
        updateLoadingState('success')
      }

      // Clear timers
      if (minLoadingTimer.current) clearTimeout(minLoadingTimer.current)
      if (maxLoadingTimer.current) clearTimeout(maxLoadingTimer.current)

      uiLogger.info(`[${new Date().toISOString()}]] COMPLETE LoadingOptimizer.tsx – loading completed in ${loadTime.toFixed(0)}ms`)
    }
  }, [loading, loadingState, error, metrics, updateLoadingState, updateMetrics])

  /**
   * Handle retry action
   */
  const handleRetry = useCallback(() => {
    updateLoadingState('idle')
    uiLogger.info(`[${new Date().toISOString()}]] RETRY LoadingOptimizer.tsx – user initiated retry`)
  }, [updateLoadingState])

  /**
   * Handle clear error action
   */
  const handleClearError = useCallback(() => {
    updateLoadingState('idle')
    uiLogger.info(`[${new Date().toISOString()}]] CLEAR LoadingOptimizer.tsx – error cleared by user`)
  }, [updateLoadingState])

  /**
   * Render loading state
   */
  if (loading || loadingState === 'loading') {
    if (enableProgressiveLoading) {
      return (
        <ProgressiveLoader
          stages={progressiveStages}
          currentStage={progressiveStage}
          onStageComplete={setProgressiveStage}
        />
      )
    }

    if (skeleton) {
      return <>{skeleton}</>
    }

    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center p-xl">
        <div className="flex flex-col items-center space-y-m">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-body-m text-muted-foreground font-kanit">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  /**
   * Render error state
   */
  if (error || loadingState === 'error') {
    return (
      <ErrorBoundary
        error={error || 'An unexpected error occurred'}
        onRetry={handleRetry}
        onClearError={handleClearError}
      />
    )
  }

  /**
   * Render success state with performance monitor
   */
  return (
    <>
      {children}
      {showPerformanceMetrics && <PerformanceMonitor metrics={metrics} />}
    </>
  )
}

/**
 * Hook for loading optimization
 */
export const useLoadingOptimizer = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    totalRequests: 0
  })

  const updateLoadingState = useCallback((state: LoadingState) => {
    setLoadingState(state)
    uiLogger.info(`[${new Date().toISOString()}]] HOOK useLoadingOptimizer – state updated to: ${state}`)
  }, [])

  const updateMetrics = useCallback((updates: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    loadingState,
    metrics,
    updateLoadingState,
    updateMetrics
  }
}

export default AdvancedLoadingOptimizer
export { AdvancedLoadingOptimizer as LoadingOptimizer } 