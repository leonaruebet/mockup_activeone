/**
 * Resolve Locale - i18n helper
 * Validates and resolves locale string
 */

export type Locale = 'en' | 'th';

const SUPPORTED_LOCALES: Locale[] = ['en', 'th'];
const DEFAULT_LOCALE: Locale = 'en';

export function resolveLocale(locale: string): Locale {
  // Validate locale and return default if invalid
  if (SUPPORTED_LOCALES.includes(locale as Locale)) {
    return locale as Locale;
  }
  
  return DEFAULT_LOCALE;
}
