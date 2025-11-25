import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LibraryProvider } from '../contexts/LibraryContext';
import { useLibraryActions, useLibraryState } from '../contexts/LibraryContext';
import { ReactNode } from 'react';

// Mock crypto.randomUUID for consistent test results
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <LibraryProvider>{children}</LibraryProvider>
);

describe('LibraryContext Temporary Block Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1.1: Test createTemporaryBlock action
  it('should create temporary block with correct properties', () => {
    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

    const blockData = {
      title: 'Test Text Block',
      content: 'Test content',
      tags: ['test'],
      project_id: null
    };

    const createdBlock = result.current.actions.createTemporaryBlock(blockData);

    // Check returned block has correct properties
    expect(createdBlock).toMatchObject({
      title: 'Test Text Block',
      content: 'Test content',
      tags: ['test'],
      project_id: null,
      isTemporary: true,
      user_id: 'temporary'
    });

    // Check ID is generated
    expect(createdBlock.id).toMatch(/^test-uuid-/);

    // Check dates are set
    expect(createdBlock.created_at).toBeInstanceOf(Date);
    expect(createdBlock.updated_at).toBeInstanceOf(Date);

    // Check block is added to state
    expect(result.current.state.contextBlocks).toHaveLength(1);
    expect(result.current.state.contextBlocks[0]).toEqual(createdBlock);

    // Check block is added to prompt builder order
    expect(result.current.state.promptBuilder.blockOrder).toHaveLength(1);
    expect(result.current.state.promptBuilder.blockOrder[0]).toBe(createdBlock.id);
  });

  // Test 1.1: Test removeTemporaryBlock action
  it('should remove temporary block from state and prompt builder', () => {
    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

    // Create two temporary blocks
    const block1 = result.current.actions.createTemporaryBlock({
      title: 'Block 1',
      content: 'Content 1',
      tags: [],
      project_id: null
    });

    const block2 = result.current.actions.createTemporaryBlock({
      title: 'Block 2',
      content: 'Content 2',
      tags: [],
      project_id: null
    });

    // Verify both blocks are in state
    expect(result.current.state.contextBlocks).toHaveLength(2);
    expect(result.current.state.promptBuilder.blockOrder).toHaveLength(2);

    // Remove first block
    result.current.actions.removeTemporaryBlock(block1.id);

    // Verify block is removed from context blocks
    expect(result.current.state.contextBlocks).toHaveLength(1);
    expect(result.current.state.contextBlocks[0].id).toBe(block2.id);

    // Verify block is removed from prompt builder order
    expect(result.current.state.promptBuilder.blockOrder).toHaveLength(1);
    expect(result.current.state.promptBuilder.blockOrder[0]).toBe(block2.id);
  });

  // Test 1.1: Test temporary blocks don't interfere with permanent blocks
  it('should handle mixed temporary and permanent blocks correctly', () => {
    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

    // Simulate adding a permanent block to state (manually, since we're testing state management)
    const permanentBlockId = 'permanent-block-123';
    result.current.actions.addBlockToBuilder(permanentBlockId);

    // Create a temporary block
    const tempBlock = result.current.actions.createTemporaryBlock({
      title: 'Temp Block',
      content: 'Temp content',
      tags: [],
      project_id: null
    });

    // Verify both blocks are in order
    expect(result.current.state.promptBuilder.blockOrder).toHaveLength(2);
    expect(result.current.state.promptBuilder.blockOrder).toContain(permanentBlockId);
    expect(result.current.state.promptBuilder.blockOrder).toContain(tempBlock.id);

    // Remove temporary block
    result.current.actions.removeTemporaryBlock(tempBlock.id);

    // Verify only permanent block remains
    expect(result.current.state.promptBuilder.blockOrder).toHaveLength(1);
    expect(result.current.state.promptBuilder.blockOrder[0]).toBe(permanentBlockId);

    // Verify temporary block is removed from context blocks
    expect(result.current.state.contextBlocks).toHaveLength(0);
  });

  // Test 1.1: Test unique ID generation
  it('should generate unique IDs for multiple temporary blocks', () => {
    const { result } = renderHook(
      () => useLibraryActions(),
      { wrapper }
    );

    const block1 = result.current.createTemporaryBlock({
      title: 'Block 1',
      content: '',
      tags: [],
      project_id: null
    });

    const block2 = result.current.createTemporaryBlock({
      title: 'Block 2',
      content: '',
      tags: [],
      project_id: null
    });

    const block3 = result.current.createTemporaryBlock({
      title: 'Block 3',
      content: '',
      tags: [],
      project_id: null
    });

    expect(block1.id).not.toBe(block2.id);
    expect(block2.id).not.toBe(block3.id);
    expect(block1.id).not.toBe(block3.id);

    // All should follow the UUID pattern
    [block1.id, block2.id, block3.id].forEach(id => {
      expect(id).toMatch(/^test-uuid-/);
    });
  });

  // Test 1.1: Test temporary block properties
  it('should set correct default properties for temporary blocks', () => {
    const { result } = renderHook(
      () => useLibraryActions(),
      { wrapper }
    );

    const block = result.current.createTemporaryBlock({
      title: 'Test Block',
      content: 'Test content',
      tags: ['test-tag'],
      project_id: 'project-123'
    });

    // Test all properties are set correctly
    expect(block.isTemporary).toBe(true);
    expect(block.user_id).toBe('temporary');
    expect(block.title).toBe('Test Block');
    expect(block.content).toBe('Test content');
    expect(block.tags).toEqual(['test-tag']);
    expect(block.project_id).toBe('project-123');
    expect(block.created_at).toBeInstanceOf(Date);
    expect(block.updated_at).toBeInstanceOf(Date);
    expect(block.id).toBeTruthy();
  });

  // Test 1.1: Test state persistence through multiple actions
  it('should maintain state consistency through multiple temporary block operations', () => {
    const { result } = renderHook(
      () => {
        const actions = useLibraryActions();
        const state = useLibraryState();
        return { actions, state };
      },
      { wrapper }
    );

    // Create multiple temporary blocks
    const blocks = [];
    for (let i = 0; i < 5; i++) {
      const block = result.current.actions.createTemporaryBlock({
        title: `Block ${i}`,
        content: `Content ${i}`,
        tags: [],
        project_id: null
      });
      blocks.push(block);
    }

    // Verify all blocks are in state
    expect(result.current.state.contextBlocks).toHaveLength(5);
    expect(result.current.state.promptBuilder.blockOrder).toHaveLength(5);

    // Remove middle block
    result.current.actions.removeTemporaryBlock(blocks[2].id);

    // Verify state is consistent
    expect(result.current.state.contextBlocks).toHaveLength(4);
    expect(result.current.state.promptBuilder.blockOrder).toHaveLength(4);

    // Verify correct blocks remain
    const remainingBlockIds = result.current.state.promptBuilder.blockOrder;
    expect(remainingBlockIds).not.toContain(blocks[2].id);
    expect(remainingBlockIds).toContain(blocks[0].id);
    expect(remainingBlockIds).toContain(blocks[1].id);
    expect(remainingBlockIds).toContain(blocks[3].id);
    expect(remainingBlockIds).toContain(blocks[4].id);
  });
});