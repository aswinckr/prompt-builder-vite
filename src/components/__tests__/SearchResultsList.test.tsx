import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchResultsList } from '../SearchResultsList';
import { GlobalSearchResponse, SearchCategory, SearchResult } from '../../types/globalSearch';

describe('SearchResultsList Component', () => {
  const mockResults: GlobalSearchResponse = {
    results: [
      {
        category: SearchCategory.PROMPT,
        title: 'Prompts',
        results: [
          {
            id: 'prompt-1',
            type: SearchCategory.PROMPT,
            title: 'Test Prompt',
            content: 'Test content',
            description: null,
            tags: [],
            project: null,
            created_at: new Date(),
            updated_at: new Date(),
            metadata: {}
          }
        ],
        totalCount: 1
      },
      {
        category: SearchCategory.CONTEXT_BLOCK,
        title: 'Context Blocks',
        results: [
          {
            id: 'context-1',
            type: SearchCategory.CONTEXT_BLOCK,
            title: 'Test Context',
            content: 'Test context content',
            description: null,
            tags: [],
            project: null,
            created_at: new Date(),
            updated_at: new Date(),
            metadata: {}
          }
        ],
        totalCount: 1
      }
    ],
    totalResults: 2,
    query: 'test',
    hasError: false
  };

  describe('no results state', () => {
    it('should display no results message when no results found', () => {
      const noResultsResponse: GlobalSearchResponse = {
        results: [],
        totalResults: 0,
        query: 'nonexistent',
        hasError: false
      };

      render(<SearchResultsList searchResults={noResultsResponse} onResultClick={vi.fn()} />);

      expect(screen.getByText('No results found for "nonexistent"')).toBeInTheDocument();
    });

    it('should not display no results message when there are results', () => {
      render(<SearchResultsList searchResults={mockResults} onResultClick={vi.fn()} />);

      expect(screen.queryByText(/No results found/)).not.toBeInTheDocument();
    });
  });

  describe('loading state display', () => {
    it('should show loading indicator when loading', () => {
      render(<SearchResultsList isLoading={true} searchResults={null} onResultClick={vi.fn()} />);

      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });

    it('should not show loading when not loading', () => {
      render(<SearchResultsList isLoading={false} searchResults={null} onResultClick={vi.fn()} />);

      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });

    it('should not show loading when results are available', () => {
      render(
        <SearchResultsList
          isLoading={true}
          searchResults={mockResults}
          onResultClick={vi.fn()}
        />
      );

      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });
  });

  describe('result group display', () => {
    it('should display all result groups', () => {
      render(<SearchResultsList searchResults={mockResults} onResultClick={vi.fn()} />);

      expect(screen.getByText('Prompts')).toBeInTheDocument();
      expect(screen.getByText('Context Blocks')).toBeInTheDocument();
      expect(screen.getByText('Test Prompt')).toBeInTheDocument();
      expect(screen.getByText('Test Context')).toBeInTheDocument();
    });

    it('should handle click events on results', () => {
      const mockOnClick = vi.fn();
      render(<SearchResultsList searchResults={mockResults} onResultClick={mockOnClick} />);

      const promptResult = screen.getByText('Test Prompt');
      promptResult.click();

      // Should have been called with the prompt result
      expect(mockOnClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'prompt-1',
          title: 'Test Prompt'
        })
      );
    });
  });
});