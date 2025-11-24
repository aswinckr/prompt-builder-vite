import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { CreatePromptModal } from '../CreatePromptModal';

// Mock the LibraryContext
const mockCreatePrompt = vi.fn();
const mockState = { loading: false, error: null };

vi.mock('../../contexts/LibraryContext', () => ({
  useLibraryActions: () => ({
    createSavedPrompt: mockCreatePrompt,
  }),
  useLibraryState: () => mockState,
}));

// Mock TipTapEditor
vi.mock('../TipTapEditor', () => ({
  TipTapEditor: ({ content, onUpdate, placeholder }: any) => (
    <div data-testid="tiptap-editor">
      <textarea
        placeholder={placeholder}
        defaultValue={content}
        onChange={(e) => onUpdate?.({ html: e.target.value, json: null, text: e.target.value })}
        data-testid="editor-textarea"
      />
    </div>
  ),
}));

describe('CreatePromptModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockCreatePrompt.mockClear();
    vi.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
        selectedProjectId="test-project-id"
      />
    );

    expect(screen.getByText('Add Prompt')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <CreatePromptModal
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Add Prompt')).not.toBeInTheDocument();
  });

  it('shows validation error when title is empty', async () => {
    render(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
        selectedProjectId="test-project-id"
      />
    );

    const saveButton = screen.getByRole('button', { name: /Add Prompt/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a title')).toBeInTheDocument();
    });

    expect(mockCreatePrompt).not.toHaveBeenCalled();
  });

  it('shows validation error when content is empty', async () => {
    render(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
        selectedProjectId="test-project-id"
      />
    );

    const titleInput = screen.getByLabelText('Title *');
    fireEvent.change(titleInput, { target: { value: 'Test Prompt Title' } });

    const saveButton = screen.getByRole('button', { name: /Add Prompt/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter some content')).toBeInTheDocument();
    });

    expect(mockCreatePrompt).not.toHaveBeenCalled();
  });

  it('calls createSavedPrompt when form is valid', async () => {
    const mockPromptData = {
      id: 'test-id',
      title: 'Test Prompt Title',
      description: 'Test description',
      content: 'Test prompt content with {{variable}}',
      project_id: 'test-project-id',
      tags: [],
    };

    mockCreatePrompt.mockResolvedValue({ data: mockPromptData, error: null });

    render(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
        selectedProjectId="test-project-id"
      />
    );

    const titleInput = screen.getByLabelText('Title *');
    const descriptionInput = screen.getByLabelText('Description');
    const editorTextarea = screen.getByTestId('editor-textarea');
    const saveButton = screen.getByRole('button', { name: /Add Prompt/i });

    fireEvent.change(titleInput, { target: { value: 'Test Prompt Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    fireEvent.change(editorTextarea, { target: { value: 'Test prompt content with {{variable}}' } });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreatePrompt).toHaveBeenCalledWith({
        title: 'Test Prompt Title',
        description: 'Test description',
        content: 'Test prompt content with {{variable}}',
        project_id: 'test-project-id',
        tags: [],
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error message when creation fails', async () => {
    mockCreatePrompt.mockResolvedValue({ data: null, error: 'Database error' });

    render(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
        selectedProjectId="test-project-id"
      />
    );

    const titleInput = screen.getByLabelText('Title *');
    const editorTextarea = screen.getByTestId('editor-textarea');
    const saveButton = screen.getByRole('button', { name: /Add Prompt/i });

    fireEvent.change(titleInput, { target: { value: 'Test Prompt Title' } });
    fireEvent.change(editorTextarea, { target: { value: 'Test content' } });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('resets form when modal closes', () => {
    const { rerender } = render(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByLabelText('Title *');
    const descriptionInput = screen.getByLabelText('Description');
    const editorTextarea = screen.getByTestId('editor-textarea');

    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(editorTextarea, { target: { value: 'Test Content' } });

    rerender(
      <CreatePromptModal
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    rerender(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText('Title *')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByTestId('editor-textarea')).toHaveValue('');
  });

  it('shows loading state during submission', async () => {
    mockCreatePrompt.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
        selectedProjectId="test-project-id"
      />
    );

    const titleInput = screen.getByLabelText('Title *');
    const editorTextarea = screen.getByTestId('editor-textarea');
    const saveButton = screen.getByRole('button', { name: /Add Prompt/i });

    fireEvent.change(titleInput, { target: { value: 'Test Prompt Title' } });
    fireEvent.change(editorTextarea, { target: { value: 'Test content' } });

    fireEvent.click(saveButton);

    // Check loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Creating/i })).toBeDisabled();

    await waitFor(() => {
      expect(mockCreatePrompt).toHaveBeenCalled();
    });
  });

  it('disables save button when form is invalid', () => {
    render(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
        selectedProjectId="test-project-id"
      />
    );

    const saveButton = screen.getByRole('button', { name: /Add Prompt/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when form is valid', () => {
    render(
      <CreatePromptModal
        isOpen={true}
        onClose={mockOnClose}
        selectedProjectId="test-project-id"
      />
    );

    const titleInput = screen.getByLabelText('Title *');
    const editorTextarea = screen.getByTestId('editor-textarea');
    const saveButton = screen.getByRole('button', { name: /Add Prompt/i });

    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(editorTextarea, { target: { value: 'Test content' } });

    expect(saveButton).not.toBeDisabled();
  });
});