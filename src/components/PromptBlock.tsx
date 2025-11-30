import React from 'react';
import { SavedPrompt } from '../types/SavedPrompt';
import { ContentBlock, PromptBlockType } from './ContentBlock';

interface PromptBlockProps {
  prompt: SavedPrompt;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: (prompt: SavedPrompt) => void;
  onDelete?: (prompt: SavedPrompt) => void;
  onPlay?: (prompt: SavedPrompt) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * PromptBlock component displays a single saved prompt in the grid
 * Uses the reusable ContentBlock component internally
 */
export const PromptBlock = React.memo(function PromptBlock({
  prompt,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onPlay,
  onKeyDown
}: PromptBlockProps) {
  // Convert SavedPrompt to PromptBlockType format
  const promptBlock: PromptBlockType = {
    id: prompt.id,
    title: prompt.title,
    content: prompt.description || prompt.content || '', // SavedPrompt uses 'description' field for content, fallback to content
    tags: prompt.tags || [],
    created_at: prompt.created_at,
    updated_at: prompt.updated_at,
    project_id: prompt.project_id,
  };

  return (
    <ContentBlock<PromptBlockType>
      block={promptBlock}
      isSelected={isSelected}
      onSelect={onSelect}
      onEdit={() => onEdit?.(prompt)}
      onDelete={() => onDelete?.(prompt)}
      onPlay={() => onPlay?.(prompt)}
      onKeyDown={onKeyDown}
      showPlayButton={true} // Prompts have play functionality
    />
  );
});