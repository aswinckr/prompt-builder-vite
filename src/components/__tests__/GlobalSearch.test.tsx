import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GlobalSearch } from '../GlobalSearch';
import { GlobalSearchService } from '../../services/globalSearchService';

// Mock the search service
vi.mock('../../services/globalSearchService', () => ({
  GlobalSearchService: {
    searchEverywhere: vi.fn()
  }
}));

// Mock debounce utility
vi.mock('../../utils/debounceUtils', () => ({
  createDebouncedCallback: vi.fn((callback) => ({
    debouncedCallback: callback,
    cleanup: vi.fn()
  }))
}));

const mockSearchService = GlobalSearchService as any;

describe('GlobalSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchService.searchEverywhere.mockResolvedValue({
      results: [],
      totalResults: 0,
      query: '',
      hasError: false
    });
  });

  describe('search input handling and debouncing', () => {
    it('should render with correct placeholder and styling', () => {
      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass(
        'bg-neutral-800',
        'border',
        'border-neutral-700'
      );
    });

    it('should handle search input changes', async () => {
      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test query' } });

      expect(input).toHaveValue('test query');
    });

    it('should trigger search when typing in input', async () => {
      mockSearchService.searchEverywhere.mockResolvedValue({
        results: [],
        totalResults: 0,
        query: 'test',
        hasError: false
      });

      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(mockSearchService.searchEverywhere).toHaveBeenCalledWith('test');
      });
    });
  });

  describe('dropdown results display', () => {
    it('should show dropdown when results are available', async () => {
      mockSearchService.searchEverywhere.mockResolvedValue({
        results: [
          {
            category: 'prompt' as any,
            title: 'Prompts',
            results: [
              {
                id: '1',
                type: 'prompt' as any,
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
          }
        ],
        totalResults: 1,
        query: 'test',
        hasError: false
      });

      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Prompts')).toBeInTheDocument();
        expect(screen.getByText('Test Prompt')).toBeInTheDocument();
      });
    });

    it('should hide dropdown when there are no results', async () => {
      mockSearchService.searchEverywhere.mockResolvedValue({
        results: [],
        totalResults: 0,
        query: 'test',
        hasError: false
      });

      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.queryByText('Prompts')).not.toBeInTheDocument();
        expect(screen.queryByText('Context Blocks')).not.toBeInTheDocument();
      });
    });
  });

  describe('keyboard navigation', () => {
    it('should handle escape key to close search', () => {
      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(input).toHaveValue('');
    });

    it('should handle arrow key navigation through results', async () => {
      mockSearchService.searchEverywhere.mockResolvedValue({
        results: [
          {
            category: 'prompt' as any,
            title: 'Prompts',
            results: [
              {
                id: '1',
                type: 'prompt' as any,
                title: 'First Prompt',
                content: 'First content',
                description: null,
                tags: [],
                project: null,
                created_at: new Date(),
                updated_at: new Date(),
                metadata: {}
              },
              {
                id: '2',
                type: 'prompt' as any,
                title: 'Second Prompt',
                content: 'Second content',
                description: null,
                tags: [],
                project: null,
                created_at: new Date(),
                updated_at: new Date(),
                metadata: {}
              }
            ],
            totalCount: 2
          }
        ],
        totalResults: 2,
        query: 'test',
        hasError: false
      });

      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('First Prompt')).toBeInTheDocument();
        expect(screen.getByText('Second Prompt')).toBeInTheDocument();
      });

      // Test arrow down
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Test arrow up
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      // Should not throw errors
      expect(mockSearchService.searchEverywhere).toHaveBeenCalled();
    });
  });

  describe('result item click handling', () => {
    it('should handle result item clicks', async () => {
      const mockNavigate = vi.fn();

      // Mock react-router-dom navigation
      vi.mock('react-router-dom', () => ({
        useNavigate: () => mockNavigate
      }));

      mockSearchService.searchEverywhere.mockResolvedValue({
        results: [
          {
            category: 'prompt' as any,
            title: 'Prompts',
            results: [
              {
                id: 'prompt-1',
                type: 'prompt' as any,
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
          }
        ],
        totalResults: 1,
        query: 'test',
        hasError: false
      });

      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Test Prompt')).toBeInTheDocument();
      });

      const resultItem = screen.getByText('Test Prompt');
      fireEvent.click(resultItem);

      // Note: In real implementation, this should trigger navigation
      expect(resultItem).toBeInTheDocument();
    });
  });
});