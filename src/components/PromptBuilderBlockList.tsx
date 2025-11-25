import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PromptBuilderBlock } from './PromptBuilderBlock';
import { TemporaryContextBlock } from './TemporaryContextBlock';
import { ContextDropdown } from './ContextDropdown';
import { ErrorBoundary } from './ErrorBoundary';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';

export function PromptBuilderBlockList() {
  const navigate = useNavigate();
  const { promptBuilder, contextBlocks } = useLibraryState();
  const { reorderBlocksInBuilder, addBlockToBuilder } = useLibraryActions();
  const [lastCreatedBlockId, setLastCreatedBlockId] = useState<string | null>(null);

  // Get block data for selected blocks in the correct order - memoized for performance
  const orderedBlocks = useMemo(() => {
    return promptBuilder.blockOrder
      .map(blockId => contextBlocks.find(block => block.id === blockId))
      .filter((block): block is NonNullable<typeof block> => block !== undefined);
  }, [promptBuilder.blockOrder, contextBlocks]);

  // Calculate block counts - memoized to avoid recalculation
  const blockCounts = useMemo(() => ({
    temporary: orderedBlocks.filter(block => block.isTemporary).length,
    permanent: orderedBlocks.filter(block => !block.isTemporary).length,
  }), [orderedBlocks]);

  // Reset last created block ID when blocks are reordered
  useEffect(() => {
    if (lastCreatedBlockId && !orderedBlocks.find(block => block.id === lastCreatedBlockId)) {
      setLastCreatedBlockId(null);
    }
  }, [orderedBlocks, lastCreatedBlockId]);

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

  // Count temporary and permanent blocks
  
  if (orderedBlocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500 text-sm mb-4">
          Add context blocks to enhance your prompt
        </p>
        <ContextDropdown />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Context blocks header - only show when blocks exist */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-400">
          Context Blocks ({orderedBlocks.length})
          {(blockCounts.temporary > 0 || blockCounts.permanent > 0) && (
            <span className="text-xs text-neutral-500 ml-2">
              {blockCounts.temporary > 0 && `${blockCounts.temporary} text${blockCounts.temporary > 1 ? 's' : ''}`}
              {blockCounts.temporary > 0 && blockCounts.permanent > 0 && ' • '}
              {blockCounts.permanent > 0 && `${blockCounts.permanent} knowledge${blockCounts.permanent > 1 ? '' : ''}`}
            </span>
          )}
        </h3>
        <ContextDropdown variant="compact" />
      </div>

      {/* Expandable context blocks */}
      <div className="space-y-3">
        {orderedBlocks.map((block, index) => {
          const isLastCreatedTemporaryBlock = block.id === lastCreatedBlockId && block.isTemporary;

          return (
            <ErrorBoundary key={block.id}>
              {block.isTemporary ? (
                <TemporaryContextBlock
                  block={block}
                  index={index}
                  moveBlock={moveBlock}
                  autoFocus={isLastCreatedTemporaryBlock}
                />
              ) : (
                <PromptBuilderBlock
                  block={block}
                  index={index}
                  moveBlock={moveBlock}
                />
              )}
            </ErrorBoundary>
          );
        })}
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