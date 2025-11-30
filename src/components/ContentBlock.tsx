import React, { useState } from 'react';
import { Edit, Trash2, Play, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TurndownService from 'turndown';
import { useToast } from '../contexts/ToastContext';

// Utility function to strip HTML tags and get plain text for preview while preserving structure
const stripHtmlForPreview = (html: string): string => {
  if (typeof document === 'undefined' || !html) return '';

  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Process each element to preserve structure
  let result = '';
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node) => NodeFilter.FILTER_ACCEPT
    }
  );

  let currentParagraph = '';
  let node = walker.currentNode;

  const processCurrentParagraph = () => {
    if (currentParagraph.trim()) {
      if (result) {
        result += '\n'; // Add explicit line break between paragraphs/headings
      }
      result += currentParagraph.trim();
      currentParagraph = '';
    }
  };

  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      currentParagraph += node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Add spacing for block-level elements
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'div'].includes(tagName)) {
        processCurrentParagraph(); // End current paragraph
      }
    }

    const nextNode = walker.nextNode();
    if (!nextNode) break;
    node = nextNode;
  }

  // Process any remaining content
  processCurrentParagraph();

  // Clean up extra spaces within lines but preserve line breaks
  return result.split('\n').map(line => line.replace(/\s+/g, ' ').trim()).join('\n').trim();
};

// Base interface for common content properties
export interface BaseContentBlock {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: Date | string;
  updated_at: Date | string;
  project_id?: string | null;
}

// Context block specific interface
export interface ContextBlockType extends BaseContentBlock {
  // Context specific properties can be added here if needed
}

// Prompt block specific interface
export interface PromptBlockType extends BaseContentBlock {
  // Prompt specific properties can be added here if needed
}

export interface ContentBlockProps<T extends BaseContentBlock> {
  block: T;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: (block: T) => void;
  onDelete?: (block: T) => void;
  onPlay?: (block: T) => void; // For prompts
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  showPlayButton?: boolean; // Whether to show play button (for prompts)
}

/**
 * Reusable ContentBlock component that works for both context blocks and saved prompts
 */
export function ContentBlock<T extends BaseContentBlock>({
  block,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onPlay,
  onKeyDown,
  showPlayButton = false,
}: ContentBlockProps<T>) {
  const [isHovered, setIsHovered] = useState(false);
  const { showToast } = useToast();

  const handleClick = () => {
    onSelect?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === 'e' || event.key === 'E') && onEdit) {
      event.preventDefault();
      onEdit(block);
    } else if ((event.key === 'd' || event.key === 'D') && onDelete) {
      event.preventDefault();
      onDelete(block);
    } else if ((event.key === 'c' || event.key === 'C')) {
      event.preventDefault();
      handleCopyClick(event as any);
    } else if ((event.key === 'p' || event.key === 'P') && onPlay && showPlayButton) {
      event.preventDefault();
      onPlay(block);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.();
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

  const handlePlayClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onPlay?.(block);
  };

  const handleCopyClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    try {
      // Initialize turndown service
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        fence: '```'
      });

      // Convert HTML content to markdown
      const markdownContent = turndownService.turndown(block.content);

      // Add title and metadata
      const fullMarkdown = `# ${block.title}\n\n${markdownContent}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(fullMarkdown);

      // Show success toast
      showToast(`Copied "${block.title}" to clipboard`, 'success');
    } catch (error) {
      console.error('Failed to copy content:', error);
      // Show error toast
      showToast('Failed to copy content to clipboard', 'error');
    }
  };

  return (
    <Card
      data-block-id={block.id}
      className={`h-full cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
        isSelected
          ? 'border-purple-500/30 bg-purple-500/10 shadow-lg shadow-purple-500/20'
          : 'hover:border-purple-500/30 hover:bg-purple-500/5'
      }`}
      role="gridcell"
      aria-selected={isSelected}
      tabIndex={0}
      aria-label={`Content block: ${block.title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <h3 className="font-medium line-clamp-2 leading-tight flex-1">
          {block.title}
        </h3>
        <div className={`flex items-center gap-1 flex-shrink-0 ml-2 transition-opacity duration-200 ${
          isHovered || isSelected ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyClick}
            className="h-6 w-6 p-0 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10"
            aria-label={`Copy ${block.title}`}
          >
            <Copy size={12} />
          </Button>
          {onPlay && showPlayButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayClick}
              className="h-6 w-6 p-0 text-neutral-400 hover:text-green-400 hover:bg-green-500/10"
              aria-label={`Play ${block.title}`}
            >
              <Play size={12} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="h-6 w-6 p-0 text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
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
              className="h-6 w-6 p-0 text-neutral-400 hover:text-purple-400 hover:bg-purple-500/10"
              aria-label={`Edit ${block.title}`}
            >
              <Edit size={12} />
            </Button>
          )}
          {isSelected && (
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 relative">
        {/* Content Preview - takes up remaining space */}
        <div className="flex-1 mb-4">
          <p className="text-sm line-clamp-3 leading-relaxed whitespace-pre-line">
            {stripHtmlForPreview(block.content)}
          </p>
        </div>

        {/* Bottom section with tags and hint text */}
        <div className="flex flex-col gap-2">
          {/* Tags - above hint text */}
          <div className="flex flex-wrap gap-1 flex-shrink-0">
            {block.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
              >
                {tag}
              </Badge>
            ))}
            {block.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs border-purple-500/30 text-purple-300"
              >
                +{block.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Help text for keyboard shortcuts - positioned at bottom left */}
        <div className={`absolute bottom-2 left-2 text-xs text-neutral-500 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
          <kbd className="px-1 py-0.5 bg-neutral-700/50 rounded text-xs">E</kbd> edit
          <span className="mx-1">·</span>
          <kbd className="px-1 py-0.5 bg-neutral-700/50 rounded text-xs">D</kbd> delete
          <span className="mx-1">·</span>
          <kbd className="px-1 py-0.5 bg-neutral-700/50 rounded text-xs">C</kbd> copy
          {onPlay && showPlayButton && (
            <>
              <span className="mx-1">·</span>
              <kbd className="px-1 py-0.5 bg-neutral-700/50 rounded text-xs">P</kbd> play
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}