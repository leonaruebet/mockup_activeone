/**
 * LocalStorage Utility for Persistent State Management
 *
 * Provides type-safe localStorage operations with error handling
 * and SSR compatibility for Next.js applications.
 *
 * @module local_storage
 */

/**
 * Checks if localStorage is available (browser environment)
 *
 * @returns {boolean} True if localStorage is available, false otherwise
 */
const is_local_storage_available = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const test_key = '__localStorage_test__';
    window.localStorage.setItem(test_key, 'test');
    window.localStorage.removeItem(test_key);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Gets a value from localStorage with type safety
 *
 * @template T - The expected type of the stored value
 * @param {string} key - The localStorage key
 * @param {T} default_value - Default value if key doesn't exist or parsing fails
 * @returns {T} The stored value or default value
 */
export const get_local_storage_item = <T>(key: string, default_value: T): T => {
  if (!is_local_storage_available()) {
    return default_value;
  }

  try {
    const item = window.localStorage.getItem(key);

    if (item === null) {
      return default_value;
    }

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`[LocalStorage] Error reading key "${key}":`, error);
    return default_value;
  }
};

/**
 * Sets a value in localStorage with error handling
 *
 * @param {string} key - The localStorage key
 * @param {unknown} value - The value to store (will be JSON stringified)
 * @returns {boolean} True if successful, false otherwise
 */
export const set_local_storage_item = (key: string, value: unknown): boolean => {
  if (!is_local_storage_available()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[LocalStorage] Error writing key "${key}":`, error);
    return false;
  }
};

/**
 * Removes a value from localStorage
 *
 * @param {string} key - The localStorage key to remove
 * @returns {boolean} True if successful, false otherwise
 */
export const remove_local_storage_item = (key: string): boolean => {
  if (!is_local_storage_available()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[LocalStorage] Error removing key "${key}":`, error);
    return false;
  }
};

/**
 * Clears all localStorage data (use with caution)
 *
 * @returns {boolean} True if successful, false otherwise
 */
export const clear_local_storage = (): boolean => {
  if (!is_local_storage_available()) {
    return false;
  }

  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error('[LocalStorage] Error clearing storage:', error);
    return false;
  }
};

/**
 * Cache entry structure with TTL (Time To Live)
 */
interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

/**
 * Gets a cached value from localStorage with TTL validation
 *
 * @template T - The expected type of the stored value
 * @param {string} key - The localStorage key
 * @param {string} namespace - Optional namespace for grouping caches (e.g., 'usage', 'user')
 * @returns {T | null} The cached value or null if expired/not found
 */
export const get_cached_value = <T>(
  key: string,
  namespace?: string
): T | null => {
  if (!is_local_storage_available()) {
    return null
  }

  try {
    const cache_key = namespace ? `cache_${namespace}_${key}` : `cache_${key}`
    const cached_string = window.localStorage.getItem(cache_key)

    if (!cached_string) {
      return null
    }

    const cached_entry: CacheEntry<T> = JSON.parse(cached_string)
    const now = Date.now()

    // Check if cache is expired
    if (now - cached_entry.timestamp > cached_entry.ttl) {
      // Auto-cleanup expired cache
      window.localStorage.removeItem(cache_key)
      return null
    }

    return cached_entry.value
  } catch (error) {
    console.error(`[LocalStorage] Error reading cached key "${key}":`, error)
    return null
  }
}

/**
 * Sets a cached value to localStorage with TTL
 *
 * @param {string} key - The localStorage key
 * @param {T} value - The value to cache (must be JSON-serializable)
 * @param {number} ttl - Time to live in milliseconds (default: 10 minutes)
 * @param {string} namespace - Optional namespace for grouping caches
 * @returns {boolean} True if successful, false otherwise
 */
export const set_cached_value = <T>(
  key: string,
  value: T,
  ttl: number = 10 * 60 * 1000,
  namespace?: string
): boolean => {
  if (!is_local_storage_available()) {
    return false
  }

  try {
    const cache_key = namespace ? `cache_${namespace}_${key}` : `cache_${key}`
    const cache_entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl
    }

    window.localStorage.setItem(cache_key, JSON.stringify(cache_entry))
    return true
  } catch (error) {
    console.error(`[LocalStorage] Error writing cached key "${key}":`, error)
    return false
  }
}

/**
 * Clears a specific cache entry
 *
 * @param {string} key - Cache key to remove
 * @param {string} namespace - Optional namespace
 * @returns {boolean} True if successful, false otherwise
 */
export const clear_cached_value = (key: string, namespace?: string): boolean => {
  if (!is_local_storage_available()) {
    return false
  }

  try {
    const cache_key = namespace ? `cache_${namespace}_${key}` : `cache_${key}`
    window.localStorage.removeItem(cache_key)
    return true
  } catch (error) {
    console.error(`[LocalStorage] Error clearing cached key "${key}":`, error)
    return false
  }
}

/**
 * Clears all cache entries (optionally by namespace)
 *
 * @param {string} namespace - Optional namespace to clear (clears only that namespace)
 * @returns {boolean} True if successful, false otherwise
 */
export const clear_all_cached_values = (namespace?: string): boolean => {
  if (!is_local_storage_available()) {
    return false
  }

  try {
    const prefix = namespace ? `cache_${namespace}_` : 'cache_'
    const keys_to_remove: string[] = []

    // Find all matching cache keys
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keys_to_remove.push(key)
      }
    }

    // Remove all matching keys
    keys_to_remove.forEach(key => window.localStorage.removeItem(key))

    console.log('[LocalStorage] Cleared cache', {
      namespace,
      count: keys_to_remove.length
    })

    return true
  } catch (error) {
    console.error('[LocalStorage] Error clearing all cache:', error)
    return false
  }
}

/**
 * Storage Keys Constants
 * Centralized keys to prevent typos and enable refactoring
 */
export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: 'ons_sidebar_collapsed',
  CHATBOT_COLLAPSED: 'ons_chatbot_collapsed',
  RIGHT_PANEL_COLLAPSED: 'ons_right_panel_collapsed',
  SIDEBAR_WIDTH: 'ons_sidebar_width',
} as const;
