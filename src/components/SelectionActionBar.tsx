import React from 'react';
import { X, CheckSquare, Square, Play } from 'lucide-react';
import { useLibraryActions } from '../contexts/LibraryContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/AppRoutes';

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
  const navigate = useNavigate();

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
            onClick={handleInsertIntoPrompt}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
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