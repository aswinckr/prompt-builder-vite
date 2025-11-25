/**
 * Debouncing utility functions
 *
 * @module debounceUtils
 */

/**
 * Debounces a function call
 *
 * @description Delays the execution of a function until after a specified wait time
 * has elapsed since the last time the debounced function was invoked
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A new debounced function
 *
 * @example
 * ```typescript
 * const debouncedSave = debounce((data: string) => {
 *   console.log('Saving:', data);
 * }, 300);
 *
 * // Will only call save after 300ms of no calls
 * debouncedSave('hello');
 * debouncedSave('world'); // This cancels the previous call
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;

  return (...args: Parameters<T>) => {
    // Clear the previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Creates a debounced callback with cleanup for React hooks
 *
 * @description Returns a debounced function and cleanup function for use in useEffect
 *
 * @param callback - The function to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns An object with debounced function and cleanup function
 *
 * @example
 * ```typescript
 * const { debouncedCallback, cleanup } = useDebouncedCallback(
 *   (value: string) => console.log('Searching:', value),
 *   300
 * );
 *
 * useEffect(() => {
 *   return cleanup;
 * }, [cleanup]);
 * ```
 */
export function createDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  let timeoutId: NodeJS.Timeout | undefined;

  const debouncedCallback = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return { debouncedCallback, cleanup };
}