import { supabase } from '../lib/supabase'
import { DatabaseService, DatabaseResponse } from './databaseService'
import {
  ConversationMessage,
  CreateConversationMessageData,
  UpdateConversationMessageData
} from '../types/Conversation'

export class ConversationMessageService {
  // Get all messages for a conversation
  static async getMessagesByConversationId(
    conversationId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<DatabaseResponse<ConversationMessage[]>> {
    try {
      const { limit = 100, offset = 0 } = options || {}

      let query = supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('message_order', { ascending: true })

      if (limit && offset !== undefined) {
        query = query.range(offset, offset + limit - 1)
      }

      const { data, error } = await query

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<ConversationMessage>(data || [])
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get a specific message by ID
  static async getMessageById(id: string): Promise<DatabaseResponse<ConversationMessage>> {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('id', id)
        .single()

      return await DatabaseService.handleResponse(
        DatabaseService.convertRow<ConversationMessage>(data)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Create a new message with automatic message ordering
  static async createMessage(messageData: CreateConversationMessageData): Promise<DatabaseResponse<ConversationMessage>> {
    try {
      // Validate required fields
      if (!messageData.conversation_id) {
        return { data: null, error: 'Conversation ID is required' }
      }
      if (!messageData.role || !['user', 'assistant', 'system'].includes(messageData.role)) {
        return { data: null, error: 'Valid role is required (user, assistant, or system)' }
      }
      if (!messageData.content) {
        return { data: null, error: 'Message content is required' }
      }

      // Get the next message order for this conversation
      const orderResult = await this.getNextMessageOrder(messageData.conversation_id)
      if (orderResult.error) {
        return { data: null, error: `Failed to get message order: ${orderResult.error}` }
      }
      if (orderResult.data === null) {
        return { data: null, error: 'Could not determine message order' }
      }

      const messageOrder = orderResult.data

      const { data, error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: messageData.conversation_id,
          role: messageData.role,
          content: messageData.content,
          token_count: Math.round(messageData.token_count || 0),
          message_order: messageOrder,
          metadata: messageData.metadata || {}
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating message:', error)
        return { data: null, error: `Database error: ${error.message}` }
      }

      return await DatabaseService.handleResponse(
        DatabaseService.convertRow<ConversationMessage>(data)
      )
    } catch (err) {
      console.error('Error in createMessage:', err)
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Update a message
  static async updateMessage(
    id: string,
    updateData: UpdateConversationMessageData
  ): Promise<DatabaseResponse<ConversationMessage>> {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      return await DatabaseService.handleResponse(
        DatabaseService.convertRow<ConversationMessage>(data)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Delete a message
  static async deleteMessage(id: string): Promise<DatabaseResponse<void>> {
    try {
      const { error } = await supabase
        .from('conversation_messages')
        .delete()
        .eq('id', id)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Create multiple messages in bulk (for conversation restoration)
  static async createBulkMessages(
    messages: CreateConversationMessageData[]
  ): Promise<DatabaseResponse<ConversationMessage[]>> {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .insert(
          messages.map(msg => ({
            conversation_id: msg.conversation_id,
            role: msg.role,
            content: msg.content,
            token_count: Math.round(msg.token_count || 0),
            message_order: msg.message_order,
            metadata: msg.metadata || {}
          }))
        )
        .select()

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<ConversationMessage>(data || [])
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get the next message order for a conversation
  static async getNextMessageOrder(conversationId: string): Promise<DatabaseResponse<number>> {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('message_order')
        .eq('conversation_id', conversationId)
        .order('message_order', { ascending: false })
        .limit(1)

      if (error) {
        return { data: null, error: error.message }
      }

      const nextOrder = data && data.length > 0 ? data[0].message_order + 1 : 1
      return { data: nextOrder, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Reorder messages in a conversation
  static async reorderMessages(
    conversationId: string,
    messageOrders: { id: string; message_order: number }[]
  ): Promise<DatabaseResponse<void>> {
    try {
      // Update each message with its new order
      const updates = messageOrders.map(({ id, message_order }) =>
        supabase
          .from('conversation_messages')
          .update({ message_order })
          .eq('id', id)
      )

      await Promise.all(updates)

      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Search messages within a conversation
  static async searchMessagesInConversation(
    conversationId: string,
    query: string
  ): Promise<DatabaseResponse<ConversationMessage[]>> {
    try {
      if (!query.trim()) {
        return { data: [], error: null }
      }

      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .or(`content.ilike.%${query}%`)
        .order('message_order', { ascending: true })

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<ConversationMessage>(data || [])
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Delete all messages in a conversation
  static async deleteMessagesByConversationId(conversationId: string): Promise<DatabaseResponse<void>> {
    try {
      const { error } = await supabase
        .from('conversation_messages')
        .delete()
        .eq('conversation_id', conversationId)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get message count for a conversation
  static async getMessageCount(conversationId: string): Promise<DatabaseResponse<number>> {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('id', { count: 'exact' })
        .eq('conversation_id', conversationId)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data?.length || 0, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Subscribe to real-time message changes for a conversation
  static async subscribeToMessageChanges(
    conversationId: string,
    callback: (payload: any) => void
  ) {
    return DatabaseService.createRealtimeSubscription(
      'conversation_messages',
      `conversation_id=eq.${conversationId}`,
      callback
    )
  }
}