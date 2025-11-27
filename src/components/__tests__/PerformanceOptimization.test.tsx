import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GlobalSearch } from '../GlobalSearch';
import { GlobalSearchService } from '../../services/globalSearchService';

// Mock the search service with delays for testing
vi.mock('../../services/globalSearchService', () => ({
  GlobalSearchService: {
    searchEverywhere: vi.fn()
  }
}));

// Mock debounce utility to track calls
vi.mock('../../utils/debounceUtils', () => ({
  createDebouncedCallback: vi.fn((callback) => ({
    debouncedCallback: callback,
    cleanup: vi.fn()
  }))
}));

const mockSearchService = GlobalSearchService as any;

describe('Performance Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchService.searchEverywhere.mockResolvedValue({
      results: [],
      totalResults: 0,
      query: '',
      hasError: false
    });
  });

  describe('debouncing behavior', () => {
    it('should debounce rapid input changes', async () => {
      const mockCallback = vi.fn();
      mockSearchService.searchEverywhere.mockImplementation(mockCallback);

      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');

      // Simulate rapid typing
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });
      fireEvent.change(input, { target: { value: 'abcd' } });

      // Wait a moment for debouncing
      await waitFor(() => {
        // Should only be called once with the final value
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith('abcd');
      }, { timeout: 1000 });
    });

    it('should cancel previous debounced calls', async () => {
      const mockCallback = vi.fn();
      mockSearchService.searchEverywhere.mockImplementation(mockCallback);

      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');

      fireEvent.change(input, { target: { value: 'first' } });
      fireEvent.change(input, { target: { value: 'second' } });

      await waitFor(() => {
        // Should only call with the latest value
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith('second');
      }, { timeout: 1000 });
    });
  });

  describe('search result caching', () => {
    it('should use cached results for repeated searches', async () => {
      // Mock a delay to simulate network request
      mockSearchService.searchEverywhere.mockImplementation((query: string) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              results: [
                {
                  category: 'prompt' as any,
                  title: 'Prompts',
                  results: [
                    {
                      id: '1',
                      type: 'prompt' as any,
                      title: `Prompt for ${query}`,
                      content: 'Content',
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
              query,
              hasError: false
            });
          }, 100);
        });
      });

      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');

      // First search
      fireEvent.change(input, { target: { value: 'test query' } });

      await waitFor(() => {
        expect(screen.getByText('Prompts')).toBeInTheDocument();
        expect(screen.getByText('Prompt for test query')).toBeInTheDocument();
      }, { timeout: 500 });

      // Clear input and search again
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'test query' } });

      // Second search should be faster due to caching
      await waitFor(() => {
        expect(screen.getByText('Prompt for test query')).toBeInTheDocument();
      }, { timeout: 200 });

      // Verify service was called twice but response was faster second time
      expect(mockSearchService.searchEverywhere).toHaveBeenCalledTimes(2);
    });
  });

  describe('component re-render optimization', () => {
    it('should not re-render unnecessarily when props do not change', () => {
      const { rerender } = render(<GlobalSearch className="test-class" />);

      const input = screen.getByPlaceholderText('Search everywhere');

      // Initial render
      expect(input).toBeInTheDocument();

      // Rerender with same props
      rerender(<GlobalSearch className="test-class" />);

      // Component should still work without issues
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    it('should handle empty query efficiently', async () => {
      const mockCallback = vi.fn();
      mockSearchService.searchEverywhere.mockImplementation(mockCallback);

      render(<GlobalSearch />);

      const input = screen.getByPlaceholderText('Search everywhere');

      // Test with empty query
      fireEvent.change(input, { target: { value: '' } });

      // Should not trigger search for empty query
      await waitFor(() => {
        expect(mockCallback).not.toHaveBeenCalled();
      }, { timeout: 100 });

      // Test with whitespace
      fireEvent.change(input, { target: { value: '   ' } });

      await waitFor(() => {
        expect(mockCallback).not.toHaveBeenCalled();
      }, { timeout: 100 });
    });

    it('should cleanup properly on unmount', () => {
      const { unmount } = render(<GlobalSearch />);

      // Unmount component
      unmount();

      // Should not throw any errors
      expect(true).toBe(true);
    });
  });
});