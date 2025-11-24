import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { CreatePromptModal } from '../CreatePromptModal';

// Simple mock for testing
vi.mock('../../contexts/LibraryContext', () => ({
  useLibraryActions: () => ({
    createSavedPrompt: vi.fn(),
  }),
  useLibraryState: () => ({
    loading: false,
    error: null,
  }),
}));

// Simple TipTapEditor mock
vi.mock('../TipTapEditor', () => ({
  TipTapEditor: () => <div data-testid="tiptap-editor">Editor</div>,
}));

describe('CreatePromptModal - Basic Rendering', () => {
  it('renders modal with correct title', () => {
    render(
      <CreatePromptModal
        isOpen={true}
        onClose={vi.fn()}
        selectedProjectId="test-project-id"
      />
    );

    expect(screen.getByText('Add Prompt')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <CreatePromptModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText('Add Prompt')).not.toBeInTheDocument();
  });

  it('renders form fields when open', () => {
    render(
      <CreatePromptModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
  });
});