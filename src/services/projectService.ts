import { supabase } from '../lib/supabase'
import { DatabaseService, DatabaseResponse } from './databaseService'

// TypeScript interfaces
export interface Project {
  id: string
  user_id: string
  name: string
  icon: string
  folder_path?: string | null
  parent_id?: string | null
  is_system: boolean
  created_at: Date
  updated_at: Date
  // Optional fields for UI compatibility
  promptCount?: number
}

export interface CreateProjectData {
  name: string
  icon?: string
  type: 'prompt' | 'dataset'
  parent_id?: string
  folder_path?: string
}

export interface UpdateProjectData {
  name?: string
  icon?: string
  parent_id?: string
  folder_path?: string
}

export class ProjectService {
  // Get all prompt projects for the current user
  static async getPromptProjects(): Promise<DatabaseResponse<Project[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('prompt_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const convertedData = DatabaseService.convertRows<Project>(data || [])
      return await DatabaseService.handleResponse(convertedData)
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get all dataset projects for the current user
  static async getDatasetProjects(): Promise<DatabaseResponse<Project[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('dataset_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const convertedData = DatabaseService.convertRows<Project>(data || [])
      return await DatabaseService.handleResponse(convertedData)
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Create a new project
  static async createProject(projectData: CreateProjectData): Promise<DatabaseResponse<Project>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const tableName = projectData.type === 'prompt' ? 'prompt_projects' : 'dataset_projects'

      const insertData = {
        user_id: user.id,
        name: projectData.name,
        icon: projectData.icon || '📁',
        parent_id: projectData.parent_id || null,
        folder_path: projectData.folder_path || null,
        is_system: false
      };

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message };
      }

      const result = await DatabaseService.handleResponse<Project>({ data, error });
      return result;
    } catch (err) {
      console.error('❌ Exception in createProject:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Update a project
  static async updateProject(
    id: string,
    type: 'prompt' | 'dataset',
    updateData: UpdateProjectData
  ): Promise<DatabaseResponse<Project>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const tableName = type === 'prompt' ? 'prompt_projects' : 'dataset_projects'

      const { data, error } = await supabase
        .from(tableName)
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

  // Delete a project
  static async deleteProject(
    id: string,
    type: 'prompt' | 'dataset'
  ): Promise<DatabaseResponse<void>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const tableName = type === 'prompt' ? 'prompt_projects' : 'dataset_projects'

      const { error } = await supabase
        .from(tableName)
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

  // Get project by ID
  static async getProjectById(
    id: string,
    type: 'prompt' | 'dataset'
  ): Promise<DatabaseResponse<Project>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const tableName = type === 'prompt' ? 'prompt_projects' : 'dataset_projects'

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      return await DatabaseService.handleResponse({ data, error })
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Get child projects (for hierarchical structure)
  static async getChildProjects(
    parentId: string,
    type: 'prompt' | 'dataset'
  ): Promise<DatabaseResponse<Project[]>> {
    try {
      const user = await DatabaseService.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const tableName = type === 'prompt' ? 'prompt_projects' : 'dataset_projects'

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('parent_id', parentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const convertedData = DatabaseService.convertRows<Project>(data || [])
      return await DatabaseService.handleResponse(convertedData)
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }
}