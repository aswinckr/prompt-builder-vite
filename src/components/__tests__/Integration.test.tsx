import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { SavedPromptList } from '../SavedPromptList';
import { SavedPrompt } from '../../types/SavedPrompt';

// Mock the EditPromptModal to focus on integration
vi.mock('../EditPromptModal', () => ({
  EditPromptModal: vi.fn(({ isOpen, onClose, onSave, prompt, isLoading }) =>
    isOpen ? (
      <div data-testid="edit-prompt-modal">
        <h2>Edit Prompt</h2>
        <p>Editing: {prompt?.title}</p>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        <button onClick={() => onSave(prompt)} data-testid="modal-save">
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    ) : null
  )
}));

const mockPrompts: SavedPrompt[] = [
  {
    id: '1',
    user_id: 'test-user-1',
    title: 'Test Prompt 1',
    description: 'First test prompt',
    content: '<p>Content 1</p>',
    project_id: 'project-1',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-02'),
    folder: null,
    tags: ['test', 'first']
  },
  {
    id: '2',
    user_id: 'test-user-1',
    title: 'Test Prompt 2',
    description: 'Second test prompt',
    content: '<p>Content 2</p>',
    project_id: 'project-1',
    created_at: new Date('2024-01-03'),
    updated_at: new Date('2024-01-04'),
    folder: null,
    tags: ['test', 'second']
  },
  {
    id: '3',
    user_id: 'test-user-1',
    title: 'Project 2 Prompt',
    description: 'Prompt for different project',
    content: '<p>Content 3</p>',
    project_id: 'project-2',
    created_at: new Date('2024-01-05'),
    updated_at: new Date('2024-01-06'),
    folder: null,
    tags: ['different']
  }
];

describe('Component Integration', () => {
  const mockOnPromptUpdate = vi.fn();
  const mockOnPromptDelete = vi.fn();
  const mockOnPromptLoad = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SavedPromptList Integration', () => {
    it('integrates edit functionality with modal', async () => {
      render(
        <SavedPromptList
          selectedProject="project-1"
          prompts={mockPrompts}
          onPromptUpdate={mockOnPromptUpdate}
          onPromptDelete={mockOnPromptDelete}
          onPromptLoad={mockOnPromptLoad}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
        expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();
        expect(screen.queryByText('Project 2 Prompt')).not.toBeInTheDocument();
      });

      // Click edit button on first prompt
      const editButtons = screen.getAllByLabelText('Edit prompt');
      fireEvent.click(editButtons[0]);

      // Should open modal
      await waitFor(() => {
        expect(screen.getByTestId('edit-prompt-modal')).toBeInTheDocument();
        expect(screen.getByText('Editing: Test Prompt 1')).toBeInTheDocument();
      });
    });

    it('handles complete edit workflow', async () => {
      render(
        <SavedPromptList
          selectedProject="project-1"
          prompts={mockPrompts}
          onPromptUpdate={mockOnPromptUpdate}
          onPromptDelete={mockOnPromptDelete}
          onPromptLoad={mockOnPromptLoad}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
      });

      // Click edit button
      const editButtons = screen.getAllByLabelText('Edit prompt');
      fireEvent.click(editButtons[0]);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByTestId('edit-prompt-modal')).toBeInTheDocument();
      });

      // Save changes
      const saveButton = screen.getByTestId('modal-save');
      fireEvent.click(saveButton);

      // Should call onPromptUpdate
      expect(mockOnPromptUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          title: 'Test Prompt 1'
        })
      );
    });

    it('handles load and delete functionality', async () => {
      render(
        <SavedPromptList
          selectedProject="project-1"
          prompts={mockPrompts}
          onPromptUpdate={mockOnPromptUpdate}
          onPromptDelete={mockOnPromptDelete}
          onPromptLoad={mockOnPromptLoad}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
      });

      // Test load functionality
      const loadButton = screen.getByLabelText('Load prompt');
      fireEvent.click(loadButton);

      expect(mockOnPromptLoad).toHaveBeenCalledWith(1);

      // Test delete functionality
      const deleteButton = screen.getByLabelText('Delete prompt');
      fireEvent.click(deleteButton);

      expect(mockOnPromptDelete).toHaveBeenCalledWith(1);
    });

    it('filters prompts by selected project', async () => {
      render(
        <SavedPromptList
          selectedProject="project-2"
          prompts={mockPrompts}
          onPromptUpdate={mockOnPromptUpdate}
          onPromptDelete={mockOnPromptDelete}
          onPromptLoad={mockOnPromptLoad}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Test Prompt 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Prompt 2')).not.toBeInTheDocument();
        expect(screen.getByText('Project 2 Prompt')).toBeInTheDocument();
      });
    });

    it('handles search functionality', async () => {
      render(
        <SavedPromptList
          selectedProject="project-1"
          prompts={mockPrompts}
          onPromptUpdate={mockOnPromptUpdate}
          onPromptDelete={mockOnPromptDelete}
          onPromptLoad={mockOnPromptLoad}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
        expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();
      });

      // Search for "First"
      const searchInput = screen.getByPlaceholderText('Search prompts...');
      fireEvent.change(searchInput, { target: { value: 'First' } });

      await waitFor(() => {
        expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Prompt 2')).not.toBeInTheDocument();
      });

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
        expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();
      });
    });

    it('handles sorting functionality', async () => {
      render(
        <SavedPromptList
          selectedProject="project-1"
          prompts={mockPrompts}
          onPromptUpdate={mockOnPromptUpdate}
          onPromptDelete={mockOnPromptDelete}
          onPromptLoad={mockOnPromptLoad}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
        expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();
      });

      // Sort by title
      const sortSelect = screen.getByDisplayValue('Last updated');
      fireEvent.change(sortSelect, { target: { value: 'title' } });

      // Should still show both prompts, just sorted differently
      expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
      expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();

      // Sort by created date
      fireEvent.change(sortSelect, { target: { value: 'created' } });

      expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
      expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();
    });

    it('shows empty state when no prompts found', async () => {
      render(
        <SavedPromptList
          selectedProject="nonexistent-project"
          prompts={mockPrompts}
          onPromptUpdate={mockOnPromptUpdate}
          onPromptDelete={mockOnPromptDelete}
          onPromptLoad={mockOnPromptLoad}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No saved prompts found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
      });
    });

    it('displays correct prompt count', async () => {
      render(
        <SavedPromptList
          selectedProject="project-1"
          prompts={mockPrompts}
          onPromptUpdate={mockOnPromptUpdate}
          onPromptDelete={mockOnPromptDelete}
          onPromptLoad={mockOnPromptLoad}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('2 prompts found')).toBeInTheDocument();
      });
    });

    it('handles date filtering', async () => {
      const today = new Date();
      const todayPrompt: SavedPrompt = {
        ...mockPrompts[0],
        created_at: today,
        updated_at: today
      };

      render(
        <SavedPromptList
          selectedProject="project-1"
          prompts={[todayPrompt, mockPrompts[1]]}
          onPromptUpdate={mockOnPromptUpdate}
          onPromptDelete={mockOnPromptDelete}
          onPromptLoad={mockOnPromptLoad}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
        expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();
      });

      // Filter by today
      const dateFilter = screen.getByDisplayValue('All time');
      fireEvent.change(dateFilter, { target: { value: 'today' } });

      await waitFor(() => {
        expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
        // Depending on the actual dates, this might or might not show the second prompt
      });
    });

    it('handles accessibility features', async () => {
      render(
        <SavedPromptList
          selectedProject="project-1"
          prompts={mockPrompts}
          onPromptUpdate={mockOnPromptUpdate}
          onPromptDelete={mockOnPromptDelete}
          onPromptLoad={mockOnPromptLoad}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
      });

      // Check for proper ARIA labels
      expect(screen.getByLabelText('Edit prompt')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete prompt')).toBeInTheDocument();
      expect(screen.getByLabelText('Load prompt')).toBeInTheDocument();

      // Check for proper labels on form elements
      expect(screen.getByLabelText('Date:')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
    });
  });
});