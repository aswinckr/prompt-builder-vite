/**
 * Application constants
 */

// Timeouts in milliseconds
export const TIMEOUTS = {
  COPY_STATUS_RESET: 2000,
  MODAL_FOCUS_DELAY: 100,
  TOAST_DURATION: 3000,
  ROUTE_TRANSITION: 300,
  PROFILE_CLOSE_DELAY: 100,
  SCROLL_DELAY: 50,
  DEBOUNCE_DELAY: 300,
} as const;

// Animation durations in milliseconds
export const ANIMATIONS = {
  FADE_IN: 200,
  FADE_OUT: 200,
  SLIDE_UP: 300,
  SLIDE_DOWN: 300,
} as const;

// File sizes
export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TEXT_LENGTH: 50000,
} as const;