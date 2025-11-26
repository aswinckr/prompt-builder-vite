import { supabase } from '../lib/supabase'
import { PostgrestError } from '@supabase/supabase-js'

export interface DatabaseResult<T> {
  data: T | null
  error: PostgrestError | null
  loading: boolean
}

export interface DatabaseResponse<T> {
  data: T | null
  error: string | null
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

// Generic database operations
export class DatabaseService {
  static async handleResponse<T>(response: any): Promise<DatabaseResponse<T>> {
    // Handle both wrapped responses (like Supabase) and unwrapped data
    if (response && typeof response === 'object' && 'error' in response) {
      // This is a wrapped response (like from Supabase)
      if (response.error) {
        console.error('Database error:', response.error)
        return { data: null, error: response.error.message }
      }
      return { data: response.data, error: null }
    } else {
      // This is unwrapped data (already converted)
      return { data: response, error: null }
    }
  }

  static async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static async createRealtimeSubscription<T>(
    table: string,
    filter: string,
    callback: (payload: any) => void
  ): Promise<RealtimeSubscription> {
    try {
      const channel = supabase
        .channel(`realtime-${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table, filter },
          callback
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to ${table} changes`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Failed to subscribe to ${table} changes`);
          }
        })

      return {
        unsubscribe: () => {
          try {
            supabase.removeChannel(channel)
          } catch (error) {
            console.error(`Error removing channel for ${table}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error creating realtime subscription for ${table}:`, error);
      throw error;
    }
  }

  // Enhanced subscription methods for all three data types
  static async createContextBlocksSubscription(
    callback: (payload: any) => void
  ): Promise<RealtimeSubscription | null> {
    try {
      const user = await this.getUser()
      if (!user) {
        console.warn('User not authenticated for context blocks subscription')
        return null
      }

      return await this.createRealtimeSubscription(
        'context_blocks',
        `user_id=eq.${user.id}`,
        callback
      )
    } catch (error) {
      console.error('Failed to create context blocks subscription:', error)
      return null
    }
  }

  static async createPromptsSubscription(
    callback: (payload: any) => void
  ): Promise<RealtimeSubscription | null> {
    try {
      const user = await this.getUser()
      if (!user) {
        console.warn('User not authenticated for prompts subscription')
        return null
      }

      return await this.createRealtimeSubscription(
        'prompts',
        `user_id=eq.${user.id}`,
        callback
      )
    } catch (error) {
      console.error('Failed to create prompts subscription:', error)
      return null
    }
  }

  static async createPromptProjectsSubscription(
    callback: (payload: any) => void
  ): Promise<RealtimeSubscription | null> {
    try {
      const user = await this.getUser()
      if (!user) {
        console.warn('User not authenticated for prompt projects subscription')
        return null
      }

      return await this.createRealtimeSubscription(
        'prompt_projects',
        `user_id=eq.${user.id}`,
        callback
      )
    } catch (error) {
      console.error('Failed to create prompt projects subscription:', error)
      return null
    }
  }

  static async createDatasetProjectsSubscription(
    callback: (payload: any) => void
  ): Promise<RealtimeSubscription | null> {
    try {
      const user = await this.getUser()
      if (!user) {
        console.warn('User not authenticated for dataset projects subscription')
        return null
      }

      return await this.createRealtimeSubscription(
        'dataset_projects',
        `user_id=eq.${user.id}`,
        callback
      )
    } catch (error) {
      console.error('Failed to create dataset projects subscription:', error)
      return null
    }
  }

  // Utility method to create all subscriptions for data synchronization
  static async createAllSubscriptions(
    callback: (payload: any) => void
  ): Promise<RealtimeSubscription[]> {
    const subscriptions: RealtimeSubscription[] = []

    try {
      // Context blocks subscription
      const contextBlocksSub = await this.createContextBlocksSubscription(callback)
      if (contextBlocksSub) {
        subscriptions.push(contextBlocksSub)
      }

      // Prompts subscription
      const promptsSub = await this.createPromptsSubscription(callback)
      if (promptsSub) {
        subscriptions.push(promptsSub)
      }

      // Prompt projects subscription
      const promptProjectsSub = await this.createPromptProjectsSubscription(callback)
      if (promptProjectsSub) {
        subscriptions.push(promptProjectsSub)
      }

      // Dataset projects subscription
      const datasetProjectsSub = await this.createDatasetProjectsSubscription(callback)
      if (datasetProjectsSub) {
        subscriptions.push(datasetProjectsSub)
      }

      console.log(`Created ${subscriptions.length} real-time subscriptions`)
      return subscriptions
    } catch (error) {
      console.error('Failed to create subscriptions:', error)
      // Cleanup any successful subscriptions
      subscriptions.forEach(sub => sub.unsubscribe())
      return []
    }
  }

  // Utility method to cleanup all subscriptions
  static cleanupSubscriptions(subscriptions: RealtimeSubscription[]): void {
    try {
      subscriptions.forEach(subscription => {
        subscription.unsubscribe()
      })
      console.log(`Cleaned up ${subscriptions.length} subscriptions`)
    } catch (error) {
      console.error('Failed to cleanup subscriptions:', error)
    }
  }

  // Convert database row to TypeScript interface (handles UUID to string conversion)
  static convertRow<T>(row: any): T {
    if (!row) return {} as T

    const converted = {
      ...row,
      id: row.id,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
    return converted as T
  }

  static convertRows<T>(rows: any[]): T[] {
    if (!rows) return []
    return rows.map(row => this.convertRow<T>(row))
  }
}

// Error handling utilities
export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export const createDatabaseError = (message: string, code?: string) => {
  return new DatabaseError(message, code)
}