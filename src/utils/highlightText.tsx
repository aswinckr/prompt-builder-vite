import React from 'react';

/**
 * Text highlighting utility for search results
 *
 * @module highlightText
 */

/**
 * Highlights matching text fragments in a string
 *
 * @param text - The text to highlight
 * @param query - The search query to highlight
 * @param className - CSS class for highlighted elements (default: 'text-highlight')
 * @returns React.ReactNode with highlighted spans
 */
export function highlightText(
  text: string,
  query: string,
  className: string = 'text-highlight'
): React.ReactNode {
  if (!query || !text || query.trim().length === 0) {
    return text;
  }

  const trimmedQuery = query.trim();
  const escapedQuery = escapeRegex(trimmedQuery);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <span key={index} className={className}>
          {part}
        </span>
      );
    }
    return part;
  });
}

/**
 * Escapes special regex characters in the query
 *
 * @param query - The search query
 * @returns Escaped query safe for regex
 */
function escapeRegex(query: string): string {
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Truncates text to a maximum length while preserving whole words
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  // Find the last space before the cutoff
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    // If there's a reasonably placed space, cut there
    return truncated.substring(0, lastSpace) + suffix;
  }

  // Otherwise, cut at the max length
  return truncated + suffix;
}

/**
 * Creates a content preview with highlighted search terms
 *
 * @param content - The full content
 * @param query - The search query
 * @param maxLength - Maximum preview length (default: 150)
 * @returns React.ReactNode with highlighted preview
 */
export function createHighlightedPreview(
  content: string,
  query: string,
  maxLength: number = 150
): React.ReactNode {
  if (!query || !content) {
    return truncateText(content, maxLength);
  }

  // Find the first occurrence of the query
  const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());

  if (queryIndex === -1) {
    return truncateText(content, maxLength);
  }

  // Create preview centered around the match
  const halfLength = Math.floor(maxLength / 2);
  let startIndex = Math.max(0, queryIndex - halfLength);
  let endIndex = Math.min(content.length, queryIndex + query.length + halfLength);

  // Try to start at word boundaries
  if (startIndex > 0) {
    const prevSpace = content.lastIndexOf(' ', startIndex);
    if (prevSpace > startIndex - 20) {
      startIndex = prevSpace + 1;
    }
  }

  // Try to end at word boundaries
  if (endIndex < content.length) {
    const nextSpace = content.indexOf(' ', endIndex);
    if (nextSpace > -1 && nextSpace < endIndex + 20) {
      endIndex = nextSpace;
    }
  }

  let preview = content.substring(startIndex, endIndex);

  // Add ellipsis if needed
  if (startIndex > 0) {
    preview = '...' + preview;
  }

  if (endIndex < content.length) {
    preview = preview + '...';
  }

  return highlightText(preview, query);
}