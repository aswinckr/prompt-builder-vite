import { SavedPrompt } from '../types/SavedPrompt';

const STORAGE_KEY = 'saved-prompts';

/**
 * Utility functions for managing saved prompts in localStorage
 */

/**
 * Save all prompts to localStorage
 */
export function savePrompts(prompts: SavedPrompt[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  } catch (error) {
    console.error('Failed to save prompts to localStorage:', error);
    throw new Error('Failed to save prompts');
  }
}

/**
 * Load all prompts from localStorage
 */
export function loadPrompts(): SavedPrompt[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return [];
    }
    const parsed = JSON.parse(stored);

    // Convert date strings back to Date objects
    return parsed.map((prompt: any) => ({
      ...prompt,
      createdAt: new Date(prompt.createdAt),
      updatedAt: new Date(prompt.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load prompts from localStorage:', error);
    return [];
  }
}

/**
 * Save a single prompt by updating the existing prompts array
 */
export function savePrompt(updatedPrompt: SavedPrompt): void {
  try {
    const prompts = loadPrompts();
    const index = prompts.findIndex(p => p.id === updatedPrompt.id);

    if (index !== -1) {
      prompts[index] = updatedPrompt;
    } else {
      // If prompt doesn't exist, add it
      prompts.push(updatedPrompt);
    }

    savePrompts(prompts);
  } catch (error) {
    console.error('Failed to save prompt:', error);
    throw new Error('Failed to save prompt');
  }
}

/**
 * Delete a prompt by ID
 */
export function deletePrompt(promptId: number): void {
  try {
    const prompts = loadPrompts();
    const filteredPrompts = prompts.filter(p => p.id !== promptId);
    savePrompts(filteredPrompts);
  } catch (error) {
    console.error('Failed to delete prompt:', error);
    throw new Error('Failed to delete prompt');
  }
}

/**
 * Get a single prompt by ID
 */
export function getPromptById(promptId: number): SavedPrompt | null {
  try {
    const prompts = loadPrompts();
    return prompts.find(p => p.id === promptId) || null;
  } catch (error) {
    console.error('Failed to get prompt:', error);
    return null;
  }
}

/**
 * Validate prompt data structure
 */
export function validatePrompt(prompt: Partial<SavedPrompt>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!prompt.title || prompt.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (prompt.title && prompt.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (prompt.content && prompt.content.length > 10000) {
    errors.push('Content must be less than 10,000 characters');
  }

  if (prompt.description && prompt.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  // Validate projectId if present
  if (prompt.projectId && typeof prompt.projectId !== 'string') {
    errors.push('Project ID must be a string');
  }

  // Validate tags if present
  if (prompt.tags && (!Array.isArray(prompt.tags) || !prompt.tags.every(tag => typeof tag === 'string'))) {
    errors.push('Tags must be an array of strings');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a unique ID for new prompts
 */
export function generatePromptId(): number {
  try {
    const prompts = loadPrompts();
    const maxId = prompts.length > 0 ? Math.max(...prompts.map(p => p.id)) : 0;
    return maxId + 1;
  } catch (error) {
    console.error('Failed to generate prompt ID:', error);
    return Date.now(); // Fallback to timestamp
  }
}