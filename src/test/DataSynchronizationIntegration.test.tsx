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

// Mock database service
vi.mock('../services/databaseService', () => ({
  DatabaseService: {
    getUser: vi.fn(),
    createAllSubscriptions: vi.fn(),
    cleanupSubscriptions: vi.fn(),
  }
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <LibraryProvider>{children}</LibraryProvider>
);

describe('Data Synchronization Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Test 5.3: Complete end-to-end workflow for context blocks
  it('should complete full workflow: create context block → auto-refresh → UI update', async () => {
    const { ContextService } = await import('../services/contextService');
    const { PromptService } = await import('../services/promptService');
    const { ProjectService } = await import('../services/projectService');

    // Mock successful operations
    const mockContextBlock = {
      id: 'context-block-1',
      user_id: 'user-123',
      title: 'Test Context Block',
      content: 'Test content',
      tags: ['test'],
      project_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    vi.mocked(ContextService.createContextBlock).mockResolvedValue({
      data: mockContextBlock,
      error: null
    });

    // Mock refresh operations
    vi.mocked(ContextService.getContextBlocks).mockResolvedValue({ data: [mockContextBlock], error: null });
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

    // Initially empty
    expect(result.current.state.contextBlocks).toHaveLength(0);

    // Create context block
    const blockData = {
      title: 'Test Context Block',
      content: 'Test content',
      tags: ['test'],
      project_id: null
    };

    let createResult;
    await act(async () => {
      createResult = await result.current.actions.createContextBlock(blockData);
    });

    // Should have called service
    expect(ContextService.createContextBlock).toHaveBeenCalledWith(blockData);

    // Should return success
    expect(createResult.data).toEqual(mockContextBlock);
    expect(createResult.error).toBeNull();

    // Should trigger auto-refresh
    expect(ProjectService.ensureUnsortedFolders).toHaveBeenCalled();
    expect(ContextService.getContextBlocks).toHaveBeenCalled();
    expect(PromptService.getPrompts).toHaveBeenCalled();
    expect(ProjectService.getUserProjects).toHaveBeenCalledWith('prompt');
    expect(ProjectService.getUserProjects).toHaveBeenCalledWith('dataset');
    expect(ProjectService.getSystemProjects).toHaveBeenCalledWith('prompt');
    expect(ProjectService.getSystemProjects).toHaveBeenCalledWith('dataset');

    // UI should be updated
    expect(result.current.state.contextBlocks).toHaveLength(1);
    expect(result.current.state.contextBlocks[0]).toEqual(mockContextBlock);
  });

  // Test 5.3: Complete end-to-end workflow for saved prompts
  it('should complete full workflow: create saved prompt → auto-refresh → UI update', async () => {
    const { ContextService } = await import('../services/contextService');
    const { PromptService } = await import('../services/promptService');
    const { ProjectService } = await import('../services/projectService');

    // Mock successful operations
    const mockSavedPrompt = {
      id: 'prompt-1',
      user_id: 'user-123',
      title: 'Test Saved Prompt',
      content: 'Test prompt content',
      tags: ['test'],
      project_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    vi.mocked(PromptService.createPrompt).mockResolvedValue({
      data: mockSavedPrompt,
      error: null
    });

    // Mock refresh operations
    vi.mocked(ContextService.getContextBlocks).mockResolvedValue({ data: [], error: null });
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [mockSavedPrompt], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

    // Initially empty
    expect(result.current.state.savedPrompts).toHaveLength(0);

    // Create saved prompt
    const promptData = {
      title: 'Test Saved Prompt',
      content: 'Test prompt content',
      tags: ['test'],
      project_id: null
    };

    let createResult;
    await act(async () => {
      createResult = await result.current.actions.createSavedPrompt(promptData);
    });

    // Should have called service
    expect(PromptService.createPrompt).toHaveBeenCalledWith(promptData);

    // Should return success
    expect(createResult.data).toEqual(mockSavedPrompt);
    expect(createResult.error).toBeNull();

    // Should trigger auto-refresh
    expect(ProjectService.ensureUnsortedFolders).toHaveBeenCalled();
    expect(ContextService.getContextBlocks).toHaveBeenCalled();
    expect(PromptService.getPrompts).toHaveBeenCalled();
    expect(ProjectService.getUserProjects).toHaveBeenCalledWith('prompt');
    expect(ProjectService.getUserProjects).toHaveBeenCalledWith('dataset');
    expect(ProjectService.getSystemProjects).toHaveBeenCalledWith('prompt');
    expect(ProjectService.getSystemProjects).toHaveBeenCalledWith('dataset');

    // UI should be updated
    expect(result.current.state.savedPrompts).toHaveLength(1);
    expect(result.current.state.savedPrompts[0]).toEqual(mockSavedPrompt);
  });

  // Test 5.3: Integration with real-time sync
  it('should integrate real-time sync with CRUD operations', async () => {
    const { DatabaseService } = await import('../services/databaseService');
    const { ContextService } = await import('../services/contextService');
    const { PromptService } = await import('../services/promptService');
    const { ProjectService } = await import('../services/projectService');

    // Mock real-time subscriptions
    let subscriptionCallback: ((payload: any) => void) | null = null;

    vi.mocked(DatabaseService.createAllSubscriptions).mockImplementation(async (callback) => {
      subscriptionCallback = callback;
      return [
        { unsubscribe: vi.fn() },
        { unsubscribe: vi.fn() },
        { unsubscribe: vi.fn() },
        { unsubscribe: vi.fn() }
      ];
    });

    // Mock data operations
    const mockContextBlock = {
      id: 'context-block-1',
      user_id: 'user-123',
      title: 'Test Context Block',
      content: 'Test content',
      tags: ['test'],
      project_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    vi.mocked(ContextService.getContextBlocks).mockResolvedValue({ data: [mockContextBlock], error: null });
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => useLibraryState(),
      { wrapper }
    );

    // Wait for subscriptions to be set up
    await act(async () => {
      vi.advanceTimersByTime(0);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should have set up subscriptions
    expect(DatabaseService.createAllSubscriptions).toHaveBeenCalled();
    expect(subscriptionCallback).toBeTruthy();

    // Simulate real-time event
    if (subscriptionCallback) {
      await act(async () => {
        subscriptionCallback({
          table: 'context_blocks',
          event_type: 'INSERT',
          new: mockContextBlock
        });
      });
    }

    // Should have triggered refresh
    expect(ContextService.getContextBlocks).toHaveBeenCalled();
  });

  // Test 5.3: Mixed CRUD operations maintain consistency
  it('should maintain data consistency across mixed CRUD operations', async () => {
    const { ContextService } = await import('../services/contextService');
    const { PromptService } = await import('../services/promptService');
    const { ProjectService } = await import('../services/projectService');

    // Mock data
    const mockContextBlock = {
      id: 'context-block-1',
      user_id: 'user-123',
      title: 'Test Context Block',
      content: 'Test content',
      tags: ['test'],
      project_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    const mockSavedPrompt = {
      id: 'prompt-1',
      user_id: 'user-123',
      title: 'Test Saved Prompt',
      content: 'Test prompt content',
      tags: ['test'],
      project_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Mock successful operations
    vi.mocked(ContextService.createContextBlock).mockResolvedValue({
      data: mockContextBlock,
      error: null
    });

    vi.mocked(PromptService.createPrompt).mockResolvedValue({
      data: mockSavedPrompt,
      error: null
    });

    // Mock refresh operations
    vi.mocked(ContextService.getContextBlocks).mockResolvedValue({ data: [mockContextBlock], error: null });
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [mockSavedPrompt], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

    // Initially empty
    expect(result.current.state.contextBlocks).toHaveLength(0);
    expect(result.current.state.savedPrompts).toHaveLength(0);

    // Create context block
    await act(async () => {
      await result.current.actions.createContextBlock({
        title: 'Test Context Block',
        content: 'Test content',
        tags: ['test'],
        project_id: null
      });
    });

    // Create saved prompt
    await act(async () => {
      await result.current.actions.createSavedPrompt({
        title: 'Test Saved Prompt',
        content: 'Test prompt content',
        tags: ['test'],
        project_id: null
      });
    });

    // Both should be present
    expect(result.current.state.contextBlocks).toHaveLength(1);
    expect(result.current.state.savedPrompts).toHaveLength(1);

    // Data should be consistent
    expect(result.current.state.contextBlocks[0]).toEqual(mockContextBlock);
    expect(result.current.state.savedPrompts[0]).toEqual(mockSavedPrompt);
  });

  // Test 5.3: Temporary blocks remain local-only during sync
  it('should keep temporary blocks local-only during data synchronization', async () => {
    const { ContextService } = await import('../services/contextService');
    const { PromptService } = await import('../services/promptService');
    const { ProjectService } = await import('../services/projectService');

    // Mock empty database data
    vi.mocked(ContextService.getContextBlocks).mockResolvedValue({ data: [], error: null });
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

    // Initially empty
    expect(result.current.state.contextBlocks).toHaveLength(0);

    // Create temporary block
    const tempBlock = result.current.actions.createTemporaryBlock({
      title: 'Temporary Block',
      content: 'Temporary content',
      tags: ['temp'],
      project_id: null
    });

    // Should be in state
    expect(result.current.state.contextBlocks).toHaveLength(1);
    expect(result.current.state.contextBlocks[0]).toEqual(tempBlock);

    // Should not have triggered database sync
    expect(ContextService.getContextBlocks).not.toHaveBeenCalled();

    // Perform sync operation
    await act(async () => {
      await result.current.actions.refreshSystemProjects();
    });

    // Temporary block should still be present (not affected by sync)
    expect(result.current.state.contextBlocks).toHaveLength(1);
    expect(result.current.state.contextBlocks[0]).toEqual(tempBlock);
  });

  // Test 5.3: Error recovery maintains application state
  it('should maintain application state during sync error recovery', async () => {
    const { ContextService } = await import('../services/contextService');
    const { PromptService } = await import('../services/promptService');
    const { ProjectService } = await import('../services/projectService');

    // Mock initial data
    const existingData = {
      contextBlocks: [
        {
          id: 'existing-block',
          user_id: 'user-123',
          title: 'Existing Block',
          content: 'Existing content',
          tags: [],
          project_id: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      savedPrompts: [
        {
          id: 'existing-prompt',
          user_id: 'user-123',
          title: 'Existing Prompt',
          content: 'Existing prompt content',
          tags: [],
          project_id: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
    };

    // Mock existing data on initial load
    vi.mocked(ContextService.getContextBlocks).mockResolvedValue({
      data: existingData.contextBlocks,
      error: null
    });
    vi.mocked(PromptService.getPrompts).mockResolvedValue({
      data: existingData.savedPrompts,
      error: null
    });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });

    // Mock sync failure after creating new item
    vi.mocked(ContextService.createContextBlock).mockResolvedValue({
      data: null,
      error: 'Sync failed'
    });

    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

    // Wait for initial load
    await act(async () => {
      vi.advanceTimersByTime(100);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should have existing data
    expect(result.current.state.contextBlocks).toHaveLength(1);
    expect(result.current.state.savedPrompts).toHaveLength(1);

    // Try to create new context block (will fail)
    let createResult;
    await act(async () => {
      createResult = await result.current.actions.createContextBlock({
        title: 'New Block',
        content: 'New content',
        tags: ['new'],
        project_id: null
      });
    });

    // Should have failed
    expect(createResult.error).toBeTruthy();

    // Existing data should still be intact
    expect(result.current.state.contextBlocks).toHaveLength(1);
    expect(result.current.state.savedPrompts).toHaveLength(1);
    expect(result.current.state.contextBlocks[0].id).toBe('existing-block');
    expect(result.current.state.savedPrompts[0].id).toBe('existing-prompt');
  });

  // Test 5.3: Debouncing prevents excessive refresh operations
  it('should debounce rapid operations to prevent excessive refreshes', async () => {
    const { ContextService } = await import('../services/contextService');
    const { PromptService } = await import('../services/promptService');
    const { ProjectService } = await import('../services/projectService');

    // Mock successful operations
    vi.mocked(ContextService.createContextBlock).mockResolvedValue({
      data: {
        id: 'context-block-1',
        user_id: 'user-123',
        title: 'Test Context Block',
        content: 'Test content',
        tags: ['test'],
        project_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      error: null
    });

    let getContextBlocksCallCount = 0;
    vi.mocked(ContextService.getContextBlocks).mockImplementation(() => {
      getContextBlocksCallCount++;
      return Promise.resolve({ data: [], error: null });
    });

    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => useLibraryActions(),
      { wrapper }
    );

    // Create multiple context blocks rapidly
    const blockData = {
      title: 'Test Context Block',
      content: 'Test content',
      tags: ['test'],
      project_id: null
    };

    await act(async () => {
      await result.current.createContextBlock(blockData);
      await result.current.createContextBlock(blockData);
      await result.current.createContextBlock(blockData);
    });

    // Wait for debouncing to settle
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Due to debouncing, should have fewer refresh calls than operations
    expect(getContextBlocksCallCount).toBeLessThan(3);
  });
});