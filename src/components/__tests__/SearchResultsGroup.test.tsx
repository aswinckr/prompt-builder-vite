import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SearchResultsGroup } from '../SearchResultsGroup';
import { SearchResult, SearchCategory, SearchResultGroup } from '../../types/globalSearch';

describe('SearchResultsGroup Component', () => {
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: SearchCategory.PROMPT,
      title: 'Test Prompt 1',
      content: 'Content 1',
      description: null,
      tags: ['test'],
      project: null,
      created_at: new Date(),
      updated_at: new Date(),
      metadata: {}
    },
    {
      id: '2',
      type: SearchCategory.PROMPT,
      title: 'Test Prompt 2',
      content: 'Content 2',
      description: 'Description 2',
      tags: ['test', 'sample'],
      project: {
        id: 'project-1',
        name: 'Test Project',
        icon: '📝'
      },
      created_at: new Date(),
      updated_at: new Date(),
      metadata: {}
    }
  ];

  const mockGroup: SearchResultGroup = {
    category: SearchCategory.PROMPT,
    title: 'Prompts',
    results: mockResults,
    totalCount: 5 // More than displayed
  };

  describe('categorization headers', () => {
    it('should display category header with title', () => {
      render(<SearchResultsGroup group={mockGroup} query="test" />);

      expect(screen.getByText('Prompts')).toBeInTheDocument();
    });

    it('should display result count when more results than displayed', () => {
      render(<SearchResultsGroup group={mockGroup} query="test" />);

      expect(screen.getByText('(showing 2 of 5)')).toBeInTheDocument();
    });

    it('should not display count when all results are shown', () => {
      const groupWithAllResults: SearchResultGroup = {
        ...mockGroup,
        results: mockResults,
        totalCount: 2
      };

      render(<SearchResultsGroup group={groupWithAllResults} query="test" />);

      expect(screen.queryByText(/\(showing/)).not.toBeInTheDocument();
    });
  });

  describe('empty categories', () => {
    it('should handle empty results gracefully', () => {
      const emptyGroup: SearchResultGroup = {
        category: SearchCategory.CONTEXT_BLOCK,
        title: 'Context Blocks',
        results: [],
        totalCount: 0
      };

      render(<SearchResultsGroup group={emptyGroup} query="test" />);

      expect(screen.getByText('Context Blocks')).toBeInTheDocument();
    });

    it('should render no result items when results array is empty', () => {
      const emptyGroup: SearchResultGroup = {
        category: SearchCategory.CONTEXT_BLOCK,
        title: 'Context Blocks',
        results: [],
        totalCount: 0
      };

      render(<SearchResultsGroup group={emptyGroup} query="test" />);

      // Should not have any result items
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });
  });
});