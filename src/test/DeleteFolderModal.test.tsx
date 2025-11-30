import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmationModal } from '../components/ConfirmationModal';

// Mock the Project interface
const mockProject = {
  id: '1',
  user_id: 'user1',
  name: 'Test Folder',
  icon: '📁',
  is_system: false,
  created_at: new Date(),
  updated_at: new Date()
};

describe('Delete Folder Modal Tests', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Confirmation Modal for User Folder Deletion', () => {
    it('should show delete confirmation modal for user folders', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete Prompt Folder"
          message={`Are you sure you want to delete "${mockProject.name}"? This action cannot be undone and all content in this folder will be permanently deleted.`}
          confirmText="Delete Folder"
          cancelText="Cancel"
          type="delete"
          isLoading={false}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Prompt Folder')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete.*Test Folder/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete folder/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should call onConfirm when delete button is clicked', async () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete Dataset Folder"
          message={`Are you sure you want to delete "${mockProject.name}"? This action cannot be undone.`}
          confirmText="Delete Folder"
          cancelText="Cancel"
          type="delete"
          isLoading={false}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete folder/i });
      fireEvent.click(deleteButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should show loading state during delete operation', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete Prompt Folder"
          message="Are you sure you want to delete this folder?"
          confirmText="Delete Folder"
          cancelText="Cancel"
          type="delete"
          isLoading={true}
        />
      );

      expect(screen.getByRole('button', { name: /delete folder/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
      // Check for loading spinner
      expect(screen.getByRole('button', { name: /delete folder/i })).toContainHTML('animate-spin');
    });
  });

  describe('Delete Protection for System Folders', () => {
    const systemProject = {
      ...mockProject,
      is_system: true,
      name: 'Unsorted'
    };

    it('should show different message for system folders when delete is attempted', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Cannot Delete System Folder"
          message={`"${systemProject.name}" is a system folder and cannot be deleted. System folders are required for proper application functionality.`}
          confirmText="OK"
          cancelText=""
          type="warning"
          isLoading={false}
        />
      );

      expect(screen.getByText('Cannot Delete System Folder')).toBeInTheDocument();
      expect(screen.getByText(/Unsorted.*is a system folder and cannot be deleted/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('should use warning styling for system folder protection', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Protected System Folder"
          message="This folder cannot be deleted."
          confirmText="OK"
          type="warning"
          isLoading={false}
        />
      );

      // Check that warning icon is present (not the trash icon)
      const warningIcon = document.querySelector('[data-testid="warning-icon"]') ||
                         document.querySelector('.text-yellow-400');
      // The icon should not be the trash icon
      expect(warningIcon).toBeTruthy();
    });
  });

  describe('Cancel and Close Behavior', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete Folder"
          message="Are you sure?"
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
          isLoading={false}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should handle keyboard shortcuts - Enter to confirm, Escape to cancel', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete Folder"
          message="Are you sure?"
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
          isLoading={false}
        />
      );

      // Test Enter key
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      // Test Escape key
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Warnings and Messages', () => {
    it('should show warning about nested content deletion', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete Folder with Content"
          message={`Delete "${mockProject.name}"? This folder contains 5 items that will be permanently deleted. This action cannot be undone.`}
          confirmText="Delete Folder and Contents"
          cancelText="Cancel"
          type="delete"
          isLoading={false}
        />
      );

      expect(screen.getByText(/contains 5 items that will be permanently deleted/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete folder and contents/i })).toBeInTheDocument();
    });

    it('should show appropriate message for empty folders', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete Empty Folder"
          message={`Delete "${mockProject.name}"? This folder is empty. This action cannot be undone.`}
          confirmText="Delete Folder"
          cancelText="Cancel"
          type="delete"
          isLoading={false}
        />
      );

      expect(screen.getByText(/This folder is empty/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete folder/i })).toBeInTheDocument();
    });
  });
});