'use client';

import { useEffect } from 'react';

/**
 * HydrationHandler
 * Purpose: Handle browser extension attributes that cause hydration mismatches
 * Params: none
 * Returns: null (no visible output)
 * Throws: none (graceful error handling)
 */
export function HydrationHandler() {
  useEffect(() => {
    // Handle browser extension attributes that may be added to any element
    const handleExtensionAttributes = () => {
      try {
        // List of known extension attributes and patterns
        const extensionAttributes = [
          'cz-shortcut-listen',
          'data-new-gr-c-s-check-loaded',
          'data-gr-ext-installed',
          'spellcheck',
          'data-1p-ignore',
          'data-lastpass-vault-detect'
        ];

        // Patterns for dynamic extension attributes
        const extensionPatterns = [
          /^data-listener-added_\d+$/,  // Password managers, form fillers
          /^data-form-type$/,           // Form detection
          /^data-btwn-/,               // Browser extensions
          /^data-ms-/,                 // Microsoft extensions
          /^data-lpignore$/,           // LastPass
          /^data-1p-/,                 // 1Password
          /^autocomplete-uid-/         // Autocomplete extensions
        ];

        // Check all elements for extension attributes
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
          // Remove known extension attributes
          extensionAttributes.forEach(attr => {
            if (element.hasAttribute(attr)) {
              element.removeAttribute(attr);
              console.debug('HydrationHandler: Removed attribute', attr, 'from', element.tagName);
            }
          });

          // Remove attributes matching extension patterns
          Array.from(element.attributes).forEach(attr => {
            const attrName = attr.name;
            const shouldRemove = extensionPatterns.some(pattern => pattern.test(attrName));
            if (shouldRemove) {
              element.removeAttribute(attrName);
              console.debug('HydrationHandler: Removed pattern attribute', attrName, 'from', element.tagName);
            }
          });
        });
      } catch (error) {
        // Silently handle any errors to prevent breaking the app
        console.debug('HydrationHandler: Error handling extension attributes:', error);
      }
    };

    // Run immediately after hydration
    handleExtensionAttributes();

    // Also run after a short delay to catch late-loading extensions
    setTimeout(handleExtensionAttributes, 500);
    setTimeout(handleExtensionAttributes, 1000);

    // Set up mutation observer to handle dynamically added attributes
    const observer = new MutationObserver((mutations) => {
      let shouldClean = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          const attrName = mutation.attributeName;

          if (attrName) {
            // Check if the added attribute matches our patterns
            const extensionPatterns = [
              /^data-listener-added_\d+$/,
              /^data-form-type$/,
              /^data-btwn-/,
              /^data-ms-/,
              /^data-lpignore$/,
              /^data-1p-/,
              /^autocomplete-uid-/
            ];

            const isExtensionAttr = extensionPatterns.some(pattern => pattern.test(attrName));
            if (isExtensionAttr) {
              shouldClean = true;
            }
          }
        }
      });

      if (shouldClean) {
        // Debounce the cleanup to avoid excessive calls
        setTimeout(handleExtensionAttributes, 100);
      }
    });

    // Observe the entire document for attribute changes
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true, // Monitor all descendants
      attributeFilter: [] // Monitor all attributes since we have dynamic patterns
    });

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}