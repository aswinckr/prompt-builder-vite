import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PromptBuilderBlock } from './PromptBuilderBlock';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { mockContextBlocks } from '../data/mockData';

export function PromptBuilderBlockList() {
  const navigate = useNavigate();
  const { promptBuilder } = useLibraryState();
  const { reorderBlocksInBuilder, addBlockToBuilder } = useLibraryActions();

  // Get block data for selected blocks in the correct order
  const orderedBlocks = promptBuilder.blockOrder
    .map(blockId => mockContextBlocks.find(block => block.id === blockId))
    .filter((block): block is NonNullable<typeof block> => block !== undefined);

  const handleAddBlock = () => {
    // Navigate to knowledge tab to add context blocks
    navigate('/knowledge');
  };

  // Move block function for drag and drop reordering
  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    const draggedBlockId = promptBuilder.blockOrder[dragIndex];
    const newOrder = [...promptBuilder.blockOrder];

    // Remove the dragged item
    newOrder.splice(dragIndex, 1);
    // Insert it at the new position
    newOrder.splice(hoverIndex, 0, draggedBlockId);

    // Update the order in the state
    reorderBlocksInBuilder(newOrder);
  }, [promptBuilder.blockOrder, reorderBlocksInBuilder]);

  if (orderedBlocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500 text-sm mb-4">
          Add context blocks to enhance your prompt
        </p>
        <button
          onClick={handleAddBlock}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Context Block
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Context blocks header - only show when blocks exist */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-400">
          Context Blocks ({orderedBlocks.length})
        </h3>
        <button
          onClick={handleAddBlock}
          className="text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-3 h-3 inline mr-1" />
          Add More
        </button>
      </div>

      {/* Expandable context blocks */}
      <div className="space-y-3">
        {orderedBlocks.map((block, index) => (
          <PromptBuilderBlock
            key={block.id}
            block={block}
            index={index}
            moveBlock={moveBlock}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-xs text-neutral-500">
          Drag to reorder • Click chevron to expand • Click × to remove
        </p>
      </div>
    </div>
  );
}