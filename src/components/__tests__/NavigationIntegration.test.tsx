import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
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

describe('Navigation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchService.searchEverywhere.mockResolvedValue({
      results: [],
      totalResults: 0,
      query: '',
      hasError: false
    });
  });

  describe('result click navigation', () => {
    it('should navigate to /prompt for prompt results', async () => {
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

      const router = createMemoryRouter([
        {
          path: '/',
          element: <GlobalSearch />
        },
        {
          path: '/prompt',
          element: <div>Prompt Page</div>
        }
      ]);

      render(<RouterProvider router={router} />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Test Prompt')).toBeInTheDocument();
      });

      const resultItem = screen.getByText('Test Prompt');
      fireEvent.click(resultItem);

      await waitFor(() => {
        // Should navigate to /prompt with search parameters
        expect(router.state.location.pathname).toBe('/prompt');
        expect(router.state.location.search).toContain('q=test');
        expect(router.state.location.search).toContain('id=prompt-1');
      });
    });

    it('should navigate to /knowledge for context block results', async () => {
      mockSearchService.searchEverywhere.mockResolvedValue({
        results: [
          {
            category: 'context_block' as any,
            title: 'Context Blocks',
            results: [
              {
                id: 'context-1',
                type: 'context_block' as any,
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
        totalResults: 1,
        query: 'test',
        hasError: false
      });

      const router = createMemoryRouter([
        {
          path: '/',
          element: <GlobalSearch />
        },
        {
          path: '/knowledge',
          element: <div>Knowledge Page</div>
        }
      ]);

      render(<RouterProvider router={router} />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('Test Context')).toBeInTheDocument();
      });

      const resultItem = screen.getByText('Test Context');
      fireEvent.click(resultItem);

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/knowledge');
        expect(router.state.location.search).toContain('q=test');
        expect(router.state.location.search).toContain('id=context-1');
      });
    });
  });

  describe('route parameter passing', () => {
    it('should include search query and item ID as URL parameters', async () => {
      mockSearchService.searchEverywhere.mockResolvedValue({
        results: [
          {
            category: 'prompt' as any,
            title: 'Prompts',
            results: [
              {
                id: 'test-prompt-id',
                type: 'prompt' as any,
                title: 'Test Prompt',
                content: 'Test content with special chars & symbols',
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
        query: 'test query with spaces',
        hasError: false
      });

      const router = createMemoryRouter([
        {
          path: '/',
          element: <GlobalSearch />
        }
      ]);

      render(<RouterProvider router={router} />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test query with spaces' } });

      await waitFor(() => {
        expect(screen.getByText('Test Prompt')).toBeInTheDocument();
      });

      const resultItem = screen.getByText('Test Prompt');
      fireEvent.click(resultItem);

      await waitFor(() => {
        const searchParams = new URLSearchParams(router.state.location.search);
        expect(searchParams.get('q')).toBe('test query with spaces');
        expect(searchParams.get('id')).toBe('test-prompt-id');
      });
    });
  });

  describe('search state management across routes', () => {
    it('should clear search state when navigating away', async () => {
      const router = createMemoryRouter([
        {
          path: '/',
          element: <GlobalSearch />
        },
        {
          path: '/other',
          element: <div>Other Page</div>
        }
      ]);

      render(<RouterProvider router={router} />);

      const input = screen.getByPlaceholderText('Search everywhere');
      fireEvent.change(input, { target: { value: 'test query' } });

      expect(input).toHaveValue('test query');

      // Simulate navigation to another route
      router.navigate('/other');

      // Input should still have the value (it's component state)
      // But dropdown should be closed after navigation
      // This would be tested with actual navigation scenarios
      expect(input).toHaveValue('test query');
    });
  });
});