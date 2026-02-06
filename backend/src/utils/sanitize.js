/**
 * HTML Sanitization Utilities
 * Uses DOMPurify to prevent XSS attacks in user-generated content
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content using DOMPurify defaults
 * Removes dangerous tags/attributes while keeping safe HTML
 */
export function sanitizeHTML(input) {
  if (!input || typeof input !== "string") return input;

  return DOMPurify.sanitize(input);
}

/**
 * Strip all HTML tags, keep only text content
 * Use for titles, comments, usernames
 */
export function sanitizePlainText(input) {
  if (!input || typeof input !== "string") return input;

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}
