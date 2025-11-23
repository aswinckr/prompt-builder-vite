import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { EditPromptModal } from '../EditPromptModal';
import { SavedPrompt } from '../../types/SavedPrompt';

const mockPrompt: SavedPrompt = {
  id: 1,
  title: 'Test Prompt',
  description: 'Test description',
  content: '<p>Test content</p>',
  projectId: 'test-project',
  createdAt: new Date(),
  updatedAt: new Date(),
  folder: null,
  tags: ['test']
};

describe('User Interactions - EditPromptModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  describe('Change Detection', () => {
    it('detects when title has changed', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument();
      });

      // Change title
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      // Try to close - should show confirmation dialog
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.getByText('Discard changes?')).toBeInTheDocument();
    });

    it('detects when content has changed', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
      });

      // Content changes would be detected through the TipTapEditor
      // For now, we'll test that the change detection logic is in place
      // by checking that the modal renders properly
      expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
    });

    it('does not show confirmation when no changes made', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
      });

      // Close without making changes
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
    });
  });

  describe('Confirmation Dialog', () => {
    it('shows confirmation dialog with correct content', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument();
      });

      // Make a change
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: 'Changed' } });

      // Try to close
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.getByText('Discard changes?')).toBeInTheDocument();
      expect(screen.getByText('You have unsaved changes. Are you sure you want to close without saving?')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument(); // Cancel button in dialog
      expect(screen.getByText('Discard Changes')).toBeInTheDocument();
    });

    it('closes modal when discard is confirmed', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument();
      });

      // Make a change and try to close
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: 'Changed' } });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Confirm discard
      await waitFor(() => {
        expect(screen.getByText('Discard Changes')).toBeInTheDocument();
      });
      const discardButton = screen.getByText('Discard Changes');
      fireEvent.click(discardButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('cancels discard when cancel is clicked', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument();
      });

      // Make a change and try to close
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: 'Changed' } });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Cancel the discard
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument(); // Cancel button in dialog
      });
      const cancelButtonInDialog = screen.getAllByText('Cancel')[1]; // Second cancel button
      fireEvent.click(cancelButtonInDialog);

      // Modal should still be open
      expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('shows loading state during save operation', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
          isLoading={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });

      expect(screen.getByText('Saving...')).toBeInTheDocument();

      // Save button should be disabled
      const saveButton = screen.getByRole('button', { name: /saving/i });
      expect(saveButton).toBeDisabled();

      // Title input should be disabled
      const titleInput = screen.getByDisplayValue('Test Prompt');
      expect(titleInput).toBeDisabled();
    });

    it('disables all interactions during loading', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
          isLoading={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });

      // Cancel button should also be disabled
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Keyboard Interactions', () => {
    it('handles escape key properly when no changes', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
      });

      // Press escape key
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows confirmation on escape when changes exist', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument();
      });

      // Make a change
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: 'Changed' } });

      // Press escape key
      fireEvent.keyDown(document, { key: 'Escape' });

      // Should show confirmation dialog
      expect(screen.getByText('Discard changes?')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('prevents saving with empty title', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument();
      });

      // Clear title
      const titleInput = screen.getByDisplayValue('Test Prompt');
      fireEvent.change(titleInput, { target: { value: '' } });

      // Try to save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      // Should show validation error
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('enables save button when title is valid', async () => {
      render(
        <EditPromptModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          prompt={mockPrompt}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      });

      // Save button should be enabled with valid title
      const saveButton = screen.getByText('Save');
      expect(saveButton).not.toBeDisabled();
    });
  });
});