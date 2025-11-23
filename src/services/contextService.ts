import { supabase } from '../lib/supabase'
import { DatabaseService, DatabaseResponse } from './databaseService'

export interface ContextBlock {
  id: string
  user_id: string
  project_id?: string | null
  title: string
  content: string
  tags: string[]
  created_at: Date
  updated_at: Date
}

export interface CreateContextBlockData {
  title: string
  content: string
  project_id?: string | null
  tags?: string[]
}

export interface UpdateContextBlockData {
  title?: string
  content?: string
  project_id?: string | null
  tags?: string[]
}

export class ContextService {
  // Get all context blocks for the current user
  static async getContextBlocks(): Promise<DatabaseResponse<ContextBlock[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('context_blocks')
        .select(`
          *,
          dataset_projects (
            id,
            name,
            icon
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      // Transform the data to include project info
      const transformedData = data?.map(item => ({
        ...item,
        project: item.dataset_projects
      })) || []

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<ContextBlock>(transformedData)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get context blocks by project
  static async getContextBlocksByProject(projectId: string): Promise<DatabaseResponse<ContextBlock[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('context_blocks')
        .select(`
          *,
          dataset_projects (
            id,
            name,
            icon
          )
        `)
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })

      const transformedData = data?.map(item => ({
        ...item,
        project: item.dataset_projects
      })) || []

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<ContextBlock>(transformedData)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get unfiled context blocks (no project assigned)
  static async getUnfiledContextBlocks(): Promise<DatabaseResponse<ContextBlock[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('context_blocks')
        .select('*')
        .eq('user_id', user.id)
        .is('project_id', null)
        .order('updated_at', { ascending: false })

      const convertedData = DatabaseService.convertRows<ContextBlock>(data || [])
      return await DatabaseService.handleResponse(convertedData)
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Create a new context block
  static async createContextBlock(contextData: CreateContextBlockData): Promise<DatabaseResponse<ContextBlock>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('context_blocks')
        .insert({
          user_id: user.id,
          title: contextData.title,
          content: contextData.content,
          project_id: contextData.project_id || null,
          tags: contextData.tags || []
        })
        .select()
        .single()

      return await DatabaseService.handleResponse({ data, error })
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Update a context block
  static async updateContextBlock(
    id: string,
    updateData: UpdateContextBlockData
  ): Promise<DatabaseResponse<ContextBlock>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('context_blocks')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      return await DatabaseService.handleResponse({ data, error })
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Delete a context block
  static async deleteContextBlock(id: string): Promise<DatabaseResponse<void>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('context_blocks')
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

  // Get context block by ID
  static async getContextBlockById(id: string): Promise<DatabaseResponse<ContextBlock>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('context_blocks')
        .select(`
          *,
          dataset_projects (
            id,
            name,
            icon
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (data) {
        const transformedData = {
          ...data,
          project: data.dataset_projects
        }
        return await DatabaseService.handleResponse(
          DatabaseService.convertRow<ContextBlock>(transformedData)
        )
      }

      return { data: null, error: error?.message || 'Context block not found' }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Search context blocks
  static async searchContextBlocks(query: string): Promise<DatabaseResponse<ContextBlock[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('context_blocks')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('updated_at', { ascending: false })

      const convertedData = DatabaseService.convertRows<ContextBlock>(data || [])
      return await DatabaseService.handleResponse(convertedData)
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get context blocks by tags
  static async getContextBlocksByTags(tags: string[]): Promise<DatabaseResponse<ContextBlock[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('context_blocks')
        .select('*')
        .eq('user_id', user.id)
        .contains('tags', tags)
        .order('updated_at', { ascending: false })

      const convertedData = DatabaseService.convertRows<ContextBlock>(data || [])
      return await DatabaseService.handleResponse(convertedData)
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get context blocks associated with a prompt
  static async getContextBlocksForPrompt(promptId: string): Promise<DatabaseResponse<ContextBlock[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('prompt_context_blocks')
        .select(`
          context_blocks (
            *,
            dataset_projects (
              id,
              name,
              icon
            )
          )
        `)
        .eq('prompt_id', promptId)

      if (data && data.length > 0) {
        const contextBlocks = data
          .map((item: any) => {
            if (!item.context_blocks) return null;
            return {
              ...item.context_blocks,
              project: item.context_blocks.dataset_projects || null
            };
          })
          .filter((cb: any): cb is ContextBlock => cb && cb.user_id === user.id)

        return { data: DatabaseService.convertRows<ContextBlock>(contextBlocks), error: null }
      }

      return { data: [], error: error?.message || null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Associate context blocks with a prompt
  static async associateContextBlocksToPrompt(
    promptId: string,
    contextBlockIds: string[]
  ): Promise<DatabaseResponse<void>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      // First remove all existing associations
      await supabase
        .from('prompt_context_blocks')
        .delete()
        .eq('prompt_id', promptId)

      // Then add new associations
      if (contextBlockIds.length > 0) {
        const associations = contextBlockIds.map(contextBlockId => ({
          prompt_id: promptId,
          context_block_id: contextBlockId
        }))

        const { error } = await supabase
          .from('prompt_context_blocks')
          .insert(associations)

        if (error) {
          return { data: null, error: error.message }
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Subscribe to real-time context block changes
  static subscribeToContextBlockChanges(callback: (payload: any) => void) {
    return DatabaseService.createRealtimeSubscription(
      'context_blocks',
      '', // Add user filter here if needed
      callback
    )
  }
}