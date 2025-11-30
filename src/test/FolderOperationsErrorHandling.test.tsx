import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { FolderActionMenu } from '../components/FolderActionMenu';
import { RenameFolderModal } from '../components/RenameFolderModal';
import { DeleteFolderModal } from '../components/DeleteFolderModal';

// Mock ProjectService for error scenarios
const mockProjectService = {
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
};

jest.mock('../services/projectService', () => ({
  ProjectService: mockProjectService
}));

// Mock Projects
const mockUserProject = {
  id: 'user-project-1',
  user_id: 'user1',
  name: 'User Project',
  icon: '📁',
  is_system: false,
  created_at: new Date(),
  updated_at: new Date()
};

const mockSystemProject = {
  id: 'system-project-1',
  user_id: 'user1',
  name: 'Unsorted',
  icon: '📁',
  is_system: true,
  created_at: new Date(),
  updated_at: new Date()
};

describe('Folder Operations Error Handling', () => {
  const mockOnRename = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockProjectService.updateProject.mockResolvedValue({ data: null, error: null });
    mockProjectService.deleteProject.mockResolvedValue({ data: null, error: null });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors during rename operation with retry option', async () => {
      // Simulate network error
      mockProjectService.updateProject.mockRejectedValue(new Error('Network error: Failed to fetch'));

      const mockRenameSubmit = jest.fn().mockRejectedValue(new Error('Network error: Failed to fetch'));

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserProject}
          type="prompt"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      // Change the name and submit
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'New Folder Name');
      await userEvent.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/Network error: Failed to fetch/)).toBeInTheDocument();
      });

      // Verify error state
      expect(nameInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });

    it('should handle network errors during delete operation with retry option', async () => {
      // Simulate network error
      const mockDeleteConfirm = jest.fn().mockRejectedValue(new Error('Network error: Connection failed'));

      render(
        <DeleteFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockDeleteConfirm}
          folder={mockUserProject}
          type="prompt"
          isLoading={false}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete folder/i });
      await userEvent.click(deleteButton);

      // The error would be handled by the parent component, but we can verify the modal stays open
      // and the button becomes enabled again after error
      await waitFor(() => {
        expect(deleteButton).not.toBeDisabled();
      });
    });

    it('should show retry option for transient network errors', async () => {
      const mockRenameSubmit = jest.fn()
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({ data: null, error: null });

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserProject}
          type="prompt"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      // First attempt - should fail
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'New Name');
      await userEvent.click(submitButton);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/Network timeout/)).toBeInTheDocument();
      });

      // User can try again
      await userEvent.click(submitButton);

      // Second attempt should succeed
      await waitFor(() => {
        expect(mockRenameSubmit).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Concurrent Modification Handling', () => {
    it('should handle concurrent modification during rename', async () => {
      const mockRenameSubmit = jest.fn().mockRejectedValue(
        new Error('Folder was modified by another session. Please refresh and try again.')
      );

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserProject}
          type="prompt"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Conflicting Name');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Folder was modified by another session/)).toBeInTheDocument();
      });

      // Should show a refresh suggestion
      expect(screen.getByText(/Please refresh and try again/)).toBeInTheDocument();
    });

    it('should handle concurrent modification during delete', async () => {
      const mockDeleteConfirm = jest.fn().mockRejectedValue(
        new Error('Folder was already deleted by another session.')
      );

      render(
        <DeleteFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockDeleteConfirm}
          folder={mockUserProject}
          type="prompt"
          isLoading={false}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete folder/i });
      await userEvent.click(deleteButton);

      // Error would be handled by parent, but the modal should provide feedback
      await waitFor(() => {
        expect(mockDeleteConfirm).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility Error Handling', () => {
    it('should announce errors to screen readers', async () => {
      const mockRenameSubmit = jest.fn().mockRejectedValue(new Error('Validation failed'));

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserProject}
          type="prompt"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, '');
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent(/folder name is required/i);
      });
    });

    it('should maintain focus management during error states', async () => {
      const mockRenameSubmit = jest.fn().mockRejectedValue(new Error('Server error'));

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserProject}
          type="prompt"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      // Focus should be on input when modal opens
      expect(nameInput).toHaveFocus();

      // Submit form and cause error
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'New Name');
      await userEvent.click(submitButton);

      // After error, input should still be focused for correction
      await waitFor(() => {
        expect(nameInput).toHaveFocus();
      });
    });

    it('should provide keyboard navigation during error states', async () => {
      render(
        <FolderActionMenu
          folder={mockUserProject}
          type="prompt"
          onRename={mockOnRename}
          onDelete={mockOnDelete}
        />
      );

      // Open menu
      const menuButton = screen.getByRole('button', { name: /Actions for/i });
      menuButton.focus();

      // Keyboard navigation should work even in error states
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
      });

      // Should be able to navigate menu items
      await userEvent.keyboard('{ArrowDown}');
      const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
      expect(deleteItem).toHaveFocus();
    });
  });

  describe('Permission Validation', () => {
    it('should handle permission errors gracefully', async () => {
      const mockRenameSubmit = jest.fn().mockRejectedValue(
        new Error('You do not have permission to modify this folder.')
      );

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserProject}
          type="prompt"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'New Name');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/You do not have permission to modify this folder/)).toBeInTheDocument();
      });

      // Should provide clear action for user
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should handle authentication errors during operations', async () => {
      const mockDeleteConfirm = jest.fn().mockRejectedValue(
        new Error('Your session has expired. Please log in again.')
      );

      render(
        <DeleteFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockDeleteConfirm}
          folder={mockUserProject}
          type="prompt"
          isLoading={false}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete folder/i });
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteConfirm).toHaveBeenCalled();
      });

      // Error would be handled by parent with authentication redirect
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty folder names with proper error messages', async () => {
      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={jest.fn()}
          folder={mockUserProject}
          type="prompt"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      // Submit with empty name
      await userEvent.clear(nameInput);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/folder name is required/i)).toBeInTheDocument();
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should handle extremely long folder names', async () => {
      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={jest.fn()}
          folder={mockUserProject}
          type="prompt"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      // Submit with very long name
      const longName = 'A'.repeat(100);
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, longName);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/folder name must be 50 characters or less/i)).toBeInTheDocument();
        expect(screen.getByText('100/50')).toBeInTheDocument();
      });
    });

    it('should handle rapid successive operations', async () => {
      const mockRenameSubmit = jest.fn();

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserProject}
          type="prompt"
          loading={false}
        />
      );

      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      // Rapid clicks should be debounced/prevented
      await userEvent.click(submitButton);
      await userEvent.click(submitButton);
      await userEvent.click(submitButton);

      // Should only call once due to validation
      expect(mockRenameSubmit).not.toHaveBeenCalled();

      // Should show validation error instead
      await waitFor(() => {
        expect(screen.getByText(/folder name is required/i)).toBeInTheDocument();
      });
    });
  });
});