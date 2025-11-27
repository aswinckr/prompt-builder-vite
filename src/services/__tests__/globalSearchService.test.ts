import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GlobalSearchService } from '../globalSearchService';
import { PromptService } from '../promptService';
import { ContextService } from '../contextService';
import { SearchCategory } from '../../types/globalSearch';

// Mock the services
vi.mock('../promptService');
vi.mock('../contextService');

const mockPromptService = PromptService as any;
const mockContextService = ContextService as any;

describe('GlobalSearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    GlobalSearchService.clearCache();
  });

  describe('combined search functionality', () => {
    it('should combine results from both prompt and context services', async () => {
      // Mock prompt service response
      mockPromptService.searchPrompts.mockResolvedValue({
        data: [
          {
            id: 'prompt-1',
            title: 'Test Prompt',
            content: 'This is a test prompt',
            description: 'Test description',
            tags: ['test'],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            project: null,
            folder: null
          }
        ],
        error: null
      });

      // Mock context service response
      mockContextService.searchContextBlocks.mockResolvedValue({
        data: [
          {
            id: 'context-1',
            title: 'Test Context',
            content: 'This is a test context block',
            tags: ['context'],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            project: null,
            isTemporary: false
          }
        ],
        error: null
      });

      const result = await GlobalSearchService.searchEverywhere('test');

      expect(result.results).toHaveLength(2);
      expect(result.totalResults).toBe(2);
      expect(result.query).toBe('test');
      expect(result.hasError).toBe(false);

      // Check prompt results
      const promptGroup = result.results.find(r => r.category === SearchCategory.PROMPT);
      expect(promptGroup).toBeDefined();
      expect(promptGroup?.results).toHaveLength(1);
      expect(promptGroup?.results[0].title).toBe('Test Prompt');

      // Check context results
      const contextGroup = result.results.find(r => r.category === SearchCategory.CONTEXT_BLOCK);
      expect(contextGroup).toBeDefined();
      expect(contextGroup?.results).toHaveLength(1);
      expect(contextGroup?.results[0].title).toBe('Test Context');
    });
  });

  describe('error handling', () => {
    it('should handle errors from both services gracefully', async () => {
      mockPromptService.searchPrompts.mockRejectedValue(new Error('Prompt service error'));
      mockContextService.searchContextBlocks.mockRejectedValue(new Error('Context service error'));

      const result = await GlobalSearchService.searchEverywhere('test');

      expect(result.results).toHaveLength(0);
      expect(result.totalResults).toBe(0);
      expect(result.hasError).toBe(true);
      expect(result.error).toContain('Prompt search: Error');
      expect(result.error).toContain('Context search: Error');
    });

    it('should handle partial service failures', async () => {
      mockPromptService.searchPrompts.mockRejectedValue(new Error('Prompt service error'));
      mockContextService.searchContextBlocks.mockResolvedValue({
        data: [
          {
            id: 'context-1',
            title: 'Test Context',
            content: 'This is a test context block',
            tags: ['context'],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            project: null,
            isTemporary: false
          }
        ],
        error: null
      });

      const result = await GlobalSearchService.searchEverywhere('test');

      expect(result.results).toHaveLength(1);
      expect(result.hasError).toBe(true);
      expect(result.totalResults).toBe(1);

      const contextGroup = result.results.find(r => r.category === SearchCategory.CONTEXT_BLOCK);
      expect(contextGroup).toBeDefined();
      expect(contextGroup?.results).toHaveLength(1);
    });
  });

  describe('result limiting and sorting', () => {
    it('should limit results per category to specified limit', async () => {
      // Mock more results than the limit
      const mockPrompts = Array.from({ length: 15 }, (_, i) => ({
        id: `prompt-${i}`,
        title: `Prompt ${i}`,
        content: `Content ${i}`,
        description: null,
        tags: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: `2024-01-01T00:${String(i).padStart(2, '0')}:00Z`, // Different times for sorting
        project: null,
        folder: null
      }));

      mockPromptService.searchPrompts.mockResolvedValue({
        data: mockPrompts,
        error: null
      });

      mockContextService.searchContextBlocks.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await GlobalSearchService.searchEverywhere('test', 5);

      const promptGroup = result.results.find(r => r.category === SearchCategory.PROMPT);
      expect(promptGroup?.results).toHaveLength(5); // Limited to 5
      expect(promptGroup?.totalCount).toBe(15); // Total count should still be 15
    });
  });

  describe('empty query handling', () => {
    it('should return empty results for empty query', async () => {
      const result = await GlobalSearchService.searchEverywhere('');

      expect(result.results).toHaveLength(0);
      expect(result.totalResults).toBe(0);
      expect(result.query).toBe('');
      expect(result.hasError).toBe(false);

      // Should not call the underlying services
      expect(mockPromptService.searchPrompts).not.toHaveBeenCalled();
      expect(mockContextService.searchContextBlocks).not.toHaveBeenCalled();
    });

    it('should return empty results for whitespace-only query', async () => {
      const result = await GlobalSearchService.searchEverywhere('   ');

      expect(result.results).toHaveLength(0);
      expect(result.totalResults).toBe(0);
      expect(result.query).toBe('');
      expect(result.hasError).toBe(false);

      // Should not call the underlying services
      expect(mockPromptService.searchPrompts).not.toHaveBeenCalled();
      expect(mockContextService.searchContextBlocks).not.toHaveBeenCalled();
    });

    it('should cache empty query results', async () => {
      await GlobalSearchService.searchEverywhere('');

      // Second call should hit cache
      await GlobalSearchService.searchEverywhere('');

      // Should still not call the underlying services
      expect(mockPromptService.searchPrompts).not.toHaveBeenCalled();
      expect(mockContextService.searchContextBlocks).not.toHaveBeenCalled();
    });
  });
});