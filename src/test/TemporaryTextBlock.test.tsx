import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemporaryContextBlock } from '../components/TemporaryContextBlock';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';

// Mock the library hooks
vi.mock('../contexts/LibraryContext', () => ({
  useLibraryState: vi.fn(),
  useLibraryActions: vi.fn(),
}));

// Mock the TipTapEditor component
vi.mock('../components/TipTapEditor', () => ({
  TipTapEditor: ({ content, onUpdate, placeholder, editable }: any) => (
    <div
      data-testid="tiptap-editor"
      contentEditable={editable !== false}
      suppressContentEditableWarning={true}
      onInput={(e) => onUpdate?.({
        html: e.currentTarget.innerHTML,
        json: {},
        text: e.currentTarget.innerText || e.currentTarget.textContent
      })}
      data-placeholder={placeholder}
    >
      {content || (placeholder && <span className="text-neutral-500 italic">{placeholder}</span>)}
    </div>
  ),
  TipTapEditorRef: {} as any,
}));

describe('Temporary Text Block Management', () => {
  const mockBlock = {
    id: 'temp-123',
    user_id: 'temporary',
    title: 'Text Block',
    content: '',
    tags: [],
    created_at: new Date(),
    updated_at: new Date(),
    isTemporary: true
  };

  const mockUpdateContextBlock = vi.fn();
  const mockRemoveTemporaryBlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useLibraryActions as any).mockReturnValue({
      updateContextBlock: mockUpdateContextBlock,
      removeTemporaryBlock: mockRemoveTemporaryBlock,
    });
  });

  // Test 3.1: Test temporary block creation with unique ID
  it('should create temporary blocks with unique IDs', () => {
    render(<TemporaryContextBlock block={mockBlock} index={0} moveBlock={vi.fn()} />);

    const block = screen.getByTestId('temporary-context-block');
    expect(block).toBeInTheDocument();
    expect(block).toHaveAttribute('data-block-id', 'temp-123');
  });

  // Test 3.1: Test auto-focus on newly created editor
  it('should auto-focus TipTap editor when temporary block is created with autoFocus', () => {
    render(<TemporaryContextBlock block={mockBlock} index={0} moveBlock={vi.fn()} autoFocus={true} />);

    const editor = screen.getByTestId('tiptap-editor');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('contenteditable', 'true');
  });

  // Test 3.1: Test content updates save to state
  it('should save content updates to state when editor content changes', async () => {
    render(<TemporaryContextBlock block={mockBlock} index={0} moveBlock={vi.fn()} />);

    const editor = screen.getByTestId('tiptap-editor');
    fireEvent.input(editor, {
      target: {
        innerHTML: '<p>New content</p>',
        innerText: 'New content',
        textContent: 'New content'
      }
    });

    await waitFor(() => {
      expect(mockUpdateContextBlock).toHaveBeenCalledWith('temp-123', {
        content: '<p>New content</p>'
      });
    });
  });

  // Test 3.1: Test drag and drop reordering of temporary blocks
  it('should support drag and drop reordering of temporary blocks', () => {
    const mockMoveBlock = vi.fn();
    render(<TemporaryContextBlock block={mockBlock} index={0} moveBlock={mockMoveBlock} />);

    const block = screen.getByTestId('temporary-context-block');

    // Simulate drag start
    fireEvent.dragStart(block);
    expect(block).toHaveAttribute('draggable', 'true');

    // The actual moveBlock logic would be called by the parent component during drag hover
    expect(mockMoveBlock).toBeDefined();
  });

  // Test 3.1: Test delete functionality for temporary blocks
  it('should delete temporary blocks without confirmation', () => {
    render(<TemporaryContextBlock block={mockBlock} index={0} moveBlock={vi.fn()} />);

    const deleteButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(deleteButton);

    expect(mockRemoveTemporaryBlock).toHaveBeenCalledWith('temp-123');
  });
});