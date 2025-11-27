import { supabase } from '../lib/supabase'
import { DatabaseService, DatabaseResponse } from './databaseService'

// TypeScript interfaces
export interface Prompt {
  id: string
  user_id: string
  project_id?: string | null
  title: string
  description?: string | null
  content: string
  folder?: string | null
  tags: string[]
  created_at: Date
  updated_at: Date
}

export interface CreatePromptData {
  title: string
  description?: string | null
  content: string
  project_id?: string | null
  folder?: string | null
  tags?: string[]
}

export interface UpdatePromptData {
  title?: string
  description?: string | null
  content?: string
  project_id?: string | null
  folder?: string | null
  tags?: string[]
}

export class PromptService {
  // Get all prompts for the current user
  static async getPrompts(): Promise<DatabaseResponse<Prompt[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          prompt_projects (
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
        project: item.prompt_projects
      })) || []

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<Prompt>(transformedData)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get prompts by project
  static async getPromptsByProject(projectId: string): Promise<DatabaseResponse<Prompt[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          prompt_projects (
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
        project: item.prompt_projects
      })) || []

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<Prompt>(transformedData)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get unfiled prompts (no project assigned)
  static async getUnfiledPrompts(): Promise<DatabaseResponse<Prompt[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .is('project_id', null)
        .order('updated_at', { ascending: false })

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<Prompt>(data || [])
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Create a new prompt
  static async createPrompt(promptData: CreatePromptData): Promise<DatabaseResponse<Prompt>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('prompts')
        .insert({
          user_id: user.id,
          title: promptData.title,
          description: promptData.description || null,
          content: promptData.content,
          project_id: promptData.project_id || null,
          folder: promptData.folder || null,
          tags: promptData.tags || []
        })
        .select()
        .single()

      return await DatabaseService.handleResponse(
        DatabaseService.convertRow<Prompt>(data)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Update a prompt
  static async updatePrompt(
    id: string,
    updateData: UpdatePromptData
  ): Promise<DatabaseResponse<Prompt>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      // Only include fields that actually exist in the database and should be updatable
      const processedUpdateData = {
        title: updateData.title,
        description: updateData.description,
        content: updateData.content,
        project_id: updateData.project_id,
        folder: updateData.folder,
        tags: updateData.tags && updateData.tags.length > 0 ? updateData.tags : null,
        updated_at: new Date().toISOString()
      };

      // Remove undefined/null values to avoid database issues
      (Object.keys(processedUpdateData) as Array<keyof typeof processedUpdateData>).forEach(key => {
        if (processedUpdateData[key] === undefined) {
          delete processedUpdateData[key];
        }
      });

      const { data, error } = await supabase
        .from('prompts')
        .update(processedUpdateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, user_id, project_id, title, description, content, folder, tags, created_at, updated_at')
        .single()

      return await DatabaseService.handleResponse(
        DatabaseService.convertRow<Prompt>(data)
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Delete a prompt
  static async deletePrompt(id: string): Promise<DatabaseResponse<void>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('prompts')
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

  // Get prompt by ID
  static async getPromptById(id: string): Promise<DatabaseResponse<Prompt>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          prompt_projects (
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
          project: data.prompt_projects
        }
        return await DatabaseService.handleResponse(
          DatabaseService.convertRow<Prompt>(transformedData)
        )
      }

      return { data: null, error: error?.message || 'Prompt not found' }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Search prompts
  static async searchPrompts(query: string): Promise<DatabaseResponse<Prompt[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,description.ilike.%${query}%`)
        .order('updated_at', { ascending: false })

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<Prompt>(data || [])
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get prompts by tags
  static async getPromptsByTags(tags: string[]): Promise<DatabaseResponse<Prompt[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .contains('tags', tags)
        .order('updated_at', { ascending: false })

      return await DatabaseService.handleResponse(
        DatabaseService.convertRows<Prompt>(data || [])
      )
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Subscribe to real-time prompt changes
  static async subscribeToPromptChanges(callback: (payload: any) => void) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    return DatabaseService.createRealtimeSubscription(
      'prompts',
      `user_id=eq.${user.id}`,
      callback
    )
  }
}