import React from 'react';
import { ContextBlock as ContextBlockType } from '../types/ContextBlock';
import { ContentBlock, ContextBlockType as BaseContextBlockType } from './ContentBlock';

interface ContextBlockProps {
  block: ContextBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: (block: ContextBlockType) => void;
  onDelete?: (block: ContextBlockType) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * ContextBlock component displays a single context block in the grid
 * Uses the reusable ContentBlock component internally
 */
export const ContextBlock = React.memo(function ContextBlock({
  block,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onKeyDown
}: ContextBlockProps) {
  return (
    <ContentBlock<ContextBlockType>
      block={block}
      isSelected={isSelected}
      onSelect={onSelect}
      onEdit={onEdit}
      onDelete={onDelete}
      onKeyDown={onKeyDown}
      showPlayButton={false} // Context blocks don't have play functionality
    />
  );
});