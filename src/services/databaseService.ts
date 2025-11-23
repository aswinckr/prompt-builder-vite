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

// Generic database operations
export class DatabaseService {
  static async handleResponse<T>(response: any): Promise<DatabaseResponse<T>> {
    if (response.error) {
      console.error('Database error:', response.error)
      return { data: null, error: response.error.message }
    }
    return { data: response.data, error: null }
  }

  static async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static async createRealtimeSubscription<T>(
    table: string,
    filter: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        callback
      )
      .subscribe()
  }

  // Convert database row to TypeScript interface (handles UUID to string conversion)
  static convertRow<T>(row: any): T {
    if (!row) return {} as T

    return {
      ...row,
      id: row.id,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    } as T
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