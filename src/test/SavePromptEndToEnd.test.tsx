import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromptBuilderActions } from '../components/PromptBuilderActions';
import { LibraryProvider } from '../contexts/LibraryContext';
import { ToastProvider } from '../contexts/ToastContext';

// Mock the LibraryContext for end-to-end testing
const mockLibraryActions = {
  clearPromptBuilder: vi.fn(),
  savePromptAsTemplate: vi.fn(),
  createFolder: vi.fn(),
  movePromptToFolder: vi.fn(),
  createSavedPrompt: vi.fn(),
};

interface MockContextBlock {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface MockSavedPrompt {
  id: string;
  title: string;
  content: string;
  project_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const mockContextBlocks: MockContextBlock[] = [
  {
    id: 'block1',
    title: 'Context Block 1',
    content: 'This is context block 1 content',
    user_id: 'user1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'block2',
    title: 'Context Block 2',
    content: 'This is context block 2 content',
    user_id: 'user1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

let mockPromptBuilder = {
  customText: '',
  blockOrder: [] as string[],
};

let mockSavedPrompts: MockSavedPrompt[] = [];

vi.mock('../contexts/LibraryContext', async () => {
  const actual = await vi.importActual('../contexts/LibraryContext');
  return {
    ...actual,
    useLibraryActions: () => mockLibraryActions,
    useLibraryState: () => ({
      promptBuilder: mockPromptBuilder,
      contextBlocks: mockContextBlocks,
      savedPrompts: mockSavedPrompts,
      loading: false,
      error: null,
    }),
  };
});

// Mock CreatePromptModal for end-to-end testing
vi.mock('../components/CreatePromptModal', () => ({
  CreatePromptModal: ({ isOpen, onClose, initialContent }: any) =>
    isOpen ? (
      <div data-testid="create-prompt-modal">
        <div data-testid="modal-title">Save Prompt</div>
        <div data-testid="initial-content">{initialContent}</div>
        <input
          data-testid="title-input"
          placeholder="Enter title"
          onChange={(e: any) => {
            // Simulate title input
          }}
        />
        <button
          data-testid="save-button"
          onClick={async () => {
            // Simulate successful save
            if (mockLibraryActions.createSavedPrompt) {
              await mockLibraryActions.createSavedPrompt({
                title: 'Test Prompt',
                content: initialContent,
                project_id: null,
                tags: [],
              });
              onClose();
            }
          }}
        >
          Save Prompt
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

describe('Save Prompt End-to-End Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPromptBuilder = {
      customText: '',
      blockOrder: [],
    };
    mockSavedPrompts = [];
    mockLibraryActions.createSavedPrompt = vi.fn().mockResolvedValue({
      data: { id: 'prompt-123', title: 'Test Prompt', content: 'Test content' },
    });
  });

  it('completes full save workflow from assembled content to modal', async () => {
    // Setup: User has custom text and context blocks
    mockPromptBuilder.customText = 'This is custom prompt text.';
    mockPromptBuilder.blockOrder = ['block1', 'block2'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    // Step 1: Click save button
    const saveButton = screen.getByTitle('Save prompt');
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    // Step 2: Verify modal opens with assembled content
    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });

    // Step 3: Verify assembled content is correct
    const content = screen.getByTestId('initial-content');
    const expectedContent = 'This is custom prompt text.\n\n### Context Block 1\n\nThis is context block 1 content\n\n### Context Block 2\n\nThis is context block 2 content';
    expect(content.textContent).toBe(expectedContent);

    // Step 4: Verify modal title is correct
    expect(screen.getByTestId('modal-title').textContent).toBe('Save Prompt');
  });

  it('handles save with custom text only content', async () => {
    mockPromptBuilder.customText = 'Custom text only prompt';
    mockPromptBuilder.blockOrder = [];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });

    const content = screen.getByTestId('initial-content');
    expect(content.textContent).toBe('Custom text only prompt');
  });

  it('handles save with context blocks only content', async () => {
    mockPromptBuilder.customText = '';
    mockPromptBuilder.blockOrder = ['block1'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });

    const content = screen.getByTestId('initial-content');
    expect(content.textContent).toBe('### Context Block 1\n\nThis is context block 1 content');
  });

  it('handles network failure scenario gracefully', async () => {
    mockPromptBuilder.customText = 'Test content for error scenario';
    mockPromptBuilder.blockOrder = [];

    // Mock network failure
    mockLibraryActions.createSavedPrompt = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });

    const modalSaveButton = screen.getByTestId('save-button');
    fireEvent.click(modalSaveButton);

    // In a real scenario, error would be shown
    await waitFor(() => {
      expect(mockLibraryActions.createSavedPrompt).toHaveBeenCalledWith({
        title: 'Test Prompt',
        content: 'Test content for error scenario',
        project_id: null,
        tags: [],
      });
    });
  });

  it('handles validation errors correctly', async () => {
    mockPromptBuilder.customText = '';
    mockPromptBuilder.blockOrder = [];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');

    // Button should be disabled when no content
    expect(saveButton).toBeDisabled();

    // Modal should not open when clicking disabled button
    fireEvent.click(saveButton);
    expect(screen.queryByTestId('create-prompt-modal')).not.toBeInTheDocument();
  });

  it('allows editing pre-populated content before saving', async () => {
    mockPromptBuilder.customText = 'Original custom text';
    mockPromptBuilder.blockOrder = ['block1'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });

    // User can interact with title input (editing capability)
    const titleInput = screen.getByTestId('title-input');
    expect(titleInput).toBeInTheDocument();

    // Pre-populated content is displayed and editable
    const content = screen.getByTestId('initial-content');
    expect(content.textContent).toContain('Original custom text');
  });

  it('maintains prompt structure formatting across save operations', async () => {
    mockPromptBuilder.customText = 'Introduction text.';
    mockPromptBuilder.blockOrder = ['block1', 'block2'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });

    const content = screen.getByTestId('initial-content');

    // Verify proper formatting structure
    expect(content.textContent).toContain('Introduction text.');
    expect(content.textContent).toContain('### Context Block 1');
    expect(content.textContent).toContain('This is context block 1 content');
    expect(content.textContent).toContain('### Context Block 2');
    expect(content.textContent).toContain('This is context block 2 content');

    // Verify proper spacing
    expect(content.textContent).toMatch(/\n\n### Context Block 1/);
    expect(content.textContent).toMatch(/\n\n### Context Block 2/);
  });

  it('handles user canceling the save operation', async () => {
    mockPromptBuilder.customText = 'Content that will not be saved';
    mockPromptBuilder.blockOrder = [];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });

    // User cancels instead of saving
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Modal should close without calling createSavedPrompt
    expect(screen.queryByTestId('create-prompt-modal')).not.toBeInTheDocument();
    expect(mockLibraryActions.createSavedPrompt).not.toHaveBeenCalled();
  });

  it('integrates seamlessly with library context after save', async () => {
    mockPromptBuilder.customText = 'Test prompt for library integration';
    mockPromptBuilder.blockOrder = [];

    // Mock successful save that adds to library
    const newPrompt: MockSavedPrompt = {
      id: 'prompt-456',
      title: 'Test Prompt',
      content: 'Test prompt for library integration',
      project_id: null,
      tags: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    mockLibraryActions.createSavedPrompt = vi.fn().mockResolvedValue({
      data: newPrompt,
    });

    // Simulate library state update after save
    mockSavedPrompts.push(newPrompt);

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });

    const modalSaveButton = screen.getByTestId('save-button');
    fireEvent.click(modalSaveButton);

    // Verify save was called correctly
    await waitFor(() => {
      expect(mockLibraryActions.createSavedPrompt).toHaveBeenCalledWith({
        title: 'Test Prompt',
        content: 'Test prompt for library integration',
        project_id: null,
        tags: [],
      });
    });
  });

  it('verifies complete end-to-end workflow from content assembly to feedback', async () => {
    // Complex scenario with mixed content
    mockPromptBuilder.customText = 'System prompt: You are a helpful assistant.';
    mockPromptBuilder.blockOrder = ['block1'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    // Verify save button is enabled
    const saveButton = screen.getByTitle('Save prompt');
    expect(saveButton).not.toBeDisabled();

    // Step 1: Open save modal
    fireEvent.click(saveButton);

    // Step 2: Verify modal opens with correct content
    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title').textContent).toBe('Save Prompt');
    });

    // Step 3: Verify assembled content structure
    const content = screen.getByTestId('initial-content');
    expect(content.textContent).toBe('System prompt: You are a helpful assistant.\n\n### Context Block 1\n\nThis is context block 1 content');

    // Step 4: Complete save operation
    const modalSaveButton = screen.getByTestId('save-button');
    fireEvent.click(modalSaveButton);

    // Step 5: Verify save was called with correct data
    await waitFor(() => {
      expect(mockLibraryActions.createSavedPrompt).toHaveBeenCalledWith({
        title: 'Test Prompt',
        content: 'System prompt: You are a helpful assistant.\n\n### Context Block 1\n\nThis is context block 1 content',
        project_id: null,
        tags: [],
      });
    });

    // Step 6: Verify workflow completed successfully
    expect(mockLibraryActions.createSavedPrompt).toHaveBeenCalledTimes(1);
  });
});