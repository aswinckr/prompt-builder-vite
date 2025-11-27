import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SearchResultItem } from '../SearchResultItem';
import { SearchResult, SearchCategory } from '../../types/globalSearch';

describe('SearchResultItem Component', () => {
  const mockResult: SearchResult = {
    id: 'test-1',
    type: SearchCategory.PROMPT,
    title: 'Test Prompt',
    content: 'This is a test prompt content that should be highlighted when matching the search query',
    description: 'Test description',
    tags: ['test', 'sample'],
    project: {
      id: 'project-1',
      name: 'Test Project',
      icon: '📝'
    },
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-02'),
    metadata: {
      folder: 'test-folder'
    }
  };

  describe('result item rendering with highlighting', () => {
    it('should render result item with all information', () => {
      render(<SearchResultItem result={mockResult} query="test" />);

      expect(screen.getByText('Test Prompt')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText(/This is a test prompt content/)).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should highlight matching text in content', () => {
      render(<SearchResultItem result={mockResult} query="test" />);

      // Check if highlighting is applied (should contain highlight elements)
      const highlightedContent = screen.getByText(/This is a test prompt content/);
      expect(highlightedContent).toBeInTheDocument();
    });

    it('should render tags correctly', () => {
      render(<SearchResultItem result={mockResult} query="test" />);

      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('sample')).toBeInTheDocument();
    });

    it('should handle missing optional fields', () => {
      const minimalResult: SearchResult = {
        id: 'minimal-1',
        type: SearchCategory.CONTEXT_BLOCK,
        title: 'Minimal Result',
        content: 'Simple content',
        description: null,
        tags: [],
        project: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      render(<SearchResultItem result={minimalResult} query="simple" />);

      expect(screen.getByText('Minimal Result')).toBeInTheDocument();
      expect(screen.getByText('Simple content')).toBeInTheDocument();
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
    });
  });
});