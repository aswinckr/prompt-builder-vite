import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SavedPromptList } from '../components/SavedPromptList';
import { ToastProvider } from '../contexts/ToastContext';
import { LibraryProvider } from '../contexts/LibraryContext';
import { SavedPrompt } from '../types/SavedPrompt';

// Mock the LibraryContext
vi.mock('../contexts/LibraryContext', async () => {
  const actual = await vi.importActual('../contexts/LibraryContext');
  return {
    ...actual,
    useLibraryActions: () => ({
      deleteSavedPrompt: vi.fn(),
    }),
  };
});

// Mock the components
vi.mock('../components/EditPromptModal', () => ({
  EditPromptModal: ({ isOpen, onClose, onSave, prompt, isLoading }: any) =>
    isOpen ? (
      <div data-testid="edit-prompt-modal">
        <h2>Edit Prompt</h2>
        <p>{prompt?.title}</p>
        <button onClick={onClose} disabled={isLoading}>
          Close
        </button>
        <button onClick={() => onSave(prompt)} disabled={isLoading}>
          Save
        </button>
      </div>
    ) : null,
}));

const mockPrompts: SavedPrompt[] = [
  {
    id: '1',
    title: 'Test Prompt 1',
    description: 'A test prompt',
    content: 'Test content',
    tags: ['test', 'prompt'],
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-02'),
    user_id: 'user1',
    project_id: 'project1',
  },
  {
    id: '2',
    title: 'Test Prompt 2',
    description: 'Another test prompt',
    content: 'Another test content',
    tags: ['test', 'example'],
    created_at: new Date('2024-01-03'),
    updated_at: new Date('2024-01-04'),
    user_id: 'user1',
    project_id: 'project1',
  },
];

describe('SavedPromptList - Delete Confirmation', () => {
  const defaultProps = {
    selectedProject: 'project1',
    prompts: mockPrompts,
    onPromptUpdate: vi.fn(),
    onPromptDelete: vi.fn(),
    onPromptLoad: vi.fn(),
  };

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <ToastProvider>
        <LibraryProvider>
          {component}
        </LibraryProvider>
      </ToastProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders prompts with delete buttons', () => {
    renderWithProviders(<SavedPromptList {...defaultProps} />);

    expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();

    const deleteButtons = screen.getAllByLabelText('Delete prompt');
    expect(deleteButtons).toHaveLength(2);
  });

  it('shows confirmation dialog when delete button is clicked', async () => {
    renderWithProviders(<SavedPromptList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete prompt');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
    });

    expect(screen.getByText(/Are you sure you want to delete 'Test Prompt 1'\?/)).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls delete functions when confirmation is confirmed', async () => {
    const mockDeleteSavedPrompt = vi.fn();
    vi.mocked(require('../contexts/LibraryContext').useLibraryActions).mockReturnValue({
      deleteSavedPrompt: mockDeleteSavedPrompt,
    } as any);

    renderWithProviders(<SavedPromptList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete prompt');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteSavedPrompt).toHaveBeenCalledWith('1');
    });

    expect(defaultProps.onPromptDelete).toHaveBeenCalledWith('1');
  });

  it('shows success toast when deletion succeeds', async () => {
    const mockDeleteSavedPrompt = vi.fn().mockResolvedValue({ data: {}, error: null });
    vi.mocked(require('../contexts/LibraryContext').useLibraryActions).mockReturnValue({
      deleteSavedPrompt: mockDeleteSavedPrompt,
    } as any);

    renderWithProviders(<SavedPromptList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete prompt');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("Prompt 'Test Prompt 1' deleted successfully")).toBeInTheDocument();
    });
  });

  it('shows error toast when deletion fails', async () => {
    const mockDeleteSavedPrompt = vi.fn().mockResolvedValue({ data: null, error: 'Failed to delete' });
    vi.mocked(require('../contexts/LibraryContext').useLibraryActions).mockReturnValue({
      deleteSavedPrompt: mockDeleteSavedPrompt,
    } as any);

    renderWithProviders(<SavedPromptList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete prompt');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete prompt. Please try again.')).toBeInTheDocument();
    });
  });

  it('does not delete when confirmation is cancelled', async () => {
    const mockDeleteSavedPrompt = vi.fn();
    vi.mocked(require('../contexts/LibraryContext').useLibraryActions).mockReturnValue({
      deleteSavedPrompt: mockDeleteSavedPrompt,
    } as any);

    renderWithProviders(<SavedPromptList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete prompt');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Delete Prompt')).not.toBeInTheDocument();
    });

    expect(mockDeleteSavedPrompt).not.toHaveBeenCalled();
    expect(defaultProps.onPromptDelete).not.toHaveBeenCalled();
  });

  it('shows loading state during deletion', async () => {
    const mockDeleteSavedPrompt = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    vi.mocked(require('../contexts/LibraryContext').useLibraryActions).mockReturnValue({
      deleteSavedPrompt: mockDeleteSavedPrompt,
    } as any);

    renderWithProviders(<SavedPromptList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete prompt');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    // Check for loading state
    expect(confirmButton).toBeDisabled();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows success toast when prompt is updated', async () => {
    renderWithProviders(<SavedPromptList {...defaultProps} />);

    // Trigger edit mode
    const editButtons = screen.getAllByLabelText('Edit prompt');
    fireEvent.click(editButtons[0]);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByTestId('edit-prompt-modal')).toBeInTheDocument();
    });

    // Save the prompt
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Prompt 'Test Prompt 1' updated successfully")).toBeInTheDocument();
    });
  });

  it('shows error toast when prompt update fails', async () => {
    const onPromptUpdate = vi.fn().mockImplementation(() => {
      throw new Error('Update failed');
    });

    renderWithProviders(<SavedPromptList {...defaultProps} onPromptUpdate={onPromptUpdate} />);

    // Trigger edit mode
    const editButtons = screen.getAllByLabelText('Edit prompt');
    fireEvent.click(editButtons[0]);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByTestId('edit-prompt-modal')).toBeInTheDocument();
    });

    // Save the prompt
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update prompt. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles empty prompts list gracefully', () => {
    renderWithProviders(<SavedPromptList {...defaultProps} prompts={[]} />);

    expect(screen.getByText('No saved prompts found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
  });
});