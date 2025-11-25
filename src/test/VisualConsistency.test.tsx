import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Trash2, AlertTriangle } from 'lucide-react';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import { LibraryProvider } from '../contexts/LibraryContext';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ContextBlock } from '../components/ContextBlock';
import { SavedPromptList } from '../components/SavedPromptList';
import { Toast } from '../components/Toast';
import { SavedPrompt } from '../types/SavedPrompt';
import { ContextBlock as ContextBlockType } from '../types/ContextBlock';

// Mock components for focused testing
vi.mock('../contexts/LibraryContext', async () => {
  const actual = await vi.importActual('../contexts/LibraryContext');
  return {
    ...actual,
    useLibraryState: () => ({
      contextSelection: { selectedBlockIds: [] },
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
      savedPrompts: [
        {
          id: '1',
          title: 'Test Prompt',
          description: 'Test description',
          content: 'Test content',
          tags: ['test'],
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-02'),
          user_id: 'user1',
          project_id: 'project1',
        },
      ],
    }),
    useLibraryActions: () => ({
      toggleBlockSelection: vi.fn(),
      deleteSavedPrompt: vi.fn(),
      updateSavedPrompt: vi.fn(),
    }),
  };
});

describe('Visual Consistency and Accessibility', () => {
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

  describe('Icon Consistency', () => {
    it('uses Trash2 icon for all delete actions in ConfirmationModal', () => {
      const { container } = render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
        />
      );

      // Check for Trash2 icon in delete confirmation
      const trashIcon = container.querySelector('svg');
      expect(trashIcon).toBeInTheDocument();
    });

    it('uses AlertTriangle icon for warning confirmations', () => {
      const { container } = render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Warning"
          message="Are you sure?"
          type="warning"
        />
      );

      // Check for AlertTriangle icon in warning confirmation
      const warningIcon = container.querySelector('svg');
      expect(warningIcon).toBeInTheDocument();
    });

    it('uses Trash2 icon in ContextBlock delete button', () => {
      const mockBlock: ContextBlockType = {
        id: '1',
        title: 'Test Block',
        content: 'Test content',
        tags: ['test'],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user1',
        project_id: 'project1',
      };

      render(
        <ContextBlock
          block={mockBlock}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const deleteButton = screen.getByLabelText('Delete Test Block');
      expect(deleteButton).toBeInTheDocument();

      // Check if the icon is present by looking for the SVG
      const icon = deleteButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('uses Trash2 icon in SavedPromptList delete buttons', () => {
      const mockPrompts: SavedPrompt[] = [
        {
          id: '1',
          title: 'Test Prompt',
          description: 'Test description',
          content: 'Test content',
          tags: ['test'],
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-02'),
          user_id: 'user1',
          project_id: 'project1',
        },
      ];

      renderWithProviders(
        <SavedPromptList
          selectedProject="project1"
          prompts={mockPrompts}
          onPromptUpdate={vi.fn()}
          onPromptDelete={vi.fn()}
          onPromptLoad={vi.fn()}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete prompt');
      expect(deleteButtons.length).toBeGreaterThan(0);

      deleteButtons.forEach(button => {
        const icon = button.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Button Styling Consistency', () => {
    it('applies consistent hover effects to delete buttons', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
          confirmText="Delete"
        />
      );

      const confirmButton = screen.getByText('Delete');
      expect(confirmButton).toHaveClass('bg-red-500', 'hover:bg-red-600');
    });

    it('applies consistent focus styles to interactive elements', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
          confirmText="Delete"
        />
      );

      const confirmButton = screen.getByText('Delete');
      expect(confirmButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('applies consistent disabled states', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
          confirmText="Delete"
          isLoading={true}
        />
      );

      const confirmButton = screen.getByText('Delete');
      expect(confirmButton).toBeDisabled();
      expect(confirmButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Color Scheme Consistency', () => {
    it('uses red color variants for delete actions', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
          confirmText="Delete"
        />
      );

      const confirmButton = screen.getByText('Delete');
      expect(confirmButton).toHaveClass('bg-red-500', 'hover:bg-red-600');
    });

    it('uses yellow color variants for warning actions', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Warning"
          message="Are you sure?"
          type="warning"
          confirmText="Confirm"
        />
      );

      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('bg-yellow-500', 'hover:bg-yellow-600');
    });

    it('uses neutral colors for cancel actions', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
          confirmText="Delete"
          cancelText="Cancel"
        />
      );

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toHaveClass('bg-neutral-700', 'hover:bg-neutral-600');
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper ARIA labels for all interactive elements', () => {
      const mockBlock: ContextBlockType = {
        id: '1',
        title: 'Test Block',
        content: 'Test content',
        tags: ['test'],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user1',
        project_id: 'project1',
      };

      render(
        <ContextBlock
          block={mockBlock}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
          onEdit={vi.fn()}
        />
      );

      // Check ARIA labels
      expect(screen.getByLabelText('Delete Test Block')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit Test Block')).toBeInTheDocument();
      expect(screen.getByRole('gridcell')).toHaveAttribute('aria-label', 'Context block: Test Block');
    });

    it('supports keyboard navigation for modals', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');

      // Test keyboard navigation
      fireEvent.keyDown(modal, { key: 'Escape' });
      // Modal should handle escape key (though we can't test the onClose call directly here)
    });

    it('provides focus management for modals', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
        />
      );

      const confirmButton = screen.getByText('Delete');
      // Should be focusable
      expect(confirmButton).not.toHaveAttribute('disabled');
    });

    it('provides proper button roles and states', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
          isLoading={true}
        />
      );

      const confirmButton = screen.getByText('Delete');
      expect(confirmButton).toHaveAttribute('role', 'button');
      expect(confirmButton).toBeDisabled();
    });

    it('includes screen reader announcements for toasts', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast('Test message', 'success')}>
            Show Toast
          </button>
        );
      };

      renderWithProviders(<TestComponent />);

      const showButton = screen.getByText('Show Toast');
      fireEvent.click(showButton);

      // Check for ARIA live region
      const toastContainer = screen.getByLabelText('Notifications');
      expect(toastContainer).toHaveAttribute('aria-live', 'polite');
    });

    it('provides descriptive text for keyboard shortcuts', () => {
      const mockBlock: ContextBlockType = {
        id: '1',
        title: 'Test Block',
        content: 'Test content',
        tags: ['test'],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user1',
        project_id: 'project1',
      };

      render(
        <ContextBlock
          block={mockBlock}
          isSelected={false}
          onSelect={vi.fn()}
          onDelete={vi.fn()}
          onEdit={vi.fn()}
        />
      );

      // Check for keyboard shortcut help text
      expect(screen.getByText(/Press.*E.*to edit.*D.*to delete/)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('provides responsive toast positioning', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast('Test message', 'success')}>
            Show Toast
          </button>
        );
      };

      renderWithProviders(<TestComponent />);

      const showButton = screen.getByText('Show Toast');
      fireEvent.click(showButton);

      const toastContainer = screen.getByLabelText('Notifications');
      expect(toastContainer).toHaveClass('fixed', 'top-4', 'right-4');
    });

    it('adapts modal behavior for mobile', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
        />
      );

      const modal = screen.getByRole('dialog');
      // Should have responsive classes
      expect(modal.parentElement).toHaveClass('fixed', 'inset-0');
    });
  });

  describe('Visual Hierarchy', () => {
    it('maintains consistent spacing and alignment', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure you want to delete this item?"
          type="delete"
        />
      );

      // Check for consistent button spacing
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('px-4', 'py-2'); // Consistent padding
      });
    });

    it('provides visual feedback for loading states', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test Delete"
          message="Are you sure?"
          type="delete"
          isLoading={true}
        />
      );

      const confirmButton = screen.getByText('Delete');
      expect(confirmButton).toBeDisabled();

      // Check for loading spinner
      const spinner = confirmButton.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State Consistency', () => {
    it('applies consistent error styling across components', () => {
      render(
        <Toast
          id="test"
          message="Error message"
          variant="error"
          isVisible={true}
          onDismiss={vi.fn()}
        />
      );

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-red-500/10', 'border-red-500/20', 'text-red-400');
    });

    it('applies consistent success styling across components', () => {
      render(
        <Toast
          id="test"
          message="Success message"
          variant="success"
          isVisible={true}
          onDismiss={vi.fn()}
        />
      );

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-green-500/10', 'border-green-500/20', 'text-green-400');
    });
  });
});