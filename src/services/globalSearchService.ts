import { PromptService } from './promptService';
import { ContextService } from './contextService';
import { DatabaseResponse } from './databaseService';
import {
  SearchResult,
  SearchResultGroup,
  GlobalSearchResponse,
  SearchCategory,
  SearchCacheEntry
} from '../types/globalSearch';

/**
 * Global Search Service
 * Combines search results from both PromptService and ContextService
 */
export class GlobalSearchService {
  private static cache = new Map<string, SearchCacheEntry>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_RESULTS_PER_CATEGORY = 10;

  /**
   * Search across both prompts and context blocks
   * @param query - Search query string
   * @param limit - Maximum results per category (default: 10)
   * @returns Unified search response with categorized results
   */
  static async searchEverywhere(
    query: string,
    limit: number = this.MAX_RESULTS_PER_CATEGORY
  ): Promise<GlobalSearchResponse> {
    try {
      // Check cache first
      const cachedResult = this.getCachedResult(query);
      if (cachedResult) {
        return cachedResult;
      }

      // Handle empty query
      if (!query || query.trim().length === 0) {
        const emptyResponse: GlobalSearchResponse = {
          results: [],
          totalResults: 0,
          query: '',
          hasError: false
        };
        this.cacheResult(query, emptyResponse);
        return emptyResponse;
      }

      const trimmedQuery = query.trim();

      // Execute searches in parallel
      const [promptSearchResult, contextSearchResult] = await Promise.allSettled([
        PromptService.searchPrompts(trimmedQuery),
        ContextService.searchContextBlocks(trimmedQuery)
      ]);

      // Transform results
      const promptResults = this.transformPromptResults(
        promptSearchResult.status === 'fulfilled' ? promptSearchResult.value : null,
        limit
      );

      const contextResults = this.transformContextResults(
        contextSearchResult.status === 'fulfilled' ? contextSearchResult.value : null,
        limit
      );

      // Build response
      const response: GlobalSearchResponse = {
        results: [
          promptResults,
          contextResults
        ].filter(group => group.results.length > 0),
        totalResults: promptResults.totalCount + contextResults.totalCount,
        query: trimmedQuery,
        hasError: promptSearchResult.status === 'rejected' || contextSearchResult.status === 'rejected',
        error: this.getErrorMessage(promptSearchResult, contextSearchResult)
      };

      // Cache the result
      this.cacheResult(query, response);

      return response;
    } catch (error) {
      const errorResponse: GlobalSearchResponse = {
        results: [],
        totalResults: 0,
        query: query,
        hasError: true,
        error: error instanceof Error ? error.message : 'Unknown search error'
      };
      return errorResponse;
    }
  }

  /**
   * Transform prompt search results to unified format
   */
  private static transformPromptResults(
    result: DatabaseResponse<any[]> | null,
    limit: number
  ): SearchResultGroup {
    if (!result || !result.data || result.error) {
      return {
        category: SearchCategory.PROMPT,
        title: 'Prompts',
        results: [],
        totalCount: 0
      };
    }

    const searchResults: SearchResult[] = result.data
      .slice(0, limit)
      .map((prompt: any) => ({
        id: prompt.id,
        type: SearchCategory.PROMPT,
        title: prompt.title,
        content: prompt.content,
        description: prompt.description,
        tags: prompt.tags || [],
        project: prompt.project || null,
        created_at: new Date(prompt.created_at),
        updated_at: new Date(prompt.updated_at),
        metadata: {
          folder: prompt.folder || null
        }
      }));

    return {
      category: SearchCategory.PROMPT,
      title: 'Prompts',
      results: searchResults,
      totalCount: result.data.length
    };
  }

  /**
   * Transform context block search results to unified format
   */
  private static transformContextResults(
    result: DatabaseResponse<any[]> | null,
    limit: number
  ): SearchResultGroup {
    if (!result || !result.data || result.error) {
      return {
        category: SearchCategory.CONTEXT_BLOCK,
        title: 'Context Blocks',
        results: [],
        totalCount: 0
      };
    }

    const searchResults: SearchResult[] = result.data
      .slice(0, limit)
      .map((contextBlock: any) => ({
        id: contextBlock.id,
        type: SearchCategory.CONTEXT_BLOCK,
        title: contextBlock.title,
        content: contextBlock.content,
        description: null,
        tags: contextBlock.tags || [],
        project: contextBlock.project || null,
        created_at: new Date(contextBlock.created_at),
        updated_at: new Date(contextBlock.updated_at),
        metadata: {
          isTemporary: contextBlock.isTemporary || false
        }
      }));

    return {
      category: SearchCategory.CONTEXT_BLOCK,
      title: 'Context Blocks',
      results: searchResults,
      totalCount: result.data.length
    };
  }

  /**
   * Get cached result if valid
   */
  private static getCachedResult(query: string): GlobalSearchResponse | null {
    const cacheKey = query.toLowerCase().trim();
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.response;
  }

  /**
   * Cache search result
   */
  private static cacheResult(query: string, response: GlobalSearchResponse): void {
    const cacheKey = query.toLowerCase().trim();
    const entry: SearchCacheEntry = {
      query,
      response,
      timestamp: Date.now()
    };

    this.cache.set(cacheKey, entry);

    // Clean up old cache entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  /**
   * Clean up expired cache entries
   */
  private static cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Extract error message from Promise results
   */
  private static getErrorMessage(
    promptResult: PromiseSettledResult<any>,
    contextResult: PromiseSettledResult<any>
  ): string | undefined {
    const errors: string[] = [];

    if (promptResult.status === 'rejected') {
      errors.push(`Prompt search: ${promptResult.reason}`);
    }

    if (contextResult.status === 'rejected') {
      errors.push(`Context search: ${contextResult.reason}`);
    }

    return errors.length > 0 ? errors.join('; ') : undefined;
  }

  /**
   * Clear all cached search results
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; entries: Array<{ query: string; age: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([query, entry]) => ({
      query,
      age: now - entry.timestamp
    }));

    return {
      size: this.cache.size,
      entries
    };
  }
}