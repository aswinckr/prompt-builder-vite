import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextDropdown } from '../components/ContextDropdown';
import { PromptBuilderBlockList } from '../components/PromptBuilderBlockList';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';

// Mock the library hooks
vi.mock('../contexts/LibraryContext', () => ({
  useLibraryState: vi.fn(),
  useLibraryActions: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
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

// Mock the TemporaryContextBlock component
vi.mock('../components/TemporaryContextBlock', () => ({
  TemporaryContextBlock: ({ block, index, moveBlock, autoFocus }: any) => (
    <div data-testid={`temporary-context-block-${index}`} data-block-id={block.id}>
      Temporary Block: {block.title}
    </div>
  ),
}));

// Mock the PromptBuilderBlock component
vi.mock('../components/PromptBuilderBlock', () => ({
  PromptBuilderBlock: ({ block, index, moveBlock }: any) => (
    <div data-testid={`prompt-builder-block-${index}`} data-block-id={block.id}>
      Regular Block: {block.title}
    </div>
  ),
}));

describe('Integration Flow Tests', () => {
  const mockCreateTemporaryBlock = vi.fn();
  const mockRemoveTemporaryBlock = vi.fn();
  const mockUpdateContextBlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useLibraryActions as any).mockReturnValue({
      createTemporaryBlock: mockCreateTemporaryBlock,
      removeTemporaryBlock: mockRemoveTemporaryBlock,
      updateContextBlock: mockUpdateContextBlock,
    });
  });

  // Test 4.1: Test ContextDropdown replaces "+ Add Context" button
  it('should show ContextDropdown instead of + Add Context button when no blocks exist', () => {
    (useLibraryState as any).mockReturnValue({
      promptBuilder: { blockOrder: [] },
      contextBlocks: []
    });

    render(<PromptBuilderBlockList />);

    // Should show the ContextDropdown (not the old button)
    expect(screen.getByText('Add Context Block')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add context/i })).toBeInTheDocument();
  });

  // Test 4.1: Test multiple temporary blocks can be created
  it('should allow creating multiple temporary blocks', async () => {
    (useLibraryState as any).mockReturnValue({
      promptBuilder: { blockOrder: ['temp-1', 'temp-2'] },
      contextBlocks: [
        {
          id: 'temp-1',
          title: 'Text Block',
          content: 'First block content',
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
          isTemporary: true
        },
        {
          id: 'temp-2',
          title: 'Text Block',
          content: 'Second block content',
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
          isTemporary: true
        }
      ]
    });

    render(<PromptBuilderBlockList />);

    // Should show both temporary blocks
    expect(screen.getByTestId('temporary-context-block-0')).toBeInTheDocument();
    expect(screen.getByTestId('temporary-context-block-1')).toBeInTheDocument();
    expect(screen.getByTestId('temporary-context-block-0')).toHaveAttribute('data-block-id', 'temp-1');
    expect(screen.getByTestId('temporary-context-block-1')).toHaveAttribute('data-block-id', 'temp-2');

    // Should show compact ContextDropdown for adding more
    expect(screen.getByText('Add More')).toBeInTheDocument();
  });

  // Test 4.1: Test responsive behavior on mobile devices
  it('should render ContextDropdown correctly on mobile viewports', () => {
    // Mock mobile viewport size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });

    render(<ContextDropdown />);

    // Should still render correctly on mobile
    const button = screen.getByRole('button', { name: /add context/i });
    expect(button).toBeInTheDocument();

    // Should have proper classes for responsive design
    expect(button).toHaveClass('bg-neutral-800', 'hover:bg-neutral-700', 'text-neutral-300');
  });
});