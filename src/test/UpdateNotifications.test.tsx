import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import { LibraryProvider } from '../contexts/LibraryContext';
import { EditContextModal } from '../components/EditContextModal';
import { EditPromptModal } from '../components/EditPromptModal';
import { SavedPrompt } from '../types/SavedPrompt';
import { ContextBlock } from '../types/ContextBlock';

// Mock the components
vi.mock('../components/TipTapEditor', () => ({
  TipTapEditor: ({ content, onUpdate, editable }: any) => (
    <div data-testid="tip-tap-editor">
      <textarea
        value={content}
        onChange={(e) => onUpdate({ html: e.target.value, json: null, text: e.target.value })}
        disabled={!editable}
        placeholder="Test editor"
      />
    </div>
  ),
}));

// Mock the LibraryContext
vi.mock('../contexts/LibraryContext', async () => {
  const actual = await vi.importActual('../contexts/LibraryContext');
  return {
    ...actual,
    useLibraryState: () => ({
      contextBlocks: [
        {
          id: '1',
          title: 'Test Context Block',
          content: 'Test content',
          tags: ['test'],
          created_at: new Date(),
          updated_at: new Date(),
          user_id: 'user1',
          project_id: 'project1',
        },
      ],
    }),
    useLibraryActions: () => ({
      updateContextBlock: vi.fn(),
    }),
  };
});

const mockPrompt: SavedPrompt = {
  id: '1',
  title: 'Test Prompt',
  description: 'Test description',
  content: 'Test content',
  tags: ['test'],
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-02'),
  user_id: 'user1',
  project_id: 'project1',
};

describe('Update Notifications', () => {
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

  describe('EditContextModal Notifications', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      blockId: '1',
    };

    it('shows success toast when context block update succeeds', async () => {
      const mockUpdateContextBlock = vi.fn().mockResolvedValue({ data: {}, error: null });
      vi.mocked(require('../contexts/LibraryContext').useLibraryActions).mockReturnValue({
        updateContextBlock: mockUpdateContextBlock,
      } as any);

      renderWithProviders(<EditContextModal {...defaultProps} />);

      // Change title to trigger hasChanges
      const titleInput = screen.getByDisplayValue('Test Context Block');
      fireEvent.change(titleInput, { target: { value: 'Updated Context Block' } });

      // Click save button
      const saveButton = screen.getByText('Update Knowledge');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Context block 'Updated Context Block' updated successfully")).toBeInTheDocument();
      });

      expect(mockUpdateContextBlock).toHaveBeenCalledWith('1', {
        title: 'Updated Context Block',
        content: 'Test content',
      });
    });

    it('shows error toast when context block update fails', async () => {
      const mockUpdateContextBlock = vi.fn().mockResolvedValue({ data: null, error: 'Database error' });
      vi.mocked(require('../contexts/LibraryContext').useLibraryActions).mockReturnValue({
        updateContextBlock: mockUpdateContextBlock,
      } as any);

      renderWithProviders(<EditContextModal {...defaultProps} />);

      // Change title to trigger hasChanges
      const titleInput = screen.getByDisplayValue('Test Context Block');
      fireEvent.change(titleInput, { target: { value: 'Updated Context Block' } });

      // Click save button
      const saveButton = screen.getByText('Update Knowledge');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to update context block. Please try again.')).toBeInTheDocument();
      });

      expect(mockUpdateContextBlock).toHaveBeenCalled();
    });

    it('shows error toast when context block update throws exception', async () => {
      const mockUpdateContextBlock = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.mocked(require('../contexts/LibraryContext').useLibraryActions).mockReturnValue({
        updateContextBlock: mockUpdateContextBlock,
      } as any);

      renderWithProviders(<EditContextModal {...defaultProps} />);

      // Change title to trigger hasChanges
      const titleInput = screen.getByDisplayValue('Test Context Block');
      fireEvent.change(titleInput, { target: { value: 'Updated Context Block' } });

      // Click save button
      const saveButton = screen.getByText('Update Knowledge');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to update context block. Please try again.')).toBeInTheDocument();
      });

      expect(mockUpdateContextBlock).toHaveBeenCalled();
    });

    it('shows validation error when title is empty', async () => {
      renderWithProviders(<EditContextModal {...defaultProps} />);

      // Clear title
      const titleInput = screen.getByDisplayValue('Test Context Block');
      fireEvent.change(titleInput, { target: { value: '' } });

      // Click save button
      const saveButton = screen.getByText('Update Knowledge');
      fireEvent.click(saveButton);

      // Should show inline validation error
      expect(screen.getByText('Please enter a title')).toBeInTheDocument();
    });

    it('shows validation error when content is empty', async () => {
      renderWithProviders(<EditContextModal {...defaultProps} />);

      // Clear content
      const editor = screen.getByTestId('tip-tap-editor').querySelector('textarea');
      if (editor) {
        fireEvent.change(editor, { target: { value: '' } });
      }

      // Click save button
      const saveButton = screen.getByText('Update Knowledge');
      fireEvent.click(saveButton);

      // Should show inline validation error
      expect(screen.getByText('Please enter some content')).toBeInTheDocument();
    });
  });

  describe('EditPromptModal Notifications', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      onSave: vi.fn(),
      prompt: mockPrompt,
    };

    it('shows success toast when prompt update succeeds', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      renderWithProviders(<EditPromptModal {...defaultProps} onSave={mockOnSave} />);

      // Change title to trigger hasChanges
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: 'Updated Prompt' } });

      // Click save button
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Prompt 'Updated Prompt' updated successfully")).toBeInTheDocument();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockPrompt,
        title: 'Updated Prompt',
        content: 'Test description',
        description: 'Test description',
        updated_at: expect.any(Date),
      });
    });

    it('shows error toast when prompt update fails', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Update failed'));
      renderWithProviders(<EditPromptModal {...defaultProps} onSave={mockOnSave} />);

      // Change title to trigger hasChanges
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: 'Updated Prompt' } });

      // Click save button
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to update prompt. Please try again.')).toBeInTheDocument();
      });

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('shows validation error when title is empty', async () => {
      renderWithProviders(<EditPromptModal {...defaultProps} />);

      // Clear title
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: '' } });

      // Click save button
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a title for the prompt')).toBeInTheDocument();
      });
    });

    it('shows loading state during save', async () => {
      const mockOnSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      renderWithProviders(<EditPromptModal {...defaultProps} onSave={mockOnSave} />);

      // Change title to trigger hasChanges
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: 'Updated Prompt' } });

      // Click save button
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      // Check for loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
    });

    it('disables save button when no changes made', () => {
      renderWithProviders(<EditPromptModal {...defaultProps} />);

      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
    });

    it('enables save button when changes are made', () => {
      renderWithProviders(<EditPromptModal {...defaultProps} />);

      // Change title
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: 'Updated Prompt' } });

      const saveButton = screen.getByText('Save');
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Toast positioning and stacking', () => {
    it('shows multiple toasts stacked correctly', async () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <div>
            <button onClick={() => showToast('First toast', 'success')}>
              Show First
            </button>
            <button onClick={() => showToast('Second toast', 'error')}>
              Show Second
            </button>
          </div>
        );
      };

      renderWithProviders(<TestComponent />);

      // Show first toast
      fireEvent.click(screen.getByText('Show First'));
      await waitFor(() => {
        expect(screen.getByText('First toast')).toBeInTheDocument();
      });

      // Show second toast
      fireEvent.click(screen.getByText('Show Second'));
      await waitFor(() => {
        expect(screen.getByText('Second toast')).toBeInTheDocument();
      });

      // Check that both toasts are visible
      expect(screen.getByText('First toast')).toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();

      // Check toast container positioning
      const toastContainer = screen.getByLabelText('Notifications');
      expect(toastContainer).toHaveClass('fixed', 'top-4', 'right-4');
    });
  });
});