import { vi } from 'vitest';
import '@testing-library/jest-dom';
import {
  savePrompts,
  loadPrompts,
  savePrompt,
  deletePrompt,
  getPromptById,
  validatePrompt,
  generatePromptId
} from '../promptStorage';
import { SavedPrompt } from '../../types/SavedPrompt';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('promptStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const mockPrompt: SavedPrompt = {
    id: 1,
    title: 'Test Prompt',
    description: 'Test description',
    content: 'Test content',
    projectId: 'test-project',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    folder: null,
    tags: ['test']
  };

  describe('savePrompts', () => {
    it('saves prompts to localStorage', () => {
      const prompts = [mockPrompt];
      savePrompts(prompts);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'saved-prompts',
        JSON.stringify(prompts)
      );
    });

    it('handles localStorage errors', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => savePrompts([mockPrompt])).toThrow('Failed to save prompts');
    });
  });

  describe('loadPrompts', () => {
    it('loads prompts from localStorage', () => {
      const prompts = [mockPrompt];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(prompts));

      const loaded = loadPrompts();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('saved-prompts');
      expect(loaded).toHaveLength(1);
      expect(loaded[0].title).toBe('Test Prompt');
      expect(loaded[0].createdAt).toBeInstanceOf(Date);
      expect(loaded[0].updatedAt).toBeInstanceOf(Date);
    });

    it('returns empty array when no prompts exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const loaded = loadPrompts();

      expect(loaded).toEqual([]);
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const loaded = loadPrompts();

      expect(loaded).toEqual([]);
    });

    it('handles malformed JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const loaded = loadPrompts();

      expect(loaded).toEqual([]);
    });
  });

  describe('savePrompt', () => {
    it('updates existing prompt', () => {
      const prompts = [mockPrompt];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(prompts));

      const updatedPrompt = {
        ...mockPrompt,
        title: 'Updated Title',
        updatedAt: new Date('2024-01-02')
      };

      savePrompt(updatedPrompt);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'saved-prompts',
        expect.stringContaining('Updated Title')
      );
    });

    it('adds new prompt if it doesn\'t exist', () => {
      localStorageMock.getItem.mockReturnValue('[]');

      savePrompt(mockPrompt);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'saved-prompts',
        JSON.stringify([mockPrompt])
      );
    });
  });

  describe('deletePrompt', () => {
    it('deletes prompt by ID', () => {
      const prompts = [mockPrompt];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(prompts));

      deletePrompt(1);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'saved-prompts',
        JSON.stringify([])
      );
    });
  });

  describe('getPromptById', () => {
    it('returns prompt by ID', () => {
      const prompts = [mockPrompt];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(prompts));

      const found = getPromptById(1);

      expect(found).toEqual(mockPrompt);
    });

    it('returns null if prompt not found', () => {
      const prompts = [mockPrompt];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(prompts));

      const found = getPromptById(999);

      expect(found).toBeNull();
    });

    it('returns null on error', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const found = getPromptById(1);

      expect(found).toBeNull();
    });
  });

  describe('validatePrompt', () => {
    it('validates a correct prompt', () => {
      const result = validatePrompt(mockPrompt);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing title', () => {
      const result = validatePrompt({ ...mockPrompt, title: '' });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('detects title too long', () => {
      const longTitle = 'a'.repeat(201);
      const result = validatePrompt({ ...mockPrompt, title: longTitle });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be less than 200 characters');
    });

    it('detects content too long', () => {
      const longContent = 'a'.repeat(10001);
      const result = validatePrompt({ ...mockPrompt, content: longContent });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content must be less than 10,000 characters');
    });

    it('detects invalid tags', () => {
      const result = validatePrompt({ ...mockPrompt, tags: ['valid', 123] as any });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tags must be an array of strings');
    });

    it('detects invalid projectId', () => {
      const result = validatePrompt({ ...mockPrompt, projectId: 123 as any });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Project ID must be a string');
    });
  });

  describe('generatePromptId', () => {
    it('generates ID 1 when no prompts exist', () => {
      localStorageMock.getItem.mockReturnValue('[]');

      const id = generatePromptId();

      expect(id).toBe(1);
    });

    it('generates max ID + 1 when prompts exist', () => {
      const prompts = [
        { ...mockPrompt, id: 1 },
        { ...mockPrompt, id: 5 },
        { ...mockPrompt, id: 3 }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(prompts));

      const id = generatePromptId();

      expect(id).toBe(6);
    });

    it('falls back to timestamp on error', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const id = generatePromptId();

      expect(id).toBeGreaterThan(0);
      expect(id).toBeLessThanOrEqual(Date.now());
    });
  });
});