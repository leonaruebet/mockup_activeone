import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines Tailwind CSS classes with proper conflict resolution
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL-safe slug from a given string
 * Converts to lowercase, replaces non-alphanumeric characters with hyphens
 *
 * @param text - The text to convert to a slug
 * @returns URL-safe slug string
 *
 * @example
 * generate_slug("My Organization Name") // returns "my-organization-name"
 * generate_slug("Test@123 Company!") // returns "test-123-company"
 */
export function generate_slug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}
