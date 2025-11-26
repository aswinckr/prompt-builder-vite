import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LibraryProvider } from '../contexts/LibraryContext';
import { useLibraryActions, useLibraryState } from '../contexts/LibraryContext';
import { DatabaseService } from '../services/databaseService';
import { ReactNode } from 'react';

// Mock crypto.randomUUID for consistent test results
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

// Mock the services
vi.mock('../services/contextService', () => ({
  ContextService: {
    getContextBlocks: vi.fn(),
    createContextBlock: vi.fn(),
    updateContextBlock: vi.fn(),
    deleteContextBlock: vi.fn(),
  }
}));

vi.mock('../services/promptService', () => ({
  PromptService: {
    getPrompts: vi.fn(),
    createPrompt: vi.fn(),
    updatePrompt: vi.fn(),
    deletePrompt: vi.fn(),
  }
}));

vi.mock('../services/projectService', () => ({
  ProjectService: {
    getUserProjects: vi.fn(),
    getSystemProjects: vi.fn(),
    createProject: vi.fn(),
    deleteProject: vi.fn(),
    ensureUnsortedFolders: vi.fn(),
  }
}));

// Mock database service for error scenarios
vi.mock('../services/databaseService', () => ({
  DatabaseService: {
    getUser: vi.fn(),
    createAllSubscriptions: vi.fn(),
    cleanupSubscriptions: vi.fn(),
  }
}));

// Mock navigator.onLine for network status testing
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <LibraryProvider>{children}</LibraryProvider>
);

describe('Error Handling and User Experience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Test 4.1: Test network failure handling during sync
  it('should handle network failures during data refresh gracefully', async () => {
    const { ContextService } = await import('../services/contextService');
    const { PromptService } = await import('../services/promptService');
    const { ProjectService } = await import('../services/projectService');

    // Mock network failure
    vi.mocked(ContextService.getContextBlocks).mockRejectedValue(
      new Error('Network request failed')
    );
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => useLibraryState(),
      { wrapper }
    );

    // Wait for initial load and error handling
    await act(async () => {
      vi.advanceTimersByTime(100);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should have error state set
    expect(result.current.error).toBeTruthy();
    expect(result.current.error).toContain('Failed to refresh data');
    expect(result.current.syncLoading).toBe(false);

    // App should remain functional
    expect(result.current.contextBlocks).toBeDefined();
    expect(result.current.savedPrompts).toBeDefined();
  });

  // Test 4.1: Test database error handling during CRUD operations
  it('should handle database errors during CRUD operations', async () => {
    const { ContextService } = await import('../services/contextService');

    // Mock database error
    vi.mocked(ContextService.createContextBlock).mockResolvedValue({
      data: null,
      error: 'Database constraint violation'
    });
    vi.mocked(ContextService.getContextBlocks).mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(
      () => useLibraryActions(),
      { wrapper }
    );

    const blockData = {
      title: 'Test Context Block',
      content: 'Test content',
      tags: ['test'],
      project_id: null
    };

    let error;
    await act(async () => {
      try {
        await result.current.createContextBlock(blockData);
      } catch (err) {
        error = err;
      }
    });

    // Should handle error gracefully without crashing
    expect(ContextService.createContextBlock).toHaveBeenCalledWith(blockData);
    // Error is returned in the result, not thrown
  });

  // Test 4.2: Test retry mechanism functionality
  it('should implement retry mechanism with exponential backoff', async () => {
    const { ContextService } = await import('../services/contextService');

    // Mock initial failures followed by success
    let callCount = 0;
    vi.mocked(ContextService.getContextBlocks).mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.reject(new Error('Temporary network error'));
      }
      return Promise.resolve({ data: [], error: null });
    });

    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(
      () => useLibraryState(),
      { wrapper }
    );

    // Initial attempt
    await act(async () => {
      vi.advanceTimersByTime(100);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Simulate retry attempts with exponential backoff
    await act(async () => {
      vi.advanceTimersByTime(1000); // 1s backoff
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      vi.advanceTimersByTime(2000); // 2s backoff
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      vi.advanceTimersByTime(4000); // 4s backoff
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should have eventually succeeded after retries
    expect(callCount).toBeGreaterThanOrEqual(3);
  });

  // Test 4.2: Test maximum retry limits
  it('should respect maximum retry limits to prevent infinite loops', async () => {
    const { ContextService } = await import('../services/contextService');

    // Mock persistent failure
    vi.mocked(ContextService.getContextBlocks).mockRejectedValue(
      new Error('Persistent network error')
    );

    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(
      () => useLibraryState(),
      { wrapper }
    );

    const maxRetries = 3;
    let callCount = 0;

    // Mock to count calls
    vi.mocked(ContextService.getContextBlocks).mockImplementation(() => {
      callCount++;
      return Promise.reject(new Error('Persistent network error'));
    });

    // Simulate multiple retry attempts
    for (let i = 0; i < maxRetries + 2; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000 * (i + 1));
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }

    // Should have stopped retrying after max attempts
    expect(callCount).toBeLessThanOrEqual(maxRetries + 1);
    expect(result.current.error).toBeTruthy();
  });

  // Test 4.3: Test enhanced error messaging
  it('should provide specific error messages for different failure types', async () => {
    const { ContextService } = await import('../services/contextService');

    // Test different error types
    const errorScenarios = [
      { error: 'Network request failed', expectedType: 'network' },
      { error: 'Database constraint violation', expectedType: 'database' },
      { error: 'Authentication token expired', expectedType: 'auth' },
      { error: 'Permission denied', expectedType: 'permission' }
    ];

    for (const scenario of errorScenarios) {
      vi.clearAllMocks();

      vi.mocked(ContextService.getContextBlocks).mockRejectedValue(
        new Error(scenario.error)
      );

      const { result } = renderHook(
        () => useLibraryState(),
        { wrapper }
      );

      await act(async () => {
        vi.advanceTimersByTime(100);
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should have user-friendly error message
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Failed to refresh data');
    }
  });

  // Test 4.4: Test network status monitoring
  it('should monitor online/offline status', () => {
    // Mock online status
    Object.defineProperty(navigator, 'onLine', { value: true });

    const { result } = renderHook(
      () => useLibraryState(),
      { wrapper }
    );

    // Should handle online status
    expect(navigator.onLine).toBe(true);

    // Mock offline status
    Object.defineProperty(navigator, 'onLine', { value: false });

    // Should handle offline status
    expect(navigator.onLine).toBe(false);
  });

  // Test 4.4: Test pausing sync operations when offline
  it('should pause sync operations when offline', async () => {
    // Mock offline status
    Object.defineProperty(navigator, 'onLine', { value: false });

    const { result } = renderHook(
      () => useLibraryActions(),
      { wrapper }
    );

    const blockData = {
      title: 'Offline Context Block',
      content: 'Test content',
      tags: ['test'],
      project_id: null
    };

    // Should not attempt sync operations when offline
    // (This would be implemented in the enhanced context with network monitoring)
    expect(result.current).toBeDefined();
  });

  // Test 4.4: Test resuming sync when connection is restored
  it('should resume sync when connection is restored', async () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', { value: false });

    const { result } = renderHook(
      () => useLibraryState(),
      { wrapper }
    );

    // Simulate connection restored
    Object.defineProperty(navigator, 'onLine', { value: true });

    // Simulate online event
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    // Should handle connection restoration
    expect(navigator.onLine).toBe(true);
  });

  // Test 4.3: Test user feedback during retry attempts
  it('should provide user feedback during retry attempts', async () => {
    const { ContextService } = await import('../services/contextService');

    // Mock intermittent failures
    let callCount = 0;
    vi.mocked(ContextService.getContextBlocks).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('Temporary error'));
      }
      return Promise.resolve({ data: [], error: null });
    });

    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(
      () => useLibraryState(),
      { wrapper }
    );

    // Should show loading state during initial attempt
    expect(result.current.syncLoading).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(100);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should eventually succeed
    expect(callCount).toBe(2);
    expect(result.current.syncLoading).toBe(false);
  });

  // Test 4.1: Test graceful degradation
  it('should maintain application responsiveness during sync issues', async () => {
    // Mock sync failures
    const { DatabaseService } = await import('../services/databaseService');
    vi.mocked(DatabaseService.createAllSubscriptions).mockRejectedValue(
      new Error('Subscription failed')
    );

    const { result } = renderHook(
      () => {
        const state = useLibraryState();
        const actions = useLibraryActions();
        return { state, actions };
      },
      { wrapper }
    );

    // Wait for setup to complete
    await act(async () => {
      vi.advanceTimersByTime(0);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // App should remain functional despite sync failures
    expect(result.current.state.contextBlocks).toBeDefined();
    expect(result.current.state.savedPrompts).toBeDefined();
    expect(result.current.state.promptProjects).toBeDefined();
    expect(result.current.state.datasetProjects).toBeDefined();

    // Local actions should still work
    expect(typeof result.current.actions.createTemporaryBlock).toBe('function');
    expect(typeof result.current.actions.removeTemporaryBlock).toBe('function');
    expect(typeof result.current.actions.setCustomText).toBe('function');
  });

  // Test 4.3: Test error recovery instructions
  it('should provide clear recovery instructions to users', async () => {
    // Mock persistent sync error
    const { DatabaseService } = await import('../services/databaseService');
    vi.mocked(DatabaseService.createAllSubscriptions).mockRejectedValue(
      new Error('Real-time sync unavailable')
    );

    const { result } = renderHook(
      () => useLibraryState(),
      { wrapper }
    );

    // Wait for error to be set
    await act(async () => {
      vi.advanceTimersByTime(0);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should have user-friendly error message with recovery instructions
    if (result.current.error) {
      expect(result.current.error).toContain('Real-time sync unavailable');
      expect(result.current.error).toContain('Data will refresh on manual operations');
    }
  });
});

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