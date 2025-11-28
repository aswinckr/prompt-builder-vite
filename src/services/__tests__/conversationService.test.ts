import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConversationService } from '../conversationService';
import { ConversationMessageService } from '../conversationMessageService';
import { supabase } from '../../lib/supabase';

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve({ data: [], error: null }))
              }))
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    })),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null }))
    }
  }
}));

describe('ConversationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('conversation creation with proper metadata', () => {
    it('should create a conversation with required fields', async () => {
      const mockConversation = {
        id: 'test-conversation-id',
        title: 'Test Conversation',
        model_name: 'gpt-4o',
        model_provider: 'openai',
        original_prompt_content: 'Test prompt content',
        user_id: 'test-user-id',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockConversation, error: null })
        })
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const conversationData = {
        title: 'Test Conversation',
        model_name: 'gpt-4o',
        model_provider: 'openai',
        original_prompt_content: 'Test prompt content'
      };

      const result = await ConversationService.createConversation(conversationData);

      expect(result.data).toBeTruthy();
      expect(result.error).toBeNull();
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-id',
          title: 'Test Conversation',
          model_name: 'gpt-4o',
          model_provider: 'openai',
          original_prompt_content: 'Test prompt content'
        })
      );
    });

    it('should handle conversation creation errors', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
        })
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const conversationData = {
        title: 'Test Conversation',
        model_name: 'gpt-4o',
        model_provider: 'openai',
        original_prompt_content: 'Test prompt content'
      };

      const result = await ConversationService.createConversation(conversationData);

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('message ordering and retrieval', () => {
    it('should retrieve messages in correct order', async () => {
      const mockMessages = [
        {
          id: 'msg1',
          conversation_id: 'test-conversation-id',
          role: 'user',
          content: 'User message',
          message_order: 1,
          created_at: new Date()
        },
        {
          id: 'msg2',
          conversation_id: 'test-conversation-id',
          role: 'assistant',
          content: 'Assistant response',
          message_order: 2,
          created_at: new Date()
        }
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockMessages, error: null });

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: mockOrder
          })
        })
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await ConversationMessageService.getMessagesByConversationId('test-conversation-id');

      expect(result.data).toEqual(mockMessages);
      expect(result.error).toBeNull();
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('message_order', { ascending: true });
    });
  });

  describe('conversation deletion cascade behavior', () => {
    it('should delete conversation and associated messages', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      });

      const mockFrom = vi.fn().mockReturnValue({
        delete: mockDelete
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await ConversationService.deleteConversation('test-conversation-id');

      expect(result.error).toBeNull();
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('search functionality with different query types', () => {
    it('should search conversations using full-text search', async () => {
      const mockSearchResults = [
        {
          id: 'conv1',
          title: 'Test Conversation',
          rank: 0.8
        }
      ];

      const mockRpc = vi.fn().mockResolvedValue({ data: mockSearchResults, error: null });
      (supabase.rpc as any).mockImplementation(mockRpc);

      const result = await ConversationService.searchConversations('test query');

      expect(result.data).toEqual(mockSearchResults);
      expect(result.error).toBeNull();
      expect(mockRpc).toHaveBeenCalledWith('search_conversations', {
        search_query: 'test query',
        user_uuid: 'test-user-id',
        limit_count: 50,
        offset_count: 0
      });
    });

    it('should handle empty search queries', async () => {
      const result = await ConversationService.searchConversations('');

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  describe('favorites toggle functionality', () => {
    it('should toggle conversation favorite status', async () => {
      const mockConversation = {
        id: 'test-conversation-id',
        title: 'Test Conversation',
        is_favorite: true,
        user_id: 'test-user-id'
      };

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockConversation, error: null })
            })
          })
        })
      });

      const mockFrom = vi.fn().mockReturnValue({
        update: mockUpdate
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await ConversationService.updateConversation('test-conversation-id', {
        is_favorite: true
      });

      expect(result.data?.is_favorite).toBe(true);
      expect(result.error).toBeNull();
    });
  });
});