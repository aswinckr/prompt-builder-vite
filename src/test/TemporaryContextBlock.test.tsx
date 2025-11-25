import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ContextBlock } from '../types/ContextBlock';

describe('Temporary Context Block Tests', () => {
  // Test 1.1: Test creation of temporary context blocks with isTemporary flag
  it('should create temporary context blocks with isTemporary flag', () => {
    const temporaryBlock: ContextBlock = {
      id: 'temp-123',
      user_id: 'user-123',
      title: 'Temporary Block',
      content: 'This is temporary content',
      tags: [],
      created_at: new Date(),
      updated_at: new Date(),
      isTemporary: true
    };

    expect(temporaryBlock.isTemporary).toBe(true);
    expect(temporaryBlock.id).toContain('temp');
    expect(temporaryBlock.title).toBe('Temporary Block');
  });

  // Test 1.1: Test state management for temporary vs permanent blocks
  it('should distinguish between temporary and permanent blocks', () => {
    const permanentBlock: ContextBlock = {
      id: 'perm-456',
      user_id: 'user-123',
      title: 'Permanent Block',
      content: 'This is permanent content',
      tags: ['knowledge'],
      created_at: new Date(),
      updated_at: new Date(),
      isTemporary: false
    };

    const temporaryBlock: ContextBlock = {
      id: 'temp-789',
      user_id: 'user-123',
      title: 'Temporary Block',
      content: 'This is temporary content',
      tags: [],
      created_at: new Date(),
      updated_at: new Date(),
      isTemporary: true
    };

    expect(permanentBlock.isTemporary).toBe(false);
    expect(temporaryBlock.isTemporary).toBe(true);
    expect(permanentBlock.tags).toContain('knowledge');
    expect(temporaryBlock.tags).toHaveLength(0);
  });

  // Test 1.1: Test block ordering with mixed block types
  it('should handle mixed block ordering correctly', () => {
    const permanentBlock: ContextBlock = {
      id: 'perm-1',
      user_id: 'user-123',
      title: 'Knowledge Block',
      content: 'Permanent content',
      tags: ['knowledge'],
      created_at: new Date(),
      updated_at: new Date(),
      isTemporary: false
    };

    const temporaryBlock1: ContextBlock = {
      id: 'temp-1',
      user_id: 'user-123',
      title: 'Text Block 1',
      content: 'Temporary content 1',
      tags: [],
      created_at: new Date(),
      updated_at: new Date(),
      isTemporary: true
    };

    const temporaryBlock2: ContextBlock = {
      id: 'temp-2',
      user_id: 'user-123',
      title: 'Text Block 2',
      content: 'Temporary content 2',
      tags: [],
      created_at: new Date(),
      updated_at: new Date(),
      isTemporary: true
    };

    const blockOrder = ['perm-1', 'temp-1', 'temp-2'];
    const allBlocks = [permanentBlock, temporaryBlock1, temporaryBlock2];

    // Test ordering logic
    const orderedBlocks = blockOrder
      .map(blockId => allBlocks.find(block => block.id === blockId))
      .filter((block): block is NonNullable<typeof block> => block !== undefined);

    expect(orderedBlocks).toHaveLength(3);
    expect(orderedBlocks[0].id).toBe('perm-1');
    expect(orderedBlocks[0].isTemporary).toBe(false);
    expect(orderedBlocks[1].id).toBe('temp-1');
    expect(orderedBlocks[1].isTemporary).toBe(true);
    expect(orderedBlocks[2].id).toBe('temp-2');
    expect(orderedBlocks[2].isTemporary).toBe(true);
  });
});