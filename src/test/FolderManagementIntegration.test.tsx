import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { FolderActionMenu } from '../components/FolderActionMenu';
import { RenameFolderModal } from '../components/RenameFolderModal';
import { DeleteFolderModal } from '../components/DeleteFolderModal';

// Mock Projects for integration testing
const mockUserPromptProject = {
  id: 'user-prompt-1',
  user_id: 'user1',
  name: 'My Prompts',
  icon: '📝',
  is_system: false,
  created_at: new Date(),
  updated_at: new Date()
};

const mockUserDatasetProject = {
  id: 'user-dataset-1',
  user_id: 'user1',
  name: 'My Datasets',
  icon: '📊',
  is_system: false,
  created_at: new Date(),
  updated_at: new Date()
};

const mockSystemProject = {
  id: 'system-1',
  user_id: 'user1',
  name: 'Unsorted',
  icon: '📁',
  is_system: true,
  created_at: new Date(),
  updated_at: new Date()
};

describe('Folder Management Integration Tests', () => {
  const mockOnRename = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Rename Workflow', () => {
    it('should handle complete rename workflow from menu to modal submission', async () => {
      const mockRenameSubmit = jest.fn().mockResolvedValue(undefined);

      // Step 1: Show action menu
      render(
        <FolderActionMenu
          folder={mockUserPromptProject}
          type="prompts"
          onRename={mockOnRename}
          onDelete={mockOnDelete}
        />
      );

      const actionButton = screen.getByRole('button', { name: /Actions for/i });
      expect(actionButton).toBeInTheDocument();

      // Step 2: Open context menu
      await userEvent.click(actionButton);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
      });

      // Step 3: Click rename
      const renameItem = screen.getByRole('menuitem', { name: /rename/i });
      await userEvent.click(renameItem);

      // Verify rename callback is called
      expect(mockOnRename).toHaveBeenCalledWith(mockUserPromptProject, 'prompts');
    });

    it('should handle rename modal functionality end-to-end', async () => {
      const mockRenameSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserPromptProject}
          type="prompts"
          loading={false}
        />
      );

      // Verify modal opens with correct folder name
      expect(screen.getByText(/Rename Prompt Folder/)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUserPromptProject.name)).toBeInTheDocument();

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      // Change name and submit
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Updated Prompts');
      await userEvent.click(submitButton);

      // Verify submission with correct data
      await waitFor(() => {
        expect(mockRenameSubmit).toHaveBeenCalledWith({
          name: 'Updated Prompts',
          folderId: mockUserPromptProject.id,
          type: 'prompts'
        });
      });
    });

    it('should handle rename for both prompt and dataset folders', async () => {
      const mockRenameSubmit = jest.fn().mockResolvedValue(undefined);

      // Test prompt folder
      const { rerender } = render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserPromptProject}
          type="prompts"
          loading={false}
        />
      );

      expect(screen.getByText(/Rename Prompt Folder/)).toBeInTheDocument();

      // Test dataset folder
      rerender(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserDatasetProject}
          type="datasets"
          loading={false}
        />
      );

      expect(screen.getByText(/Rename Dataset Folder/)).toBeInTheDocument();
    });
  });

  describe('Complete Delete Workflow', () => {
    it('should handle complete delete workflow from menu to confirmation', async () => {
      // Step 1: Show action menu
      render(
        <FolderActionMenu
          folder={mockUserDatasetProject}
          type="datasets"
          onRename={mockOnRename}
          onDelete={mockOnDelete}
        />
      );

      const actionButton = screen.getByRole('button', { name: /Actions for/i });

      // Step 2: Open context menu
      await userEvent.click(actionButton);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
      });

      // Step 3: Click delete
      const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
      await userEvent.click(deleteItem);

      // Verify delete callback is called
      expect(mockOnDelete).toHaveBeenCalledWith(mockUserDatasetProject, 'datasets');
    });

    it('should show appropriate delete confirmation for user folders', async () => {
      render(
        <DeleteFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          folder={mockUserPromptProject}
          type="prompts"
          isLoading={false}
          contentCount={5}
        />
      );

      // Verify delete confirmation message
      expect(screen.getByText(/Delete Prompt Folder/)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`Are you sure you want to delete "${mockUserPromptProject.name}"?`))).toBeInTheDocument();
      expect(screen.getByText(/contains 5 prompts that will be permanently deleted/)).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();

      // Should have delete button
      expect(screen.getByRole('button', { name: /Delete Folder and Contents/i })).toBeInTheDocument();
    });

    it('should show appropriate message for empty folders', async () => {
      render(
        <DeleteFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          folder={mockUserDatasetProject}
          type="datasets"
          isLoading={false}
          contentCount={0}
        />
      );

      expect(screen.getByText(/This folder is empty/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete Folder/i })).toBeInTheDocument();
    });

    it('should protect system folders from deletion', async () => {
      render(
        <DeleteFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          folder={mockSystemProject}
          type="prompts"
          isLoading={false}
        />
      );

      // Should show protection message
      expect(screen.getByText(/Cannot Delete System Folder/)).toBeInTheDocument();
      expect(screen.getByText(/is a system folder and cannot be deleted/)).toBeInTheDocument();

      // Should only have OK button
      expect(screen.getByRole('button', { name: /OK/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  describe('State Synchronization Between Components', () => {
    it('should maintain consistent folder type information', async () => {
      const mockRenameSubmit = jest.fn().mockResolvedValue(undefined);

      // Test prompt folder workflow
      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserPromptProject}
          type="prompts"
          loading={false}
        />
      );

      const submitButton = screen.getByRole('button', { name: /rename folder/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRenameSubmit).toHaveBeenCalledWith({
          name: mockUserPromptProject.name,
          folderId: mockUserPromptProject.id,
          type: 'prompts'
        });
      });
    });

    it('should handle error states without breaking component state', async () => {
      const mockRenameSubmit = jest.fn().mockRejectedValue(new Error('Network error'));

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserPromptProject}
          type="prompts"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      // Attempt to submit with error
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'New Name');
      await userEvent.click(submitButton);

      // Component should remain functional after error
      await waitFor(() => {
        expect(mockRenameSubmit).toHaveBeenCalled();
      });

      // UI elements should still be present and usable
      expect(nameInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(nameInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });

    it('should properly handle folder type distinction throughout workflow', async () => {
      // Test that prompt and dataset folders are handled correctly
      const { rerender } = render(
        <FolderActionMenu
          folder={mockUserPromptProject}
          type="prompts"
          onRename={mockOnRename}
          onDelete={mockOnDelete}
        />
      );

      // Should show menu for prompt folder
      expect(screen.getByRole('button', { name: /Actions for My Prompts/i })).toBeInTheDocument();

      // Re-render with dataset folder
      rerender(
        <FolderActionMenu
          folder={mockUserDatasetProject}
          type="datasets"
          onRename={mockOnRename}
          onDelete={mockOnDelete}
        />
      );

      // Should show menu for dataset folder
      expect(screen.getByRole('button', { name: /Actions for My Datasets/i })).toBeInTheDocument();
    });
  });

  describe('User Interaction Flow and Accessibility', () => {
    it('should support complete keyboard workflow', async () => {
      const mockRenameSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserPromptProject}
          type="prompts"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);

      // Focus should be on input when modal opens
      expect(nameInput).toHaveFocus();

      // Change name using keyboard
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Keyboard Test Name');

      // Submit using Enter key
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockRenameSubmit).toHaveBeenCalledWith({
          name: 'Keyboard Test Name',
          folderId: mockUserPromptProject.id,
          type: 'prompts'
        });
      });
    });

    it('should handle cancellation properly throughout workflow', async () => {
      const mockRenameSubmit = jest.fn();

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserPromptProject}
          type="prompts"
          loading={false}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      // Should call close handler
      expect(mockOnClose).toHaveBeenCalled();

      // Should not call rename submit
      expect(mockRenameSubmit).not.toHaveBeenCalled();
    });

    it('should handle rapid user interactions gracefully', async () => {
      render(
        <FolderActionMenu
          folder={mockUserPromptProject}
          type="prompts"
          onRename={mockOnRename}
          onDelete={mockOnDelete}
        />
      );

      const actionButton = screen.getByRole('button', { name: /Actions for My Prompts/i });

      // Rapid clicks should not cause errors
      await userEvent.click(actionButton);
      await userEvent.click(actionButton); // Should close menu
      await userEvent.click(actionButton); // Should reopen menu

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Error Recovery', () => {
    it('should handle validation errors correctly', async () => {
      const mockRenameSubmit = jest.fn();

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserPromptProject}
          type="prompts"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      // Try to submit with empty name
      await userEvent.clear(nameInput);
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/folder name is required/i)).toBeInTheDocument();
      });

      // Should not call submit function
      expect(mockRenameSubmit).not.toHaveBeenCalled();

      // Should show input as invalid
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should handle character limit validation', async () => {
      const mockRenameSubmit = jest.fn();

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserPromptProject}
          type="prompts"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);
      const submitButton = screen.getByRole('button', { name: /rename folder/i });

      // Try to submit with name exceeding limit
      const longName = 'A'.repeat(100);
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, longName);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/folder name must be 50 characters or less/i)).toBeInTheDocument();
        expect(screen.getByText('100/50')).toBeInTheDocument();
      });

      expect(mockRenameSubmit).not.toHaveBeenCalled();
    });

    it('should maintain accessibility during error states', async () => {
      const mockRenameSubmit = jest.fn().mockRejectedValue(new Error('Test error'));

      render(
        <RenameFolderModal
          isOpen={true}
          onClose={mockOnClose}
          onRename={mockRenameSubmit}
          folder={mockUserPromptProject}
          type="prompts"
          loading={false}
        />
      );

      const nameInput = screen.getByLabelText(/folder name/i);

      // Focus should be on input initially
      expect(nameInput).toHaveFocus();

      // Attempt to submit and cause error
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Test Name');

      const submitButton = screen.getByRole('button', { name: /rename folder/i });
      await userEvent.click(submitButton);

      // After error, focus should return to input for correction
      await waitFor(() => {
        expect(nameInput).toHaveFocus();
      });

      // Error should be announced to screen readers
      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
});