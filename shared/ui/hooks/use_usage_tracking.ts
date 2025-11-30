import { useState, useEffect, useCallback } from 'react'
import type { UsageDisplayData } from '../molecules/usage_display'
import { get_cached_value, set_cached_value } from '../utils/local_storage'

/**
 * Usage tracking hook
 * Purpose: Fetch and manage usage tracking data for an organization
 *
 * Optimizations:
 * - localStorage caching for instant display (zero flash)
 * - Optimistic updates from real-time events
 * - Automatic cache invalidation after 10 minutes
 *
 * @param org_id - Organization ID to fetch usage for
 * @param enabled - Whether to enable the hook (default: true)
 * @returns Usage data, loading state, error, and refresh function
 */
export function use_usage_tracking(org_id?: string, enabled: boolean = true) {
  // Initialize with cached data if available (instant display)
  const [usages, set_usages] = useState<UsageDisplayData[]>(() => {
    if (!org_id) return []

    const cached_credits = get_cached_value<number>(org_id, 'usage_credits')
    if (cached_credits !== null) {
      return [{
        metric: 'total_usages',
        label: 'Total Credits',
        current_usage: 0,
        limit: cached_credits,
        unit: 'credits',
        color: 'orange',
      }]
    }

    return []
  })

  const [is_loading, set_is_loading] = useState<boolean>(() => {
    // Only show loading if no cached data available
    if (!org_id) return false
    return get_cached_value<number>(org_id, 'usage_credits') === null
  })

  const [error, set_error] = useState<Error | null>(null)
  const [last_fetch, set_last_fetch] = useState<number>(0)

  /**
   * fetch_usages
   * Purpose: Fetch usage data using REST API (reliable approach for shared UI components)
   * Note: Using REST API instead of tRPC to avoid context issues in shared UI components
   */
  const fetch_usages = useCallback(async () => {
    if (!org_id || !enabled) {
      set_is_loading(false)
      return
    }

    console.log(`[${new Date().toISOString()}] use_usage_tracking fetch_usages_enter`, { org_id, use_api: true })
    set_is_loading(true)
    set_error(null)

    try {
      // Always use REST API for shared UI components to avoid tRPC context issues
      const response = await fetch(`/api/usage?org_id=${encodeURIComponent(org_id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        // Try to get error details from response body
        let error_details = ''
        try {
          const error_data = await response.text()
          error_details = error_data ? `: ${error_data}` : ''
        } catch {
          // Ignore errors reading error response body
        }
        throw new Error(`API error: ${response.status} ${response.statusText}${error_details}`)
      }

      // Safely parse JSON response
      let data: any
      try {
        data = await response.json()
      } catch (parse_error) {
        throw new Error(`Invalid JSON response from API: ${parse_error instanceof Error ? parse_error.message : 'Unknown parse error'}`)
      }

      console.log(`[${new Date().toISOString()}] use_usage_tracking fetch_usages_success_api`, {
        usages: data.usages,
        usages_limit: data.usages_limit,
        plus_usages: data.plus_usages,
        plus_usages_limit: data.plus_usages_limit,
        total_usages: data.total_usages,
      })

      // Validate response data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response data: expected object')
      }

      // Transform simplified API data to UsageDisplayData format
      // Note: total_usages = usages + plus_usages
      // The sidebar calculates remaining credits as: limit - current_usage
      // So we set current_usage=0 and limit=total_usages to show total as remaining
      const total_credits = typeof data.total_usages === 'number' ? data.total_usages : 0
      const transformed_usages: UsageDisplayData[] = [
        {
          metric: 'total_usages',
          label: 'Total Credits',
          current_usage: 0,  // Always 0 so sidebar shows full total
          limit: total_credits,  // Total credits available
          unit: 'credits',
          color: 'orange',
        },
      ]

      // Cache credits for instant display on next load (10 minute TTL)
      if (org_id) {
        set_cached_value(org_id, total_credits, 10 * 60 * 1000, 'usage_credits')
      }

      set_usages(transformed_usages)
      set_last_fetch(Date.now())
      set_is_loading(false)
    } catch (err) {
      console.error(`[${new Date().toISOString()}] use_usage_tracking fetch_usages_error`, err)
      set_error(err instanceof Error ? err : new Error('Unknown error'))
      set_is_loading(false)
    }
  }, [org_id, enabled])

  /**
   * refresh
   * Purpose: Manually trigger a refresh of usage data
   */
  const refresh = useCallback(() => {
    console.log(`[${new Date().toISOString()}] use_usage_tracking refresh_requested`)
    fetch_usages()
  }, [fetch_usages])

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (!enabled || !org_id) return

    // Fetch immediately
    fetch_usages()

    // Listen for real-time usage updates from chat responses
    const handle_usage_update = (event: CustomEvent) => {
      console.log('[use_usage_tracking] Real-time update received', event.detail);

      const { usages: new_usages, plus_usages: new_plus_usages, total_usages: new_total } = event.detail;

      // Update state immediately without API call
      const total_credits = new_total || 0
      const transformed_usages: UsageDisplayData[] = [
        {
          metric: 'total_usages',
          label: 'Total Credits',
          current_usage: 0,
          limit: total_credits,
          unit: 'credits',
          color: 'orange',
        },
      ];

      // Update cache for instant display on next load (10 minute TTL)
      if (org_id) {
        set_cached_value(org_id, total_credits, 10 * 60 * 1000, 'usage_credits')
      }

      set_usages(transformed_usages);
      set_last_fetch(Date.now());
    };
    
    window.addEventListener('usage-updated', handle_usage_update as EventListener);

    // Refresh every 5 minutes as backup
    const interval = setInterval(() => {
      fetch_usages()
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(interval);
      window.removeEventListener('usage-updated', handle_usage_update as EventListener);
    };
  }, [fetch_usages, enabled, org_id])

  return {
    usages,
    is_loading,
    error,
    refresh,
    last_fetch,
  }
}

/**
 * format_metric_label
 * Purpose: Convert metric name to human-readable label
 */
function format_metric_label(metric: string): string {
  const labels: Record<string, string> = {
    ai_tokens: 'AI Tokens',
    api_requests: 'API Requests',
    storage_gb: 'Storage',
    analytics_events: 'Analytics Events',
    crm_contacts: 'CRM Contacts',
    team_members: 'Team Members',
  }

  return labels[metric] || metric
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * get_metric_unit
 * Purpose: Get the appropriate unit for a metric
 */
function get_metric_unit(metric: string): string {
  const units: Record<string, string> = {
    ai_tokens: 'tokens',
    api_requests: 'requests',
    storage_gb: 'GB',
    analytics_events: 'events',
    crm_contacts: 'contacts',
    team_members: 'members',
  }

  return units[metric] || ''
}

/**
 * get_metric_color
 * Purpose: Get the appropriate color variant for a metric
 */
function get_metric_color(metric: string): 'orange' | 'blue' | 'green' | 'red' | 'purple' {
  const colors: Record<string, 'orange' | 'blue' | 'green' | 'red' | 'purple'> = {
    ai_tokens: 'purple',
    api_requests: 'blue',
    storage_gb: 'green',
    analytics_events: 'orange',
    crm_contacts: 'blue',
    team_members: 'orange',
  }

  return colors[metric] || 'orange'
}
