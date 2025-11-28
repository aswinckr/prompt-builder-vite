// Conversation types for prompt history tracking

export interface Conversation {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  model_name: string;
  model_provider: string;
  status: 'active' | 'archived' | 'deleted';
  is_favorite: boolean;
  token_usage: number;
  execution_duration_ms: number;
  estimated_cost: number;
  original_prompt_content: string;
  context_block_ids: string[];
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_count: number;
  message_order: number;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationTag {
  id: string;
  conversation_id: string;
  tag: string;
  created_at: Date;
}

export interface CreateConversationData {
  title?: string;
  description?: string | null;
  model_name: string;
  model_provider: string;
  original_prompt_content: string;
  context_block_ids?: string[];
  metadata?: Record<string, any>;
  project_id?: string | null;
}

export interface UpdateConversationData {
  title?: string;
  description?: string | null;
  status?: 'active' | 'archived' | 'deleted';
  is_favorite?: boolean;
  token_usage?: number;
  execution_duration_ms?: number;
  estimated_cost?: number;
  metadata?: Record<string, any>;
  project_id?: string | null;
}

export interface CreateConversationMessageData {
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_count?: number;
  message_order?: number; // Optional - will be auto-calculated by service
  metadata?: Record<string, any>;
}

export interface UpdateConversationMessageData {
  role?: 'user' | 'assistant' | 'system';
  content?: string;
  token_count?: number;
  message_order?: number;
  metadata?: Record<string, any>;
}

export interface ConversationSearchResult {
  id: string;
  title: string;
  description: string | null;
  model_name: string;
  is_favorite: boolean;
  created_at: Date;
  updated_at: Date;
  rank: number;
}

export interface ConversationStats {
  total_conversations: number;
  favorite_conversations: number;
  total_messages: number;
  total_tokens: number;
  total_cost: number;
}

export interface ConversationFilters {
  search_query?: string;
  date_from?: Date;
  date_to?: Date;
  model_name?: string;
  model_provider?: string;
  project_id?: string;
  is_favorite?: boolean;
  status?: 'active' | 'archived' | 'deleted';
  tags?: string[];
}

export interface ConversationListOptions {
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'model_name';
  sort_order?: 'asc' | 'desc';
  filters?: ConversationFilters;
}