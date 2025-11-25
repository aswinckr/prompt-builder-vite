import { DatabaseResponse } from '../services/databaseService';

/**
 * Error handling utilities for consistent error patterns across CRUD operations
 */

export type ErrorType = 'database' | 'network' | 'validation' | 'authentication' | 'unknown';

export interface ErrorInfo {
  type: ErrorType;
  userMessage: string;
  technicalMessage?: string;
  originalError?: any;
  shouldRetry?: boolean;
  retryMessage?: string;
}

/**
 * Analyzes an error and returns structured error information
 */
export function analyzeError(error: any): ErrorInfo {
  if (!error) {
    return {
      type: 'unknown',
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: 'No error provided',
      shouldRetry: true,
      retryMessage: 'Please try again in a moment.',
    };
  }

  // Handle DatabaseResponse objects
  if (error.error && typeof error.error === 'string') {
    return analyzeDatabaseError(error.error);
  }

  // Handle network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: 'network',
      userMessage: 'Connection failed. Check your internet and try again.',
      technicalMessage: error.message,
      originalError: error,
      shouldRetry: true,
      retryMessage: 'Check your connection and try again.',
    };
  }

  // Handle network timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return {
      type: 'network',
      userMessage: 'Request timed out. Please check your connection and try again.',
      technicalMessage: error.message,
      originalError: error,
      shouldRetry: true,
      retryMessage: 'Wait a moment and try again.',
    };
  }

  // Handle Supabase authentication errors
  if (error.message?.includes('JWT') || error.message?.includes('authentication') || error.code === 'PGRST301') {
    return {
      type: 'authentication',
      userMessage: 'Authentication error. Please log in and try again.',
      technicalMessage: error.message,
      originalError: error,
      shouldRetry: false,
      retryMessage: 'Please log in again.',
    };
  }

  // Handle Supabase validation errors
  if (error.code?.startsWith('PGRST') || error.message?.includes('validation')) {
    return {
      type: 'validation',
      userMessage: 'Invalid data. Please check your inputs and try again.',
      technicalMessage: error.message,
      originalError: error,
      shouldRetry: false,
      retryMessage: 'Check your inputs and try again.',
    };
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: 'network',
        userMessage: 'Network error occurred. Please check your connection.',
        technicalMessage: error.message,
        originalError: error,
        shouldRetry: true,
        retryMessage: 'Check your connection and try again.',
      };
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return {
        type: 'validation',
        userMessage: 'Invalid data provided. Please check your inputs.',
        technicalMessage: error.message,
        originalError: error,
        shouldRetry: false,
        retryMessage: 'Check your inputs and try again.',
      };
    }

    if (message.includes('permission') || message.includes('unauthorized')) {
      return {
        type: 'authentication',
        userMessage: 'You don\'t have permission to perform this action.',
        technicalMessage: error.message,
        originalError: error,
        shouldRetry: false,
        retryMessage: 'Contact support if you think this is an error.',
      };
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return analyzeDatabaseError(error);
  }

  // Unknown error type
  return {
    type: 'unknown',
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalMessage: String(error),
    originalError: error,
    shouldRetry: true,
    retryMessage: 'Wait a moment and try again.',
  };
}

/**
 * Analyzes database-specific error messages
 */
function analyzeDatabaseError(errorMessage: string): ErrorInfo {
  const message = errorMessage.toLowerCase();

  // Network-related database errors
  if (message.includes('connection') || message.includes('network') || message.includes('timeout')) {
    return {
      type: 'network',
      userMessage: 'Database connection failed. Please check your connection.',
      technicalMessage: errorMessage,
      shouldRetry: true,
      retryMessage: 'Check your connection and try again.',
    };
  }

  // Permission errors
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('access denied')) {
    return {
      type: 'authentication',
      userMessage: 'You don\'t have permission to perform this action.',
      technicalMessage: errorMessage,
      shouldRetry: false,
      retryMessage: 'Contact support if you think this is an error.',
    };
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('constraint')) {
    return {
      type: 'validation',
      userMessage: 'Invalid data. Please check your inputs and try again.',
      technicalMessage: errorMessage,
      shouldRetry: false,
      retryMessage: 'Check your inputs and try again.',
    };
  }

  // Row not found errors
  if (message.includes('not found') || message.includes('does not exist')) {
    return {
      type: 'database',
      userMessage: 'Item not found. It may have been already deleted.',
      technicalMessage: errorMessage,
      shouldRetry: false,
      retryMessage: 'Refresh the page and try again.',
    };
  }

  // Generic database error
  return {
    type: 'database',
    userMessage: 'Database error occurred. Please try again.',
    technicalMessage: errorMessage,
    shouldRetry: true,
    retryMessage: 'Wait a moment and try again.',
  };
}

/**
 * Handles CRUD operation results consistently
 */
export function handleCrudResult<T>(
  result: DatabaseResponse<T>,
  operation: string,
  itemTitle?: string,
  options?: { expectsData?: boolean; customMessage?: string }
): { success: boolean; message: string; shouldRetry?: boolean } {
  // Default to expecting data for backward compatibility
  const expectsData = options?.expectsData !== false;

  if (result.error) {
    const errorInfo = analyzeError(result.error);
    return {
      success: false,
      message: errorInfo.userMessage,
      shouldRetry: errorInfo.shouldRetry,
    };
  }

  // Use custom message if provided
  if (options?.customMessage) {
    return {
      success: true,
      message: itemTitle
        ? options.customMessage.replace('{itemTitle}', itemTitle)
        : options.customMessage,
    };
  }

  // For delete operations, successful response can have data: null
  if (!expectsData && result.data === null) {
    return {
      success: true,
      message: itemTitle
        ? `${operation} '${itemTitle}' completed successfully`
        : `${operation} completed successfully`,
    };
  }

  // For operations that expect data (read, create, update)
  if (expectsData) {
    if (result.data) {
      return {
        success: true,
        message: itemTitle
          ? `${operation} '${itemTitle}' completed successfully`
          : `${operation} completed successfully`,
      };
    }

    return {
      success: false,
      message: `No data returned from ${operation.toLowerCase()}`,
    };
  }

  // Fallback success case
  return {
    success: true,
    message: itemTitle
      ? `${operation} '${itemTitle}' completed successfully`
      : `${operation} completed successfully`,
  };
}

/**
 * Logs errors with context for debugging
 */
export function logError(context: string, error: any, additionalInfo?: any) {
  const errorInfo = analyzeError(error);

  console.group(`🚨 Error in ${context}`);
  console.error('Error Type:', errorInfo.type);
  console.error('User Message:', errorInfo.userMessage);
  console.error('Technical Message:', errorInfo.technicalMessage);
  console.error('Original Error:', errorInfo.originalError);

  if (additionalInfo) {
    console.error('Additional Context:', additionalInfo);
  }

  console.groupEnd();

  // In development, you might want to show more details
  if (process.env.NODE_ENV === 'development') {
    console.debug('Full error details:', {
      context,
      errorInfo,
      additionalInfo,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Creates a retry function with exponential backoff
 */
export function createRetryFunction<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): () => Promise<T> {
  return async () => {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorInfo = analyzeError(error);

        // Don't retry if error is not retryable
        if (!errorInfo.shouldRetry) {
          throw error;
        }

        // Don't wait after the last attempt
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));

          console.log(`Retrying operation (attempt ${attempt + 1}/${maxAttempts})...`);
        }
      }
    }

    throw lastError;
  };
}

/**
 * Default error messages for different operations
 */
export const DEFAULT_ERROR_MESSAGES = {
  create: 'Failed to create item. Please try again.',
  read: 'Failed to load data. Please refresh and try again.',
  update: 'Failed to update item. Please try again.',
  delete: 'Failed to delete item. Please try again.',
  network: 'Network error. Please check your connection and try again.',
  validation: 'Invalid data. Please check your inputs and try again.',
  authentication: 'Authentication error. Please log in again.',
  unknown: 'An unexpected error occurred. Please try again.',
} as const;