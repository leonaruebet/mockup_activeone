import { formatISO } from "date-fns"

/**
 * Structured log levels used by the UI design system logger.
 */
export type LogLevel = "debug" | "info" | "warn" | "error"

/**
 * Represents a standard structured logger interface for UI modules.
 */
export interface ScopedLogger {
  debug: (message: string, context?: Record<string, unknown>) => void
  info: (message: string, context?: Record<string, unknown>) => void
  warn: (message: string, context?: Record<string, unknown>) => void
  error: (message: string, context?: Record<string, unknown>) => void
}

/**
 * Maps log levels to their console counterparts for consistent output.
 */
const levelToConsole: Record<LogLevel, (message?: unknown, ...optionalParams: unknown[]) => void> = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
}

/**
 * Creates a scoped logger that prefixes each entry with a timestamp and scope label.
 *
 * @param scope - Human readable scope describing the source (e.g., `theme-provider`).
 * @returns Logger implementation with `debug`, `info`, `warn`, and `error` helpers.
 */
export function createScopedLogger(scope: string): ScopedLogger {
  const normalizedScope = scope.trim() || "ui"

  const output = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
    const timestamp = formatISO(new Date())
    levelToConsole[level](`[${timestamp}] [${normalizedScope}] ${message}`, context ?? {})
  }

  return {
    debug: (message: string, context?: Record<string, unknown>) => output("debug", message, context),
    info: (message: string, context?: Record<string, unknown>) => output("info", message, context),
    warn: (message: string, context?: Record<string, unknown>) => output("warn", message, context),
    error: (message: string, context?: Record<string, unknown>) => output("error", message, context),
  }
}
