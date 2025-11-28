import { supabase } from '../lib/supabase'
import { DatabaseService, DatabaseResponse } from './databaseService'
import {
  Conversation,
  CreateConversationData,
  UpdateConversationData,
  ConversationSearchResult,
  ConversationStats,
  ConversationListOptions,
  ConversationFilters
} from '../types/Conversation'

export class ConversationService {
  // Get all conversations for the current user
  static async getConversations(options?: ConversationListOptions): Promise<DatabaseResponse<Conversation[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { limit = 50, offset = 0, sort_by = 'updated_at', sort_order = 'desc', filters } = options || {}

      let query = supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.is_favorite !== undefined) {
          query = query.eq('is_favorite', filters.is_favorite)
        }
        if (filters.model_name) {
          query = query.eq('model_name', filters.model_name)
        }
        if (filters.model_provider) {
          query = query.eq('model_provider', filters.model_provider)
        }
        if (filters.project_id) {
          query = query.eq('project_id', filters.project_id)
        }
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from.toISOString())
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to.toISOString())
        }
      }

      // Apply sorting and pagination
      query = query.order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1)

      const { data, error } = await query

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<Conversation>(data || [])
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get conversation by ID with its messages
  static async getConversationById(id: string): Promise<DatabaseResponse<Conversation>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      return await DatabaseService.handleResponse(
        DatabaseService.convertRow<Conversation>(data)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Create a new conversation
  static async createConversation(conversationData: CreateConversationData): Promise<DatabaseResponse<Conversation>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: conversationData.title || 'Untitled Conversation',
          description: conversationData.description || null,
          model_name: conversationData.model_name,
          model_provider: conversationData.model_provider,
          original_prompt_content: conversationData.original_prompt_content,
          context_block_ids: conversationData.context_block_ids || [],
          metadata: conversationData.metadata || {},
          project_id: conversationData.project_id || null,
          status: 'active',
          is_favorite: false,
          token_usage: 0,
          execution_duration_ms: 0,
          estimated_cost: 0.000000
        })
        .select()
        .single()

      return await DatabaseService.handleResponse(
        DatabaseService.convertRow<Conversation>(data)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Update a conversation
  static async updateConversation(
    id: string,
    updateData: UpdateConversationData
  ): Promise<DatabaseResponse<Conversation>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      return await DatabaseService.handleResponse(
        DatabaseService.convertRow<Conversation>(data)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Delete a conversation (and associated messages via cascade)
  static async deleteConversation(id: string): Promise<DatabaseResponse<void>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Search conversations using full-text search
  static async searchConversations(
    query: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<DatabaseResponse<ConversationSearchResult[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      if (!query.trim()) {
        return { data: [], error: null }
      }

      const { limit = 50, offset = 0 } = options

      const { data, error } = await supabase.rpc('search_conversations', {
        search_query: query,
        user_uuid: user.id,
        limit_count: limit,
        offset_count: offset
      })

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<ConversationSearchResult>(data || [])
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Toggle conversation favorite status
  static async toggleFavorite(id: string): Promise<DatabaseResponse<Conversation>> {
    try {
      // First get the current conversation to determine current favorite status
      const currentResult = await this.getConversationById(id)
      if (!currentResult.data) {
        return { data: null, error: 'Conversation not found' }
      }

      const newFavoriteStatus = !currentResult.data.is_favorite
      return await this.updateConversation(id, { is_favorite: newFavoriteStatus })
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get favorite conversations
  static async getFavoriteConversations(options?: { limit?: number; offset?: number }): Promise<DatabaseResponse<Conversation[]>> {
    return this.getConversations({
      ...options,
      filters: { is_favorite: true }
    })
  }

  // Get conversation statistics
  static async getConversationStats(): Promise<DatabaseResponse<ConversationStats>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase.rpc('get_conversation_stats', {
        user_uuid: user.id
      })

      if (error) {
        return { data: null, error: error.message }
      }

      // Convert the result to proper format
      const stats = data && data.length > 0 ? data[0] : {
        total_conversations: 0,
        favorite_conversations: 0,
        total_messages: 0,
        total_tokens: 0,
        total_cost: 0
      }

      return { data: stats, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Archive a conversation
  static async archiveConversation(id: string): Promise<DatabaseResponse<Conversation>> {
    return this.updateConversation(id, { status: 'archived' })
  }

  // Restore an archived conversation
  static async restoreConversation(id: string): Promise<DatabaseResponse<Conversation>> {
    return this.updateConversation(id, { status: 'active' })
  }

  // Subscribe to real-time conversation changes
  static async subscribeToConversationChanges(callback: (payload: any) => void) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    return DatabaseService.createRealtimeSubscription(
      'conversations',
      `user_id=eq.${user.id}`,
      callback
    )
  }
}