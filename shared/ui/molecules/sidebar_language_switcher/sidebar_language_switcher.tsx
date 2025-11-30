"use client"

import React, { useEffect, useMemo, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Globe } from "lucide-react"

import { Button } from "../../atoms/button"
import { cn } from "../../utils"
import { createScopedLogger } from "../../utils/logger"

const logger = createScopedLogger("molecules:sidebar_language_switcher")

/**
 * Defines a language option that can be presented by the `SidebarLanguageSwitcher`.
 */
export interface LanguageDefinition {
  /** ISO language code used for selection and routing (e.g., `en`). */
  code: string
  /** Human readable language name (e.g., `English`). */
  name: string
  /** Optional native-language label (e.g., `ไทย`). */
  native_name?: string
  /** Optional emoji or icon text representation. */
  symbol?: string
}

/**
 * Customisable labels for the sidebar language switcher UI elements.
 */
export interface SidebarLanguageSwitcherLabels {
  /** Accessible label for the trigger button. */
  trigger_label?: string
  /** Accessible label for the dropdown options container. */
  listbox_label?: string
  /** Marker appended to the currently selected language. */
  active_language_suffix?: string
}

/**
 * Props accepted by the `SidebarLanguageSwitcher` component.
 */
export interface SidebarLanguageSwitcherProps {
  /** Currently selected locale code. */
  active_locale: string
  /** Invoked when a new language is selected. */
  on_select: (next_locale: string) => void
  /** Optional list of available languages; sensible defaults provided. */
  languages?: LanguageDefinition[]
  /** Renders the compact icon-only version regardless of collapse state. */
  icon_only?: boolean
  /** Indicates whether the host sidebar is currently collapsed. */
  is_collapsed?: boolean
  /** Optional class name extension for the root element. */
  class_name?: string
  /** Optional copy overrides. */
  labels?: SidebarLanguageSwitcherLabels
}

const default_languages: LanguageDefinition[] = [
  { code: "en", name: "English", native_name: "English", symbol: "🇺🇸" },
  { code: "th", name: "Thai", native_name: "ไทย", symbol: "🇹🇭" },
]

/**
 * Sidebar friendly locale picker that does not depend on framework-specific
 * routing hooks. Consumers are responsible for handling locale changes via the
 * provided callback, making this component portable across projects.
 */
export function SidebarLanguageSwitcher({
  active_locale,
  on_select,
  languages = default_languages,
  icon_only = false,
  is_collapsed = false,
  class_name = "",
  labels,
}: SidebarLanguageSwitcherProps) {
  logger.debug("render:start", {
    active_locale,
    language_count: languages.length,
    variant: icon_only || is_collapsed ? "icon" : "full",
  })

  const [is_open, set_is_open] = useState<boolean>(false)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    logger.info("effect:mount", { active_locale, language_count: languages.length })
    return () => {
      logger.info("effect:unmount", { active_locale })
    }
  }, [active_locale, languages.length])

  const available_languages = useMemo<LanguageDefinition[]>(() => {
    if (!languages.length) {
      logger.warn("languages:empty", { fallback_count: default_languages.length })
      return default_languages
    }
    return languages
  }, [languages])

  const current_language = useMemo(
    () =>
      available_languages.find((language) => language.code === active_locale) ??
      available_languages[0],
    [active_locale, available_languages],
  )

  const toggle_dropdown = () => {
    logger.debug("dropdown:toggle", { next_state: !is_open })

    if (!is_open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.top - 120, // Position above the button
        left: rect.left
      })
    }

    set_is_open((previous: boolean) => !previous)
  }

  const close_dropdown = () => {
    logger.debug("dropdown:close")
    set_is_open(false)
  }

  const handle_language_change = (language_code: string) => {
    if (language_code === active_locale) {
      logger.debug("language:noop", { language_code })
      close_dropdown()
      return
    }

    logger.info("language:change", { from: active_locale, to: language_code })
    on_select(language_code)
    close_dropdown()
  }

  const display_labels: Required<SidebarLanguageSwitcherLabels> = {
    trigger_label: labels?.trigger_label ?? "Change language",
    listbox_label: labels?.listbox_label ?? "Select a language",
    active_language_suffix: labels?.active_language_suffix ?? "(current)",
  }

  const should_render_icon_version = icon_only || is_collapsed

  const render_language_option = (language: LanguageDefinition) => {
    const is_active = language.code === current_language.code
    return (
      <button
        key={language.code}
        role="option"
        aria-selected={is_active}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors",
          "rounded-md focus-visible:outline-none focus-visible:ring-0",
          is_active
            ? "text-noble-black-600 font-semibold"
            : "text-noble-black-400 hover:text-noble-black-500",
        )}
        onClick={() => handle_language_change(language.code)}
      >
        <span className="truncate text-sm">
          {language.native_name ?? language.name}
        </span>
      </button>
    )
  }

  logger.debug("render:end", { variant: should_render_icon_version ? "icon" : "full" })

  if (should_render_icon_version) {
    return (
      <div ref={buttonRef} className={cn("relative", class_name)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle_dropdown}
          className="h-8 w-8 p-0 rounded-lg hover:bg-transparent focus:outline-none focus-visible:ring-0 active:scale-100"
          title={display_labels.trigger_label}
          aria-label={display_labels.trigger_label}
          aria-expanded={is_open}
          aria-haspopup="listbox"
        >
          <Globe className="h-4 w-4 text-noble-black-400" aria-hidden="true" />
        </Button>

        {is_open && mounted && createPortal(
          <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={close_dropdown} aria-hidden="true" />
            <div
              className="fixed z-50 w-28 rounded-lg border border-noble-black-100 bg-white p-1 shadow-lg"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`
              }}
            >
              <div role="listbox" aria-label={display_labels.listbox_label}>
                {available_languages.map((language) => render_language_option(language))}
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    )
  }

  return (
    <div ref={buttonRef} className={cn("relative", class_name)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle_dropdown}
        className="flex h-8 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-transparent focus:outline-none focus-visible:ring-0 active:scale-100"
        aria-expanded={is_open}
        aria-haspopup="listbox"
        aria-label={display_labels.trigger_label}
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-noble-black-400" aria-hidden="true" />
          <span className="text-xs font-medium text-noble-black-600">
            {current_language.native_name ?? current_language.name}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-noble-black-400 transition-transform",
            is_open && "rotate-180",
          )}
        />
      </Button>

      {is_open && mounted && createPortal(
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={close_dropdown} aria-hidden="true" />
          <div
            className="fixed z-50 rounded-lg border border-noble-black-100 bg-white p-1 shadow-lg"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: buttonRef.current?.offsetWidth || 'auto'
            }}
          >
            <div role="listbox" aria-label={display_labels.listbox_label}>
              {available_languages.map((language) => render_language_option(language))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

export default SidebarLanguageSwitcher
