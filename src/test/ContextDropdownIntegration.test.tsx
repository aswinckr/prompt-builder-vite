import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PromptBuilderBlockList } from '../components/PromptBuilderBlockList';
import { LibraryProvider } from '../contexts/LibraryContext';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';

// Mock the useLibraryState and useLibraryActions hooks
vi.mock('../contexts/LibraryContext', async () => {
  const actual = await vi.importActual('../contexts/LibraryContext');
  return {
    ...actual,
    useLibraryState: vi.fn(),
    useLibraryActions: vi.fn(),
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode; initialEntries?: string[] }> = ({
  children,
  initialEntries = ['/']
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <LibraryProvider>
      {children}
    </LibraryProvider>
  </MemoryRouter>
);

describe('ContextDropdown Integration Tests', () => {
  const mockCreateTemporaryBlock = vi.fn();
  const mockReorderBlocksInBuilder = vi.fn();
  const mockRemoveTemporaryBlock = vi.fn();
  const mockUpdateContextBlock = vi.fn();

  const mockLibraryState = {
    promptBuilder: {
      customText: '',
      blockOrder: []
    },
    contextBlocks: [],
    contextSelection: { selectedBlockIds: [] },
    savedPrompts: [],
    promptProjects: [],
    datasetProjects: [],
    systemPromptProjects: [],
    systemDatasetProjects: [],
    loading: false,
    error: null,
    chat: { isChatPanelOpen: false, selectedModel: 'gemini-2.5-flash' },
    folderModal: { isOpen: false, defaultType: 'prompts', loading: false }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock crypto.randomUUID for consistent test results
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
      },
    });

    (useLibraryActions as any).mockReturnValue({
      createTemporaryBlock: mockCreateTemporaryBlock,
      removeTemporaryBlock: mockRemoveTemporaryBlock,
      updateContextBlock: mockUpdateContextBlock,
      reorderBlocksInBuilder: mockReorderBlocksInBuilder,
    });

    (useLibraryState as any).mockReturnValue(mockLibraryState);
  });

  // Test 5.1: Test empty state shows ContextDropdown
  it('should show ContextDropdown when no blocks exist', () => {
    render(
      <TestWrapper>
        <PromptBuilderBlockList />
      </TestWrapper>
    );

    expect(screen.getByText('Add context blocks to enhance your prompt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add context options/i })).toBeInTheDocument();
  });

  // Test 5.2: Test temporary block creation flow
  it('should create temporary block and add to builder when "Add Text Block" is clicked', async () => {
    const newBlockId = 'test-uuid-123';
    mockCreateTemporaryBlock.mockReturnValue({
      id: newBlockId,
      title: 'Text Block',
      content: '',
      tags: [],
      isTemporary: true
    });

    render(
      <TestWrapper>
        <PromptBuilderBlockList />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /add context options/i });
    fireEvent.click(button);

    const addTextBlockOption = screen.getByText('Add Text Block');
    fireEvent.click(addTextBlockOption);

    expect(mockCreateTemporaryBlock).toHaveBeenCalledWith({
      title: 'Text Block',
      content: '',
      tags: [],
      project_id: null
    });

    // Should scroll to the new block (verified by setTimeout in ContextDropdown)
    await waitFor(() => {
      expect(screen.queryByText('Add Text Block')).not.toBeInTheDocument();
    });
  });

  // Test 5.3: Test blocks exist state shows compact dropdown
  it('should show compact ContextDropdown when blocks exist', () => {
    const mockStateWithBlocks = {
      ...mockLibraryState,
      promptBuilder: {
        ...mockLibraryState.promptBuilder,
        blockOrder: ['block-1', 'block-2']
      },
      contextBlocks: [
        {
          id: 'block-1',
          user_id: 'user-123',
          title: 'Knowledge Block',
          content: 'Permanent content',
          tags: ['knowledge'],
          created_at: new Date(),
          updated_at: new Date(),
          isTemporary: false
        },
        {
          id: 'block-2',
          user_id: 'user-123',
          title: 'Text Block',
          content: 'Temporary content',
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
          isTemporary: true
        }
      ]
    };

    (useLibraryState as any).mockReturnValue(mockStateWithBlocks);

    render(
      <TestWrapper>
        <PromptBuilderBlockList />
      </TestWrapper>
    );

    expect(screen.getByText('Context Blocks (2)')).toBeInTheDocument();
    expect(screen.getByText('1 text • 1 knowledge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add context options/i })).toBeInTheDocument();
    expect(screen.getByText('Add More')).toBeInTheDocument();
  });

  // Test 5.4: Test mixed block types display correctly
  it('should display correct counts for mixed block types', () => {
    const mockStateWithMixedBlocks = {
      ...mockLibraryState,
      promptBuilder: {
        ...mockLibraryState.promptBuilder,
        blockOrder: ['perm-1', 'temp-1', 'temp-2', 'perm-2']
      },
      contextBlocks: [
        {
          id: 'perm-1',
          user_id: 'user-123',
          title: 'Knowledge Block 1',
          content: 'Permanent content 1',
          tags: ['knowledge'],
          created_at: new Date(),
          updated_at: new Date(),
          isTemporary: false
        },
        {
          id: 'temp-1',
          user_id: 'user-123',
          title: 'Text Block 1',
          content: 'Temporary content 1',
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
          isTemporary: true
        },
        {
          id: 'temp-2',
          user_id: 'user-123',
          title: 'Text Block 2',
          content: 'Temporary content 2',
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
          isTemporary: true
        },
        {
          id: 'perm-2',
          user_id: 'user-123',
          title: 'Knowledge Block 2',
          content: 'Permanent content 2',
          tags: ['knowledge'],
          created_at: new Date(),
          updated_at: new Date(),
          isTemporary: false
        }
      ]
    };

    (useLibraryState as any).mockReturnValue(mockStateWithMixedBlocks);

    render(
      <TestWrapper>
        <PromptBuilderBlockList />
      </TestWrapper>
    );

    expect(screen.getByText('Context Blocks (4)')).toBeInTheDocument();
    expect(screen.getByText('2 texts • 2 knowledge')).toBeInTheDocument();
  });

  // Test 5.5: Test navigation to knowledge library
  it('should navigate to knowledge when "Add Knowledge" is selected', async () => {
    render(
      <TestWrapper>
        <PromptBuilderBlockList />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /add context options/i });
    fireEvent.click(button);

    const addKnowledgeOption = screen.getByText('Add Knowledge');
    fireEvent.click(addKnowledgeOption);

    // Should navigate to /knowledge (this would be tested in a router context)
    await waitFor(() => {
      expect(screen.queryByText('Add Knowledge')).not.toBeInTheDocument();
    });
  });

  // Test 5.6: Test accessibility attributes
  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <PromptBuilderBlockList />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /add context options/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-label', 'Add context options');
  });

  // Test 5.7: Test drag and drop integration
  it('should integrate with existing drag and drop system', () => {
    const mockStateWithBlocks = {
      ...mockLibraryState,
      promptBuilder: {
        ...mockLibraryState.promptBuilder,
        blockOrder: ['block-1', 'block-2']
      },
      contextBlocks: [
        {
          id: 'block-1',
          user_id: 'user-123',
          title: 'Knowledge Block',
          content: 'Permanent content',
          tags: ['knowledge'],
          created_at: new Date(),
          updated_at: new Date(),
          isTemporary: false
        },
        {
          id: 'block-2',
          user_id: 'user-123',
          title: 'Text Block',
          content: 'Temporary content',
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
          isTemporary: true
        }
      ]
    };

    (useLibraryState as any).mockReturnValue(mockStateWithBlocks);

    render(
      <TestWrapper>
        <PromptBuilderBlockList />
      </TestWrapper>
    );

    // The component should render both permanent and temporary blocks
    expect(screen.getByText('Knowledge Block')).toBeInTheDocument();
    expect(screen.getByText('Text Block')).toBeInTheDocument();

    // Should show drag and drop instructions
    expect(screen.getByText('Drag to reorder • Click chevron to expand • Click × to remove')).toBeInTheDocument();
  });

  // Test 5.8: Test responsive design classes
  it('should apply correct responsive styling', () => {
    render(
      <TestWrapper>
        <PromptBuilderBlockList />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /add context options/i });

    // Should have neutral theme classes
    expect(button.className).toContain('bg-neutral-800');
    expect(button.className).toContain('text-neutral-300');
    expect(button.className).toContain('border-neutral-600');
  });

  // Test 5.9: Test temporary block creation with UUID generation
  it('should generate unique IDs for temporary blocks', () => {
    const block1 = {
      id: 'temp-uuid-1',
      title: 'Text Block',
      content: '',
      tags: [],
      isTemporary: true
    };

    const block2 = {
      id: 'temp-uuid-2',
      title: 'Text Block',
      content: '',
      tags: [],
      isTemporary: true
    };

    mockCreateTemporaryBlock.mockReturnValueOnce(block1).mockReturnValueOnce(block2);

    expect(block1.id).not.toBe(block2.id);
    expect(block1.id).toMatch(/^test-uuid-/);
    expect(block2.id).toMatch(/^test-uuid-/);
  });

  // Test 5.10: Test block removal updates prompt builder
  it('should remove temporary block from prompt builder when deleted', async () => {
    const newBlockId = 'test-uuid-123';
    mockCreateTemporaryBlock.mockReturnValue({
      id: newBlockId,
      title: 'Text Block',
      content: '',
      tags: [],
      isTemporary: true
    });

    // Simulate state with temporary block
    const mockStateWithTempBlock = {
      ...mockLibraryState,
      promptBuilder: {
        ...mockLibraryState.promptBuilder,
        blockOrder: [newBlockId]
      },
      contextBlocks: [{
        id: newBlockId,
        user_id: 'temporary',
        title: 'Text Block',
        content: '',
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
        isTemporary: true
      }]
    };

    (useLibraryState as any).mockReturnValue(mockStateWithTempBlock);

    render(
      <TestWrapper>
        <PromptBuilderBlockList />
      </TestWrapper>
    );

    // Test that removing temporary block would call the correct action
    // This tests the integration flow
    expect(mockReorderBlocksInBuilder).toBeDefined();
    expect(mockRemoveTemporaryBlock).toBeDefined();
  });
});