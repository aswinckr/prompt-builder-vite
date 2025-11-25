import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePromptModal } from '../components/CreatePromptModal';
import { LibraryProvider } from '../contexts/LibraryContext';
import { ToastProvider } from '../contexts/ToastContext';

// Mock the LibraryContext to provide test data
const mockLibraryActions = {
  createSavedPrompt: vi.fn(),
};

// Mock LibraryContext to return our test data
vi.mock('../contexts/LibraryContext', async () => {
  const actual = await vi.importActual('../contexts/LibraryContext');
  return {
    ...actual,
    useLibraryActions: () => mockLibraryActions,
    useLibraryState: () => ({
      promptBuilder: { customText: '', blockOrder: [] },
      contextBlocks: [],
      savedPrompts: [],
      loading: false,
      error: null,
    }),
  };
});

// Mock TipTapEditor to avoid complex editor initialization
vi.mock('../components/TipTapEditor', () => ({
  TipTapEditor: ({ content, onUpdate }: any) => (
    <textarea
      data-testid="tip-tap-editor"
      defaultValue={content || ''}
      onChange={(e) => {
        onUpdate?.({
          html: e.target.value,
          json: null,
          text: e.target.value,
        });
      }}
    />
  ),
}));

describe('Save Prompt Modal Integration', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with "Save Prompt" title when initialContent is provided', () => {
    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            initialContent="This is pre-populated content from the prompt builder"
          />
        </LibraryProvider>
      </ToastProvider>
    );

    expect(screen.getByText('Save Prompt')).toBeInTheDocument();
    expect(screen.getByTestId('tip-tap-editor')).toBeInTheDocument();
  });

  it('renders modal with "Add Prompt" title when no initial content provided', () => {
    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal {...defaultProps} />
        </LibraryProvider>
      </ToastProvider>
    );

    expect(screen.getByText('Add Prompt')).toBeInTheDocument();
    expect(screen.getByTestId('tip-tap-editor')).toBeInTheDocument();
  });

  it('handles modal close behavior without saving', async () => {
    const onClose = vi.fn();
    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            onClose={onClose}
            initialContent="Test content"
          />
        </LibraryProvider>
      </ToastProvider>
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('validates form correctly with pre-populated data', async () => {
    mockLibraryActions.createSavedPrompt.mockResolvedValue({ data: { id: '123' } });

    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            initialContent="Pre-populated content"
          />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByText('Save Prompt');
    fireEvent.click(saveButton);

    // Should show validation error for missing title
    expect(screen.getByText('Please enter a title')).toBeInTheDocument();
  });

  it('allows editing pre-populated content before saving', async () => {
    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            initialContent="Original content"
          />
        </LibraryProvider>
      </ToastProvider>
    );

    const titleInput = screen.getByPlaceholderText('Enter a descriptive title for this prompt template');
    const descriptionInput = screen.getByPlaceholderText('Optional description about how to use this prompt (optional)');

    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    expect(titleInput).toHaveValue('Test Title');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  it('calls createSavedPrompt with correct data when form is submitted', async () => {
    const mockCreateSavedPrompt = vi.fn().mockResolvedValue({ data: { id: '123' } });
    mockLibraryActions.createSavedPrompt = mockCreateSavedPrompt;

    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            initialContent="Test prompt content"
          />
        </LibraryProvider>
      </ToastProvider>
    );

    const titleInput = screen.getByPlaceholderText('Enter a descriptive title for this prompt template');
    fireEvent.change(titleInput, { target: { value: 'Test Prompt Title' } });

    const saveButton = screen.getByText('Save Prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreateSavedPrompt).toHaveBeenCalledWith({
        title: 'Test Prompt Title',
        description: null,
        content: 'Test prompt content',
        project_id: null,
        tags: [],
      });
    });
  });
});