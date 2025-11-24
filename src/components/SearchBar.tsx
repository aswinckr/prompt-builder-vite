import React, { useRef, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';

interface SearchBarProps {
  showFullWidth?: boolean;
  onAddKnowledge?: () => void;
  onAddPrompt?: () => void;
  searchType?: 'context' | 'prompts';
}

export function SearchBar({
  showFullWidth = true,
  onAddKnowledge,
  onAddPrompt,
  searchType = 'context'
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setSearchQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`${showFullWidth ? 'p-4 md:p-6' : ''} ${showFullWidth ? 'border-b border-neutral-700' : ''}`}>
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
            size={18}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            placeholder={searchType === 'prompts' ? 'Search prompts...' : 'Search context blocks...'}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 md:py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
            aria-label={searchType === 'prompts' ? 'Search prompts by title or content' : 'Search context blocks by title or content'}
            aria-describedby="search-instructions"
          />
          <div id="search-instructions" className="sr-only">
            Use Cmd+F to focus this search field. Press Escape to clear search.
          </div>
        </div>

        {/* Add Knowledge Button */}
        {onAddKnowledge && searchType === 'context' && (
          <button
            onClick={onAddKnowledge}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 whitespace-nowrap"
            aria-label="Add new knowledge context block"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Knowledge</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}

        {/* Add Prompt Button */}
        {onAddPrompt && (searchType === 'prompts' || true) && (
          <button
            onClick={onAddPrompt}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 whitespace-nowrap"
            aria-label="Add new prompt template"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Prompt</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>
    </div>
  );
}