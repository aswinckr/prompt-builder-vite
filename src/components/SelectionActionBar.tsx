import React, { useState } from 'react';
import { X, CheckSquare, Square, Play, Copy } from 'lucide-react';
import { useLibraryActions, useLibraryState } from '../contexts/LibraryContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/AppRoutes';
import { TIMEOUTS } from '../utils/constants';

interface SelectionActionBarProps {
  selectedCount: number;
  selectedBlocks: string[];
  onClear: () => void;
  onSelectAll: () => void;
  totalVisible: number;
}

/**
 * SelectionActionBar component displays actions for selected context blocks
 */
export function SelectionActionBar({ selectedCount, selectedBlocks, onClear, onSelectAll, totalVisible }: SelectionActionBarProps) {
  const { addBlockToBuilder } = useLibraryActions();
  const { contextBlocks } = useLibraryState();
  const navigate = useNavigate();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleInsertIntoPrompt = () => {
    // Add each selected block to the prompt builder in order
    selectedBlocks.forEach(blockId => {
      addBlockToBuilder(blockId);
    });

    // Navigate to the Prompt tab
    navigate(ROUTES.PROMPT);

    // Clear selection after insertion (will be handled by parent component)
    onClear();
  };

  const handleCopyToClipboard = async () => {
    try {
      // Get the actual context block objects for the selected IDs
      const selectedBlockObjects = selectedBlocks
        .map(blockId => contextBlocks.find(block => block.id === blockId))
        .filter(block => block !== undefined);

      // Format the content for copying
      let copiedText = selectedBlockObjects.map((block, index) => {
        let blockText = `### ${block.title}`;

        // Add tags if available
        if (block.tags && block.tags.length > 0) {
          blockText += ` [${block.tags.join(', ')}]`;
        }

        blockText += `\n\n${block.content}`;
        return blockText;
      }).join('\n\n---\n\n');

      await navigator.clipboard.writeText(copiedText);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), TIMEOUTS.COPY_STATUS_RESET);
    } catch (error) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), TIMEOUTS.COPY_STATUS_RESET);
    }
  };

  return (
    <div className="border-t border-neutral-700 bg-neutral-800/95 p-4">
      <div className="flex items-center justify-between">
        {/* Selection info */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-300">
            <span className="font-medium text-white">{selectedCount}</span>
            {selectedCount === 1 ? ' item' : ' items'} selected
          </span>

          <div className="h-4 w-px bg-neutral-600" />

          {/* Selection controls */}
          <button
            onClick={selectedCount === totalVisible ? onClear : onSelectAll}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
            aria-label={
              selectedCount === totalVisible
                ? 'Deselect all items'
                : 'Select all visible items'
            }
          >
            {selectedCount === totalVisible ? (
              <CheckSquare size={16} />
            ) : (
              <Square size={16} />
            )}
            {selectedCount === totalVisible ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
            aria-label={`Copy ${selectedCount} selected ${selectedCount === 1 ? 'item' : 'items'} to clipboard`}
            title={
              copyStatus === 'copied'
                ? 'Copied to clipboard!'
                : copyStatus === 'error'
                ? 'Copy failed'
                : `Copy ${selectedCount} selected ${selectedCount === 1 ? 'item' : 'items'} to clipboard`
            }
          >
            <Copy size={16} />
            {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleInsertIntoPrompt}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
            aria-label={`Insert ${selectedCount} selected ${selectedCount === 1 ? 'item' : 'items'} into prompt`}
          >
            <Play size={16} />
            Insert into Prompt
          </button>

          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
            aria-label="Clear selection"
          >
            <X size={16} />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}