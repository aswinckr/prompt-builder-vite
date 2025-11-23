import React, { useMemo, useCallback, useRef } from 'react';
import { ContextBlock } from './ContextBlock';
import { SelectionActionBar } from './SelectionActionBar';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';

interface ContextBlocksGridProps {
  selectedProject: string;
}

export function ContextBlocksGrid({ selectedProject }: ContextBlocksGridProps) {
  const { contextSelection, contextBlocks } = useLibraryState();
  const { toggleBlockSelection, clearBlockSelection, setSelectedBlocks } = useLibraryActions();
  const [searchQuery] = React.useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  // Filter blocks based on project and search query
  const filteredBlocks = useMemo(() => {
    let blocks = contextBlocks.filter(block => {
      const matchesProject = block.project === selectedProject;
      return matchesProject;
    });

    // Filter by search query
    if (searchQuery !== '') {
      blocks = blocks.filter(block =>
        block.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return blocks;
  }, [contextBlocks, selectedProject, searchQuery]);

  // Select all visible blocks
  const selectAllVisible = useCallback(() => {
    setSelectedBlocks(filteredBlocks.map(block => block.id));
  }, [filteredBlocks, setSelectedBlocks]);

  // Grid keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>, blockId: number) => {
    if (!gridRef.current) return;

    const blocks = Array.from(gridRef.current.querySelectorAll('[data-block-id]'));
    const currentIndex = blocks.findIndex(el => parseInt(el.getAttribute('data-block-id') || '0') === blockId);

    let nextIndex = currentIndex;
    const gridCols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = Math.min(currentIndex + 1, blocks.length - 1);
        break;

      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = Math.max(currentIndex - 1, 0);
        break;

      case 'ArrowDown':
        event.preventDefault();
        nextIndex = Math.min(currentIndex + gridCols, blocks.length - 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        nextIndex = Math.max(currentIndex - gridCols, 0);
        break;
    }

    if (nextIndex !== currentIndex && blocks[nextIndex]) {
      (blocks[nextIndex] as HTMLElement).focus();
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Context Blocks Grid */}
      <div
        ref={gridRef}
        className="flex-1 p-4 md:p-6 overflow-y-auto"
        role="grid"
        aria-label="Context blocks grid"
      >
        {filteredBlocks.length === 0 ? (
          <div className="text-center text-neutral-400 mt-8 px-4">
            <div className="text-lg mb-2">No context blocks found</div>
            <div className="text-sm">Try adjusting your search or filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredBlocks.map((block) => (
              <ContextBlock
                key={block.id}
                block={block}
                isSelected={contextSelection.selectedBlockIds.includes(block.id)}
                onSelect={() => toggleBlockSelection(block.id)}
                onKeyDown={(e) => handleKeyDown(e, block.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selection Action Bar */}
      {contextSelection.selectedBlockIds.length > 0 && (
        <SelectionActionBar
          selectedCount={contextSelection.selectedBlockIds.length}
          selectedBlocks={contextSelection.selectedBlockIds}
          onClear={clearBlockSelection}
          onSelectAll={selectAllVisible}
          totalVisible={filteredBlocks.length}
        />
      )}
    </div>
  );
}