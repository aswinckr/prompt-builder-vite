import React from 'react';
import { Hash, Edit } from 'lucide-react';
import { ContextBlock as ContextBlockType } from '../types/ContextBlock';

interface ContextBlockProps {
  block: ContextBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: (block: ContextBlockType) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

/**
 * ContextBlock component displays a single context block in the grid
 */
export function ContextBlock({ block, isSelected, onSelect, onEdit, onKeyDown }: ContextBlockProps) {
  const handleClick = () => {
    onSelect();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
      onEdit?.(block);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
    onKeyDown?.(event);
  };

  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEdit?.(block);
  };

  return (
    <button
      data-block-id={block.id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`h-full p-4 rounded-lg border transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex flex-col ${
        isSelected
          ? 'bg-blue-500/10 border-blue-500/30 shadow-lg'
          : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-750 hover:border-neutral-600'
      }`}
      role="gridcell"
      aria-selected={isSelected}
      tabIndex={0}
      aria-label={`Context block: ${block.title}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-shrink-0">
        <h3 className="font-medium text-white line-clamp-2 leading-tight flex-1">
          {block.title}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* Edit Icon */}
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="p-1 text-neutral-400 hover:text-blue-400 transition-colors rounded hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label={`Edit ${block.title}`}
            >
              <Edit size={14} />
            </button>
          )}
          {/* Selection Indicator */}
          {isSelected && (
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Preview - takes up remaining space */}
      <div className="flex-1 mb-4">
        <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed">
          {block.content}
        </p>
      </div>

      {/* Tags - at bottom */}
      <div className="flex flex-wrap gap-1 flex-shrink-0">
        {block.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-700 text-neutral-300"
          >
            <Hash size={10} className="text-neutral-400" />
            {tag}
          </span>
        ))}
        {block.tags.length > 3 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-neutral-700 text-neutral-400">
            +{block.tags.length - 3}
          </span>
        )}
      </div>
    </button>
  );
}