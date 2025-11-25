import { describe, it, expect, vi } from 'vitest';
import { analyzeError, handleCrudResult, logError, DEFAULT_ERROR_MESSAGES } from '../utils/errorHandling';

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeError', () => {
    it('analyzes database errors correctly', () => {
      const error = 'Connection failed to database';
      const result = analyzeError(error);

      expect(result.type).toBe('network');
      expect(result.userMessage).toBe('Database connection failed. Please check your connection.');
      expect(result.shouldRetry).toBe(true);
    });

    it('analyzes network errors correctly', () => {
      const error = new TypeError('Failed to fetch');
      const result = analyzeError(error);

      expect(result.type).toBe('network');
      expect(result.userMessage).toBe('Connection failed. Check your internet and try again.');
      expect(result.shouldRetry).toBe(true);
    });

    it('analyzes timeout errors correctly', () => {
      const error = new Error('Request timeout');
      const result = analyzeError(error);

      expect(result.type).toBe('network');
      expect(result.userMessage).toBe('Request timed out. Please check your connection and try again.');
      expect(result.shouldRetry).toBe(true);
    });

    it('analyzes authentication errors correctly', () => {
      const error = new Error('JWT expired');
      const result = analyzeError(error);

      expect(result.type).toBe('authentication');
      expect(result.userMessage).toBe('Authentication error. Please log in and try again.');
      expect(result.shouldRetry).toBe(false);
    });

    it('analyzes validation errors correctly', () => {
      const error = { code: 'PGRST301', message: 'Validation failed' };
      const result = analyzeError(error);

      expect(result.type).toBe('authentication');
      expect(result.userMessage).toBe('You don\'t have permission to perform this action.');
      expect(result.shouldRetry).toBe(false);
    });

    it('analyzes validation constraint errors correctly', () => {
      const error = { message: 'constraint violation' };
      const result = analyzeError(error);

      expect(result.type).toBe('validation');
      expect(result.userMessage).toBe('Invalid data. Please check your inputs and try again.');
      expect(result.shouldRetry).toBe(false);
    });

    it('analyzes not found errors correctly', () => {
      const error = 'Row not found';
      const result = analyzeError(error);

      expect(result.type).toBe('database');
      expect(result.userMessage).toBe('Item not found. It may have been already deleted.');
      expect(result.shouldRetry).toBe(false);
    });

    it('handles unknown errors gracefully', () => {
      const error = { something: 'completely unexpected' };
      const result = analyzeError(error);

      expect(result.type).toBe('unknown');
      expect(result.userMessage).toBe('An unexpected error occurred. Please try again.');
      expect(result.shouldRetry).toBe(true);
    });

    it('handles null/undefined errors', () => {
      const result = analyzeError(null);

      expect(result.type).toBe('unknown');
      expect(result.userMessage).toBe('An unexpected error occurred. Please try again.');
      expect(result.shouldRetry).toBe(true);
    });

    it('handles string errors with permission keywords', () => {
      const error = 'permission denied for table';
      const result = analyzeError(error);

      expect(result.type).toBe('authentication');
      expect(result.userMessage).toBe('You don\'t have permission to perform this action.');
      expect(result.shouldRetry).toBe(false);
    });
  });

  describe('handleCrudResult', () => {
    it('handles successful CRUD operations', () => {
      const result = {
        data: { id: '1', title: 'Test Item' },
        error: null,
      };

      const crudResult = handleCrudResult(result, 'Item updated', 'Test Item');

      expect(crudResult.success).toBe(true);
      expect(crudResult.message).toBe("Item updated 'Test Item' completed successfully");
      expect(crudResult.shouldRetry).toBeUndefined();
    });

    it('handles CRUD operations with generic item name', () => {
      const result = {
        data: { id: '1', title: 'Test Item' },
        error: null,
      };

      const crudResult = handleCrudResult(result, 'Item created');

      expect(crudResult.success).toBe(true);
      expect(crudResult.message).toBe('Item created completed successfully');
    });

    it('handles CRUD operations with errors', () => {
      const result = {
        data: null,
        error: 'Database connection failed',
      };

      const crudResult = handleCrudResult(result, 'Item deleted', 'Test Item');

      expect(crudResult.success).toBe(false);
      expect(crudResult.message).toBe('Database connection failed. Please check your connection.');
      expect(crudResult.shouldRetry).toBe(true);
    });

    it('handles CRUD operations with no data and no error', () => {
      const result = {
        data: null,
        error: null,
      };

      const crudResult = handleCrudResult(result, 'Item loaded');

      expect(crudResult.success).toBe(false);
      expect(crudResult.message).toBe('No data returned from item loaded');
    });
  });

  describe('logError', () => {
    it('logs errors with context', () => {
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleSpyError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleSpyGroupEnd = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

      const error = new Error('Test error');
      const additionalInfo = { userId: '123', action: 'delete' };

      logError('Test Context', error, additionalInfo);

      expect(consoleSpy).toHaveBeenCalledWith('🚨 Error in Test Context');
      expect(consoleSpyError).toHaveBeenCalledWith('Error Type:', expect.any(String));
      expect(consoleSpyError).toHaveBeenCalledWith('User Message:', expect.any(String));
      expect(consoleSpyError).toHaveBeenCalledWith('Technical Message:', expect.any(String));
      expect(consoleSpyError).toHaveBeenCalledWith('Original Error:', error);
      expect(consoleSpyError).toHaveBeenCalledWith('Additional Context:', additionalInfo);
      expect(consoleSpyGroupEnd).toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleSpyError.mockRestore();
      consoleSpyGroupEnd.mockRestore();
    });

    it('logs errors without additional info', () => {
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleSpyError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleSpyGroupEnd = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

      const error = 'Simple error message';

      logError('Simple Context', error);

      expect(consoleSpy).toHaveBeenCalledWith('🚨 Error in Simple Context');
      expect(consoleSpyGroupEnd).toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleSpyError.mockRestore();
      consoleSpyGroupEnd.mockRestore();
    });

    it('logs additional debug info in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const consoleSpyGroup = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleSpyError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleSpyGroupEnd = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

      const error = new Error('Debug test error');

      logError('Debug Context', error);

      expect(consoleSpy).toHaveBeenCalledWith('Full error details:', expect.objectContaining({
        context: 'Debug Context',
        errorInfo: expect.any(Object),
        timestamp: expect.any(String),
      }));

      // Restore
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
      consoleSpyGroup.mockRestore();
      consoleSpyError.mockRestore();
      consoleSpyGroupEnd.mockRestore();
    });
  });

  describe('DEFAULT_ERROR_MESSAGES', () => {
    it('contains all required error messages', () => {
      expect(DEFAULT_ERROR_MESSAGES.create).toBe('Failed to create item. Please try again.');
      expect(DEFAULT_ERROR_MESSAGES.read).toBe('Failed to load data. Please refresh and try again.');
      expect(DEFAULT_ERROR_MESSAGES.update).toBe('Failed to update item. Please try again.');
      expect(DEFAULT_ERROR_MESSAGES.delete).toBe('Failed to delete item. Please try again.');
      expect(DEFAULT_ERROR_MESSAGES.network).toBe('Network error. Please check your connection and try again.');
      expect(DEFAULT_ERROR_MESSAGES.validation).toBe('Invalid data. Please check your inputs and try again.');
      expect(DEFAULT_ERROR_MESSAGES.authentication).toBe('Authentication error. Please log in again.');
      expect(DEFAULT_ERROR_MESSAGES.unknown).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('Error Type Classification', () => {
    it('correctly classifies different Supabase error codes', () => {
      const testCases = [
        { error: { code: 'PGRST116' }, expectedType: 'database' }, // Not found
        { error: { code: 'PGRST301' }, expectedType: 'authentication' }, // Permission
        { error: { code: 'PGRST202' }, expectedType: 'validation' }, // Constraint violation
      ];

      testCases.forEach(({ error, expectedType }) => {
        const result = analyzeError(error);
        expect(result.type).toBe(expectedType);
      });
    });

    it('handles edge cases gracefully', () => {
      // Empty string error
      const result1 = analyzeError('');
      expect(result1.type).toBe('database');
      expect(result1.userMessage).toBe('Database error occurred. Please try again.');

      // Empty object error
      const result2 = analyzeError({});
      expect(result2.type).toBe('unknown');
      expect(result2.userMessage).toBe('An unexpected error occurred. Please try again.');

      // Array as error
      const result3 = analyzeError(['error', 'list']);
      expect(result3.type).toBe('unknown');
      expect(result3.userMessage).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('Message Consistency', () => {
    it('provides actionable messages for retryable errors', () => {
      const retryableErrors = [
        'Connection timeout',
        'Network unreachable',
        'Database connection pool exhausted',
      ];

      retryableErrors.forEach((errorMessage) => {
        const result = analyzeError(errorMessage);
        if (result.shouldRetry) {
          expect(result.retryMessage).toBeDefined();
          expect(result.retryMessage).toMatch(/(try|check|wait)/i);
        }
      });
    });

    it('provides clear guidance for non-retryable errors', () => {
      const nonRetryableErrors = [
        'Permission denied',
        'Validation failed',
        'Record not found',
      ];

      nonRetryableErrors.forEach((errorMessage) => {
        const result = analyzeError(errorMessage);
        if (!result.shouldRetry) {
          expect(result.retryMessage).toBeDefined();
          expect(result.retryMessage).toMatch(/(check|contact|refresh)/i);
        }
      });
    });
  });
});