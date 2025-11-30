"use client"

import { useEffect } from "react"
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
// Store the original console methods to avoid circular calls
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug
};

// Local logger fallback that bypasses any console overrides
const systemLogger = {
  codeChange: (file: string, action: string, description: string) => originalConsole.log("[" + new Date().toISOString() + "] SYS CHANGE " + file + " - " + action + ": " + description),
  functionEntry: (name: string, params?: any) => originalConsole.log("[" + new Date().toISOString() + "] SYS ENTER " + name, params || ""),
  functionExit: (name: string, result?: any) => originalConsole.log("[" + new Date().toISOString() + "] SYS EXIT " + name, result || ""),
  info: (message: string, context?: any) => originalConsole.log('[' + new Date().toISOString() + '] SYS ' + message, context || ''),
  error: (message: string, context?: any) => originalConsole.error('[' + new Date().toISOString() + '] SYS ERROR ' + message, context || ''),
  warn: (message: string, context?: any) => originalConsole.warn('[' + new Date().toISOString() + '] SYS WARN ' + message, context || ''),
  debug: (message: string, context?: any) => originalConsole.debug('[' + new Date().toISOString() + '] SYS DEBUG ' + message, context || '')
}

/**
 * Component to handle browser extension interference
 * Prevents hydration mismatches caused by browser extensions
 * that modify DOM attributes after initial render
 */
export function BrowserExtensionHandler() {
  useEffect(() => {
    systemLogger.codeChange('BrowserExtensionHandler.tsx', 'INIT', 'monitoring browser extension interference');
    
    // Store reference to original console.error for cleanup
    let originalConsoleError: typeof console.error | null = null
    // Store reference to original fetch for protection against extension interference
    let originalFetch: typeof fetch | null = null
    
    // Prevent wallet extension detection and errors
    if (typeof window !== 'undefined') {
      // Store and protect the original fetch function from extension interference
      originalFetch = window.fetch
      
      // Check if fetch has already been overridden by an extension
      const fetchString = originalFetch.toString()
      if (fetchString.includes('chrome-extension://') || fetchString.includes('interceptor')) {
        systemLogger.warn('Extension fetch interceptor detected, attempting to restore native fetch', { fetchSource: fetchString.substring(0, 100) })
        
        // Try to restore native fetch by creating a new fetch using XMLHttpRequest as fallback
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
          try {
            // Attempt to use the original fetch first
            return await originalFetch!(input, init)
          } catch (error) {
            systemLogger.warn('Original fetch failed, using XMLHttpRequest fallback', { error: error instanceof Error ? error.message : String(error) })
            
            // Fallback to XMLHttpRequest when extension intercepts fail
            return new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest()
              const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
              const method = init?.method || 'GET'
              
              xhr.open(method, url)
              
              // Set headers
              if (init?.headers) {
                const headers = new Headers(init.headers)
                headers.forEach((value, key) => {
                  xhr.setRequestHeader(key, value)
                })
              }
              
              xhr.onload = () => {
                const response = new Response(xhr.response, {
                  status: xhr.status,
                  statusText: xhr.statusText,
                  headers: new Headers(xhr.getAllResponseHeaders().split('\r\n').reduce((acc, line) => {
                    const [key, value] = line.split(': ')
                    if (key && value) acc[key] = value
                    return acc
                  }, {} as Record<string, string>))
                })
                resolve(response)
              }
              
              xhr.onerror = () => reject(new TypeError('Network request failed'))
              xhr.ontimeout = () => reject(new TypeError('Network request timed out'))
              
              if (init?.body) {
                xhr.send(init.body)
              } else {
                xhr.send()
              }
            })
          }
        }
      }
      // Suppress MetaMask and wallet extension errors by providing safe stubs
      originalConsoleError = console.error
      console.error = (...args) => {
        const message = args.join(' ').toLowerCase()
        
        // Only suppress very specific wallet/extension errors, not general errors
        if ((message.includes('metamask') && message.includes('provider')) || 
            (message.includes('wallet') && message.includes('not found')) || 
            (message.includes('ethereum') && message.includes('undefined')) ||
            (message.includes('web3') && message.includes('not defined')) ||
            (message.includes('chrome-extension://') && message.includes('not found'))) {
          // Suppress only specific wallet-related errors since this is not a crypto application
          systemLogger.codeChange('BrowserExtensionHandler.tsx', 'SUPPRESS', 'suppressed wallet error')
          return
        }
        
        // Don't interfere with fetch, SSE, or cache-related errors
        if (message.includes('cache') || message.includes('sse') || message.includes('connection') || 
            message.includes('failed to fetch') || message.includes('fetch') || message.includes('network')) {
          // Allow through all cache/SSE/connection/fetch errors for debugging
          originalConsoleError!.apply(console, args)
          return
        }
        
        // Allow all other errors through
        originalConsoleError!.apply(console, args)
      }
    }
    
    // Function to clean up known browser extension attributes
    const cleanupExtensionAttributes = () => {
      try {
        // List of known browser extension attributes that cause hydration mismatches
        const knownExtensionAttributes = [
          'cz-shortcut-listen',
          'data-new-gr-c-s-check-loaded',
          'data-gr-ext-installed',
          'data-qb-installed',
          'spellcheck',
          'data-gramm',
          'data-gramm_editor',
          'data-enable-grammarly',
          'data-lt-installed',
          'data-adblock-key'
        ]
        
        // Check and log if any extension attributes are present
        const bodyElement = document.body
        const foundAttributes = []
        
        knownExtensionAttributes.forEach(attr => {
          if (bodyElement.hasAttribute(attr)) {
            foundAttributes.push(attr)
          }
        })
        
        if (foundAttributes.length > 0) {
          systemLogger.codeChange('BrowserExtensionHandler.tsx', 'DETECT', 'detected browser extension attributes:');
        }
        
        // Note: We don't remove these attributes as they might be needed by extensions
        // Instead, we just log them for debugging purposes
        
      } catch (error) {
        systemLogger.codeChange('BrowserExtensionHandler.tsx', 'WARN', 'error checking extension attributes:');
      }
    }
    
    // Initial check
    cleanupExtensionAttributes()
    
    // Set up a mutation observer to monitor DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target === document.body) {
          systemLogger.codeChange('BrowserExtensionHandler.tsx', 'OBSERVE', 'body attribute changed:');
        }
      })
    })
    
    // Start observing both body and html elements
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [
        'cz-shortcut-listen',
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-qb-installed',
        'spellcheck',
        'data-gramm',
        'data-gramm_editor',
        'data-enable-grammarly',
        'data-lt-installed',
        'data-adblock-key'
      ]
    })
    
    // Also observe the html element for extension attributes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        'data-qb-installed',
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-lt-installed',
        'data-adblock-key'
      ]
    })
    
    // Cleanup on unmount
    return () => {
      observer.disconnect()
      // Restore original console.error if it was overridden
      if (typeof window !== 'undefined' && originalConsoleError) {
        console.error = originalConsoleError
      }
      // Restore original fetch if it was overridden
      if (typeof window !== 'undefined' && originalFetch) {
        window.fetch = originalFetch
      }
      systemLogger.codeChange('BrowserExtensionHandler.tsx', 'CLEANUP', 'stopped monitoring extension attributes and restored console.error and fetch');
    }
  }, [])
  
  // This component doesn't render anything
  // Info logs removed
  return null
}

/**
 * Higher-order component to wrap components that might be affected by browser extensions
 * @param WrappedComponent - Component to protect from extension interference
 */
export function withBrowserExtensionProtection<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'
  
  const ProtectedComponent = (props: T) => {
    return (
      <>
        <BrowserExtensionHandler />
        <WrappedComponent {...props} />
      </>
    )
  }
  
  ProtectedComponent.displayName = `withBrowserExtensionProtection(${displayName})`
  return ProtectedComponent
} 
