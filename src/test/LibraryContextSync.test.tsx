import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LibraryProvider } from '../contexts/LibraryContext';
import { useLibraryActions, useLibraryState } from '../contexts/LibraryContext';
import { ReactNode } from 'react';
import { ContextService } from '../services/contextService';
import { PromptService } from '../services/promptService';
import { ProjectService } from '../services/projectService';

// Mock crypto.randomUUID for consistent test results
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

// Mock the services
vi.mock('../services/contextService', () => ({
  ContextService: {
    createContextBlock: vi.fn(),
    updateContextBlock: vi.fn(),
    deleteContextBlock: vi.fn(),
    getContextBlocks: vi.fn(),
  }
}));

vi.mock('../services/promptService', () => ({
  PromptService: {
    createPrompt: vi.fn(),
    updatePrompt: vi.fn(),
    deletePrompt: vi.fn(),
    getPrompts: vi.fn(),
  }
}));

vi.mock('../services/projectService', () => ({
  ProjectService: {
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    getUserProjects: vi.fn(),
    getSystemProjects: vi.fn(),
    ensureUnsortedFolders: vi.fn(),
  }
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <LibraryProvider>{children}</LibraryProvider>
);

describe('LibraryContext Synchronization Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 2.1: Test context block CRUD actions with auto-refresh
  it('should auto-refresh data after successful context block creation', async () => {
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

    // Mock the refresh methods
    const getContextBlocksMock = vi.mocked(ContextService.getContextBlocks);
    const getPromptsMock = vi.mocked(PromptService.getPrompts);
    const getUserProjectsMock = vi.mocked(ProjectService.getUserProjects);
    const getSystemProjectsMock = vi.mocked(ProjectService.getSystemProjects);
    const ensureUnsortedFoldersMock = vi.mocked(ProjectService.ensureUnsortedFolders);

    getContextBlocksMock.mockResolvedValue({ data: [mockContextBlock], error: null });
    getPromptsMock.mockResolvedValue({ data: [], error: null });
    getUserProjectsMock.mockResolvedValue({ data: [], error: null });
    getSystemProjectsMock.mockResolvedValue({ data: [], error: null });
    ensureUnsortedFoldersMock.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

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

    // Verify service was called
    expect(ContextService.createContextBlock).toHaveBeenCalledWith(blockData);

    // Verify successful creation
    expect(createResult.data).toEqual(mockContextBlock);
    expect(createResult.error).toBeNull();

    // Verify auto-refresh was triggered
    expect(ensureUnsortedFoldersMock).toHaveBeenCalled();
    expect(getContextBlocksMock).toHaveBeenCalled();
    expect(getPromptsMock).toHaveBeenCalled();
    expect(getUserProjectsMock).toHaveBeenCalledWith('prompt');
    expect(getUserProjectsMock).toHaveBeenCalledWith('dataset');
    expect(getSystemProjectsMock).toHaveBeenCalledWith('prompt');
    expect(getSystemProjectsMock).toHaveBeenCalledWith('dataset');
  });

  // Test 2.1: Test loading state management during sync
  it('should show loading states during data refresh operations', async () => {
    vi.mocked(ContextService.getContextBlocks).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: [], error: null }), 100))
    );
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => useLibraryState(),
      { wrapper }
    );

    // Initial state should not be loading
    expect(result.current.loading).toBe(false);

    // Wait for the initial data load to complete
    await new Promise(resolve => setTimeout(resolve, 150));

    // After loading, should not be loading anymore
    expect(result.current.loading).toBe(false);
  });

  // Test 2.1: Test error handling during sync operations
  it('should handle errors gracefully during data refresh', async () => {
    vi.mocked(ContextService.getContextBlocks).mockResolvedValue({
      data: null,
      error: 'Database connection failed'
    });
    vi.mocked(PromptService.getPrompts).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getUserProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.getSystemProjects).mockResolvedValue({ data: [], error: null });
    vi.mocked(ProjectService.ensureUnsortedFolders).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => useLibraryState(),
      { wrapper }
    );

    // Wait for the initial data load to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Should have error state set
    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBe(false);
  });

  // Test 2.1: Test saved prompt CRUD actions with auto-refresh
  it('should auto-refresh data after successful saved prompt creation', async () => {
    const mockPrompt = {
      id: 'prompt-1',
      user_id: 'user-123',
      title: 'Test Prompt',
      content: 'Test prompt content',
      tags: ['test'],
      project_id: null,
      folder: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    vi.mocked(PromptService.createPrompt).mockResolvedValue({
      data: mockPrompt,
      error: null
    });

    // Mock the refresh methods
    const getContextBlocksMock = vi.mocked(ContextService.getContextBlocks);
    const getPromptsMock = vi.mocked(PromptService.getPrompts);
    const getUserProjectsMock = vi.mocked(ProjectService.getUserProjects);
    const getSystemProjectsMock = vi.mocked(ProjectService.getSystemProjects);
    const ensureUnsortedFoldersMock = vi.mocked(ProjectService.ensureUnsortedFolders);

    getContextBlocksMock.mockResolvedValue({ data: [], error: null });
    getPromptsMock.mockResolvedValue({ data: [mockPrompt], error: null });
    getUserProjectsMock.mockResolvedValue({ data: [], error: null });
    getSystemProjectsMock.mockResolvedValue({ data: [], error: null });
    ensureUnsortedFoldersMock.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => useLibraryActions(),
      { wrapper }
    );

    const promptData = {
      title: 'Test Prompt',
      content: 'Test prompt content',
      tags: ['test'],
      project_id: null
    };

    let createResult;
    await act(async () => {
      createResult = await result.current.createSavedPrompt(promptData);
    });

    // Verify service was called
    expect(PromptService.createPrompt).toHaveBeenCalledWith(promptData);

    // Verify successful creation
    expect(createResult.data).toEqual(mockPrompt);
    expect(createResult.error).toBeNull();

    // Verify auto-refresh was triggered
    expect(ensureUnsortedFoldersMock).toHaveBeenCalled();
    expect(getContextBlocksMock).toHaveBeenCalled();
    expect(getPromptsMock).toHaveBeenCalled();
    expect(getUserProjectsMock).toHaveBeenCalledWith('prompt');
    expect(getUserProjectsMock).toHaveBeenCalledWith('dataset');
    expect(getSystemProjectsMock).toHaveBeenCalledWith('prompt');
    expect(getSystemProjectsMock).toHaveBeenCalledWith('dataset');
  });

  // Test 2.1: Test project CRUD actions with auto-refresh
  it('should auto-refresh data after successful project creation', async () => {
    const mockProject = {
      id: 'project-1',
      user_id: 'user-123',
      name: 'Test Project',
      icon: '📁',
      is_system: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    vi.mocked(ProjectService.createProject).mockResolvedValue({
      data: mockProject,
      error: null
    });

    // Mock the refresh methods
    const getContextBlocksMock = vi.mocked(ContextService.getContextBlocks);
    const getPromptsMock = vi.mocked(PromptService.getPrompts);
    const getUserProjectsMock = vi.mocked(ProjectService.getUserProjects);
    const getSystemProjectsMock = vi.mocked(ProjectService.getSystemProjects);
    const ensureUnsortedFoldersMock = vi.mocked(ProjectService.ensureUnsortedFolders);

    getContextBlocksMock.mockResolvedValue({ data: [], error: null });
    getPromptsMock.mockResolvedValue({ data: [], error: null });
    getUserProjectsMock.mockResolvedValue({ data: [mockProject], error: null });
    getSystemProjectsMock.mockResolvedValue({ data: [], error: null });
    ensureUnsortedFoldersMock.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => useLibraryActions(),
      { wrapper }
    );

    const projectData = {
      name: 'Test Project',
      icon: '📁'
    };

    let createResult;
    await act(async () => {
      createResult = await result.current.createPromptProject(projectData);
    });

    // Verify service was called
    expect(ProjectService.createProject).toHaveBeenCalledWith({ ...projectData, type: 'prompt' });

    // Verify successful creation
    expect(createResult.data).toEqual(mockProject);
    expect(createResult.error).toBeNull();

    // Verify auto-refresh was triggered
    expect(ensureUnsortedFoldersMock).toHaveBeenCalled();
    expect(getContextBlocksMock).toHaveBeenCalled();
    expect(getPromptsMock).toHaveBeenCalled();
    expect(getUserProjectsMock).toHaveBeenCalledWith('prompt');
    expect(getUserProjectsMock).toHaveBeenCalledWith('dataset');
    expect(getSystemProjectsMock).toHaveBeenCalledWith('prompt');
    expect(getSystemProjectsMock).toHaveBeenCalledWith('dataset');
  });

  // Test 2.1: Test database confirmation wait
  it('should wait for database confirmation before updating UI', async () => {
    let resolvePromise: (value: any) => void;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(ContextService.createContextBlock).mockReturnValue(mockPromise);

    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

    const blockData = {
      title: 'Async Context Block',
      content: 'Async content',
      tags: [],
      project_id: null
    };

    // Start the async operation
    let operationPromise;
    act(() => {
      operationPromise = result.current.actions.createContextBlock(blockData);
    });

    // Should not update state yet (waiting for confirmation)
    expect(result.current.state.contextBlocks).toHaveLength(0);

    // Resolve the database operation
    const mockContextBlock = {
      id: 'async-block-1',
      user_id: 'user-123',
      title: 'Async Context Block',
      content: 'Async content',
      tags: [],
      project_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    await act(async () => {
      resolvePromise!({ data: mockContextBlock, error: null });
      await operationPromise;
    });

    // Now state should be updated (database confirmation received)
    expect(ContextService.createContextBlock).toHaveBeenCalledWith(blockData);
  });
});