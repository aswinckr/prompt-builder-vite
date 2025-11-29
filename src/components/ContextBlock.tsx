import React from 'react';
import { Hash, Edit, Trash2 } from 'lucide-react';
import { ContextBlock as ContextBlockType } from '../types/ContextBlock';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
 */
export const ContextBlock = React.memo(function ContextBlock({ block, isSelected, onSelect, onEdit, onDelete, onKeyDown }: ContextBlockProps) {
  const handleClick = () => {
    onSelect();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
      onEdit?.(block);
    } else if (event.key === 'd' || event.key === 'D') {
      event.preventDefault();
      onDelete?.(block);
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

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.(block);
  };

  return (
    <Card
      data-block-id={block.id}
      className={`h-full cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
        isSelected
          ? 'border-primary/30 bg-primary/5 shadow-lg'
          : 'hover:border-primary/30 hover:bg-muted/50'
      }`}
      role="gridcell"
      aria-selected={isSelected}
      tabIndex={0}
      aria-label={`Context block: ${block.title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <h3 className="font-medium line-clamp-2 leading-tight flex-1">
          {block.title}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              aria-label={`Delete ${block.title}`}
            >
              <Trash2 size={12} />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="h-6 w-6 p-0 text-primary hover:text-primary hover:bg-primary/10"
              aria-label={`Edit ${block.title}`}
            >
              <Edit size={12} />
            </Button>
          )}
          {isSelected && (
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-xs">✓</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        {/* Content Preview - takes up remaining space */}
        <div className="flex-1 mb-4">
          <p className="text-sm line-clamp-3 leading-relaxed">
            {block.content}
          </p>
        </div>

        {/* Tags - at bottom */}
        <div className="flex flex-wrap gap-1 flex-shrink-0 mb-2">
          {block.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Hash size={8} className="mr-1" />
              {tag}
            </Badge>
          ))}
          {block.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{block.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Help text for keyboard shortcuts */}
        <div className="text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">E</kbd> to edit,
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-1">D</kbd> to delete
        </div>
      </CardContent>
    </Card>
  );
});