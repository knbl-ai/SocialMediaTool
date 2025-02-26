import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Detects if text contains Hebrew characters
 * @param {string} text - The text to check
 * @returns {boolean} - True if the text contains Hebrew characters
 */
export function containsHebrew(text) {
  if (!text || typeof text !== 'string') return false;
  // Hebrew Unicode range: \u0590-\u05FF
  return /[\u0590-\u05FF]/.test(text);
}

/**
 * Returns the appropriate text direction class based on content
 * @param {string} text - The text to analyze
 * @returns {string} - CSS class for text direction
 */
export function getTextDirectionClass(text) {
  return containsHebrew(text) ? 'text-right' : '';
}

/**
 * Returns the appropriate text direction style object based on content
 * @param {string} text - The text to analyze
 * @returns {Object} - Style object for text direction
 */
export function getTextDirectionStyle(text) {
  return containsHebrew(text) ? { textAlign: 'right', direction: 'rtl' } : {};
}
