/**
 * Get Dictionary - i18n helper
 * Returns translations for the given locale
 */

import type { Dictionary } from '../../i18n/types';

export type Locale = 'en' | 'th';

const dictionaries = {
  en: () => import('../../i18n/dictionaries/en').then((module) => module.default),
  th: () => import('../../i18n/dictionaries/th').then((module) => module.default),
};

/**
 * Load and return dictionary for specified locale.
 * Falls back to English if locale not found.
 *
 * @param locale - Language code ('en' or 'th')
 * @returns Dictionary object with all translations
 */
export async function getDictionary(locale: Locale = 'en'): Promise<Dictionary> {
  console.info('[getDictionary] loading_dictionary', {
    timestamp: new Date().toISOString(),
    locale,
  });

  try {
    const dictionary = await dictionaries[locale]();

    console.info('[getDictionary] dictionary_loaded', {
      timestamp: new Date().toISOString(),
      locale,
      success: true,
    });

    return dictionary;
  } catch (error) {
    console.error('[getDictionary] dictionary_load_error', {
      timestamp: new Date().toISOString(),
      locale,
      error: error instanceof Error ? error.message : String(error),
    });

    // Fallback to English
    const fallbackDictionary = await dictionaries.en();
    return fallbackDictionary;
  }
}
