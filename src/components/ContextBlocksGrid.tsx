import React, { useMemo, useCallback, useRef } from 'react';
import { ContextBlock } from './ContextBlock';
import { SelectionActionBar } from './SelectionActionBar';
import { mockContextBlocks } from '../data/mockData';

interface ContextBlocksGridProps {
  selectedProject: string;
}

export function ContextBlocksGrid({ selectedProject }: ContextBlocksGridProps) {
  const [selectedBlocks, setSelectedBlocks] = React.useState<number[]>([]);
  const [searchQuery] = React.useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  // Filter blocks based on project and search query
  const filteredBlocks = useMemo(() => {
    let blocks = mockContextBlocks.filter(block => {
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
  }, [selectedProject, searchQuery]);

  // Toggle block selection
  const toggleBlockSelection = useCallback((blockId: number) => {
    setSelectedBlocks(prev =>
      prev.includes(blockId)
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedBlocks([]);
  }, []);

  // Select all visible blocks
  const selectAllVisible = useCallback(() => {
    setSelectedBlocks(filteredBlocks.map(block => block.id));
  }, [filteredBlocks]);

  // Grid keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>, blockId: number) => {
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
        className="flex-1 p-6 overflow-y-auto"
        role="grid"
        aria-label="Context blocks grid"
      >
        {filteredBlocks.length === 0 ? (
          <div className="text-center text-neutral-400 mt-8">
            <div className="text-lg mb-2">No context blocks found</div>
            <div className="text-sm">Try adjusting your search or filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBlocks.map((block) => (
              <ContextBlock
                key={block.id}
                block={block}
                isSelected={selectedBlocks.includes(block.id)}
                onSelect={() => toggleBlockSelection(block.id)}
                onKeyDown={(e) => handleKeyDown(e, block.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selection Action Bar */}
      {selectedBlocks.length > 0 && (
        <SelectionActionBar
          selectedCount={selectedBlocks.length}
          onClear={clearSelection}
          onSelectAll={selectAllVisible}
          totalVisible={filteredBlocks.length}
        />
      )}
    </div>
  );
}