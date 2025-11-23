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

describe('EditPromptModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it('renders modal with pre-populated data', async () => {
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

    expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
  });

  it('calls onSave with updated data when Save is clicked', async () => {
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

    // Update title
    const titleInput = screen.getByDisplayValue('Test Prompt');
    fireEvent.change(titleInput, { target: { value: 'Updated Prompt Title' } });

    // Click Save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated Prompt Title',
        updatedAt: expect.any(Date)
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows validation error for empty title', async () => {
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

    // Click Save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Should show error message
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('shows confirmation dialog when closing with unsaved changes', async () => {
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
    fireEvent.change(titleInput, { target: { value: 'Modified Title' } });

    // Try to close
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Should show confirmation dialog
    expect(screen.getByText('Discard changes?')).toBeInTheDocument();
    expect(screen.getByText('You have unsaved changes. Are you sure you want to close without saving?')).toBeInTheDocument();
  });

  it('discards changes when confirmed in confirmation dialog', async () => {
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
    fireEvent.change(titleInput, { target: { value: 'Modified Title' } });

    // Try to close
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

  it('cancels discard when cancelled in confirmation dialog', async () => {
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
    fireEvent.change(titleInput, { target: { value: 'Modified Title' } });

    // Try to close
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Cancel discard
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
    const cancelButtonInDialog = screen.getByText('Cancel');
    fireEvent.click(cancelButtonInDialog);

    // Modal should still be open, onClose not called
    expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows loading state when saving', async () => {
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
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('disables inputs when loading', async () => {
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
      const titleInput = screen.getByDisplayValue('Test Prompt');
      expect(titleInput).toBeDisabled();
    });

    const saveButton = screen.getByRole('button', { name: /saving/i });
    expect(saveButton).toBeDisabled();
  });

  it('does not render when isOpen is false', () => {
    render(
      <EditPromptModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        prompt={mockPrompt}
      />
    );

    expect(screen.queryByText('Edit Prompt')).not.toBeInTheDocument();
  });
});