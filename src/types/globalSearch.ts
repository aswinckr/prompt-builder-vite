import { SavedPrompt } from './SavedPrompt';
import { ContextBlock } from './ContextBlock';

/**
 * Search category enumeration
 */
export enum SearchCategory {
  PROMPT = 'prompt',
  CONTEXT_BLOCK = 'context_block'
}

/**
 * Unified search result interface
 */
export interface SearchResult {
  id: string;
  type: SearchCategory;
  title: string;
  content: string;
  description?: string | null;
  tags: string[];
  project?: {
    id: string;
    name: string;
    icon: string;
  } | null;
  created_at: Date;
  updated_at: Date;
  // Additional metadata specific to each type
  metadata?: {
    folder?: string | null;
    isTemporary?: boolean;
  };
}

/**
 * Search result group for categorization
 */
export interface SearchResultGroup {
  category: SearchCategory;
  title: string;
  results: SearchResult[];
  totalCount: number;
}

/**
 * Unified search response
 */
export interface GlobalSearchResponse {
  results: SearchResultGroup[];
  totalResults: number;
  query: string;
  hasError: boolean;
  error?: string;
}

/**
 * Search cache entry
 */
export interface SearchCacheEntry {
  query: string;
  response: GlobalSearchResponse;
  timestamp: number;
}