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

// Chat configuration
export const CHAT = {
  DEFAULT_MODEL: 'gemini-2.5-flash',
  TIME_FORMAT: {
    HOUR: '2-digit',
    MINUTE: '2-digit',
  },
} as const;

// Temporary data markers
export const TEMPORARY = {
  USER_ID: 'temporary',
} as const;

// Animation delays (in seconds for CSS)
export const ANIMATION_DELAYS = {
  TYPING_INDICATOR_1: '0.2s',
  TYPING_INDICATOR_2: '0.4s',
  MOTION_HIGHLIGHT: '0.2s',
} as const;