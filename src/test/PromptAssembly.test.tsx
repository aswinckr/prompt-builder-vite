import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromptBuilderActions } from '../components/PromptBuilderActions';
import { LibraryProvider } from '../contexts/LibraryContext';
import { ToastProvider } from '../contexts/ToastContext';

// Mock the LibraryContext to provide test data with context blocks
const mockLibraryActions = {
  clearPromptBuilder: vi.fn(),
  savePromptAsTemplate: vi.fn(),
  createFolder: vi.fn(),
  movePromptToFolder: vi.fn(),
};

const mockContextBlocks = [
  {
    id: 'block1',
    title: 'Test Block 1',
    content: 'This is test block 1 content',
    user_id: 'user1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'block2',
    title: 'Test Block 2',
    content: 'This is test block 2 content',
    user_id: 'user1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

let mockPromptBuilder = {
  customText: '',
  blockOrder: [] as string[],
};

vi.mock('../contexts/LibraryContext', async () => {
  const actual = await vi.importActual('../contexts/LibraryContext');
  return {
    ...actual,
    useLibraryActions: () => mockLibraryActions,
    useLibraryState: () => ({
      promptBuilder: mockPromptBuilder,
      contextBlocks: mockContextBlocks,
      savedPrompts: [],
      loading: false,
      error: null,
    }),
  };
});

// Mock CreatePromptModal
vi.mock('../components/CreatePromptModal', () => ({
  CreatePromptModal: ({ isOpen, onClose, initialContent }: any) =>
    isOpen ? (
      <div data-testid="create-prompt-modal">
        <div data-testid="initial-content">{initialContent}</div>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

describe('Prompt Assembly Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPromptBuilder = {
      customText: '',
      blockOrder: [],
    };
  });

  it('assembles prompt with custom text only', () => {
    mockPromptBuilder.customText = 'This is custom text content.';
    mockPromptBuilder.blockOrder = [];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    const modal = screen.getByTestId('create-prompt-modal');
    const content = screen.getByTestId('initial-content');

    expect(modal).toBeInTheDocument();
    expect(content.textContent).toBe('This is custom text content.');
  });

  it('assembles prompt with context blocks only', () => {
    mockPromptBuilder.customText = '';
    mockPromptBuilder.blockOrder = ['block1', 'block2'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    const content = screen.getByTestId('initial-content');
    const expectedContent = '### Test Block 1\n\nThis is test block 1 content\n\n### Test Block 2\n\nThis is test block 2 content';

    expect(content.textContent).toBe(expectedContent);
  });

  it('assembles prompt with both custom text and context blocks', () => {
    mockPromptBuilder.customText = 'This is custom text content.';
    mockPromptBuilder.blockOrder = ['block1'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    const content = screen.getByTestId('initial-content');
    const expectedContent = 'This is custom text content.\n\n### Test Block 1\n\nThis is test block 1 content';

    expect(content.textContent).toBe(expectedContent);
  });

  it('prevents save when there is no content', () => {
    mockPromptBuilder.customText = '';
    mockPromptBuilder.blockOrder = [];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    expect(saveButton).toBeDisabled();

    // Try clicking the disabled button
    fireEvent.click(saveButton);

    // Modal should not appear
    expect(screen.queryByTestId('create-prompt-modal')).not.toBeInTheDocument();
  });

  it('enables save when there is only custom text', () => {
    mockPromptBuilder.customText = 'Some custom text';
    mockPromptBuilder.blockOrder = [];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    expect(saveButton).not.toBeDisabled();
  });

  it('enables save when there are only context blocks', () => {
    mockPromptBuilder.customText = '';
    mockPromptBuilder.blockOrder = ['block1'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    expect(saveButton).not.toBeDisabled();
  });

  it('trims whitespace from assembled content', () => {
    mockPromptBuilder.customText = '   This is text with surrounding whitespace   ';
    mockPromptBuilder.blockOrder = [];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    const content = screen.getByTestId('initial-content');
    expect(content.textContent).toBe('This is text with surrounding whitespace');
  });

  it('handles missing context blocks gracefully', () => {
    mockPromptBuilder.customText = 'Custom text';
    mockPromptBuilder.blockOrder = ['nonexistent-block'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    const content = screen.getByTestId('initial-content');
    // Should only include custom text since block doesn't exist
    expect(content.textContent).toBe('Custom text');
  });

  it('handles empty content blocks', () => {
    mockContextBlocks[0] = {
      id: 'empty-block',
      title: 'Empty Block',
      content: '',
      user_id: 'user1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };
    mockPromptBuilder.customText = '';
    mockPromptBuilder.blockOrder = ['empty-block'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    const content = screen.getByTestId('initial-content');
    expect(content.textContent).toBe('### Empty Block\n\n');
  });

  it('formats context block headers correctly', () => {
    mockPromptBuilder.customText = '';
    mockPromptBuilder.blockOrder = ['block1'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    const content = screen.getByTestId('initial-content');
    expect(content.textContent).toContain('### Test Block 1');
  });

  it('maintains proper spacing between multiple blocks', () => {
    mockPromptBuilder.customText = '';
    mockPromptBuilder.blockOrder = ['block1', 'block2'];

    render(
      <ToastProvider>
        <LibraryProvider>
          <PromptBuilderActions />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByTitle('Save prompt');
    fireEvent.click(saveButton);

    const content = screen.getByTestId('initial-content');
    // Should have proper double spacing between blocks
    expect(content.textContent).toContain('\n\n\n\n');
  });
});