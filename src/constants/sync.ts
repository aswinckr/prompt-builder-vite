// Synchronization configuration constants
export const SYNC_CONSTANTS = {
  // Minimum interval between refresh operations to prevent sync storms
  DEBOUNCE_INTERVAL_MS: 500,

  // Maximum retry attempts for failed operations
  MAX_RETRY_ATTEMPTS: 3,

  // Backoff multiplier for exponential retry
  RETRY_BACKOFF_MULTIPLIER: 2,

  // Initial retry delay in milliseconds
  INITIAL_RETRY_DELAY_MS: 1000,
} as const;