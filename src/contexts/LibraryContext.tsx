import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef, useCallback } from 'react';
import { ContextBlock } from '../types/ContextBlock';
import { SavedPrompt } from '../types/SavedPrompt';
import { Conversation, ConversationFilters, ConversationListOptions, CreateConversationMessageData } from '../types/Conversation';
import { ContextService } from '../services/contextService';
import { DatabaseResponse, RealtimeSubscription, RealtimeEventPayload } from '../services/databaseService';
import { DatabaseService } from '../services/databaseService';
import { PromptService } from '../services/promptService';
import { ProjectService, Project } from '../services/projectService';
import { ConversationService } from '../services/conversationService';
import { ConversationMessageService } from '../services/conversationMessageService';
import { useAuthState } from './AuthContext';
import { CHAT, TEMPORARY } from '../utils/constants';
import { SYNC_CONSTANTS } from '../constants/sync';

interface ChatState {
  isChatPanelOpen: boolean;
  selectedModel: string;
}

interface PromptBuilderState {
  customText: string;
  blockOrder: string[]; // Changed from number to string for UUID
}

interface ContextSelectionState {
  selectedBlockIds: string[]; // Changed from number to string for UUID
}

interface LibraryState {
  promptBuilder: PromptBuilderState;
  chat: ChatState;
  contextSelection: ContextSelectionState;
  contextBlocks: ContextBlock[];
  savedPrompts: SavedPrompt[];
  conversations: Conversation[];
  promptProjects: Project[];
  datasetProjects: Project[];
  systemPromptProjects: Project[];
  systemDatasetProjects: Project[];
  loading: boolean;
  error: string | null;
  syncLoading: boolean; // New state for synchronization loading
  // Conversation state
  conversationLoading: boolean;
  conversationError: string | null;
  conversationFilters: ConversationFilters;
  // Folder modal state
  folderModal: {
    isOpen: boolean;
    defaultType: 'prompts' | 'datasets';
    loading: boolean;
  };
}

type LibraryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONTEXT_BLOCKS'; payload: ContextBlock[] }
  | { type: 'SET_SAVED_PROMPTS'; payload: SavedPrompt[] }
  | { type: 'SET_PROMPT_PROJECTS'; payload: Project[] }
  | { type: 'SET_DATASET_PROJECTS'; payload: Project[] }
  | { type: 'SET_SYSTEM_PROMPT_PROJECTS'; payload: Project[] }
  | { type: 'SET_SYSTEM_DATASET_PROJECTS'; payload: Project[] }
  | { type: 'SET_SYNC_LOADING'; payload: boolean } // New action type
  | { type: 'SET_CUSTOM_TEXT'; payload: string }
  | { type: 'ADD_BLOCK_TO_BUILDER'; payload: string }
  | { type: 'REMOVE_BLOCK_FROM_BUILDER'; payload: string }
  | { type: 'REORDER_BLOCKS_IN_BUILDER'; payload: string[] }
  | { type: 'CLEAR_PROMPT_BUILDER' }
  | { type: 'SET_EXECUTION_PANEL'; payload: boolean }
  // Context selection actions
  | { type: 'TOGGLE_BLOCK_SELECTION'; payload: string }
  | { type: 'SET_SELECTED_BLOCKS'; payload: string[] }
  | { type: 'CLEAR_BLOCK_SELECTION' }
  // Context creation actions
  | { type: 'CREATE_CONTEXT_BLOCK'; payload: ContextBlock }
  | { type: 'UPDATE_CONTEXT_BLOCK'; payload: { id: string; blockData: Partial<ContextBlock> } }
  | { type: 'DELETE_CONTEXT_BLOCK'; payload: string }
  | { type: 'CREATE_TEMPORARY_BLOCK'; payload: ContextBlock }
  | { type: 'UPDATE_TEMPORARY_BLOCK'; payload: { id: string; blockData: Partial<ContextBlock> } }
  | { type: 'REMOVE_TEMPORARY_BLOCK'; payload: string }
  // Prompt actions
  | { type: 'CREATE_SAVED_PROMPT'; payload: SavedPrompt }
  | { type: 'UPDATE_SAVED_PROMPT'; payload: { id: string; promptData: Partial<SavedPrompt> } }
  | { type: 'DELETE_SAVED_PROMPT'; payload: string }
  // Project actions
  | { type: 'CREATE_PROMPT_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROMPT_PROJECT'; payload: { id: string; projectData: Partial<Project> } }
  | { type: 'DELETE_PROMPT_PROJECT'; payload: string }
  | { type: 'CREATE_DATASET_PROJECT'; payload: Project }
  | { type: 'UPDATE_DATASET_PROJECT'; payload: { id: string; projectData: Partial<Project> } }
  | { type: 'DELETE_DATASET_PROJECT'; payload: string }
  // Folder modal actions
  | { type: 'OPEN_FOLDER_MODAL'; payload: 'prompts' | 'datasets' }
  | { type: 'CLOSE_FOLDER_MODAL' }
  | { type: 'SET_FOLDER_MODAL_LOADING'; payload: boolean }
  // Chat actions
  | { type: 'SET_CHAT_PANEL_OPEN'; payload: boolean }
  | { type: 'SET_SELECTED_MODEL'; payload: string }
  // Conversation actions
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_CONVERSATION_LOADING'; payload: boolean }
  | { type: 'SET_CONVERSATION_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATION_FILTERS'; payload: ConversationFilters }
  | { type: 'CREATE_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; conversationData: Partial<Conversation> } }
  | { type: 'DELETE_CONVERSATION'; payload: string }

const initialState: LibraryState = {
  promptBuilder: {
    customText: '',
    blockOrder: []
  },
  chat: {
    isChatPanelOpen: false,
    selectedModel: CHAT.DEFAULT_MODEL,
  },
  contextSelection: {
    selectedBlockIds: []
  },
  contextBlocks: [],
  savedPrompts: [],
  conversations: [],
  promptProjects: [],
  datasetProjects: [],
  systemPromptProjects: [],
  systemDatasetProjects: [],
  loading: false,
  error: null,
  syncLoading: false,
  // Conversation state
  conversationLoading: false,
  conversationError: null,
  conversationFilters: {},
  folderModal: {
    isOpen: false,
    defaultType: 'prompts',
    loading: false
  }
};

function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SYNC_LOADING':
      return { ...state, syncLoading: action.payload };
    case 'SET_CONTEXT_BLOCKS':
      return { ...state, contextBlocks: action.payload, loading: false, syncLoading: false };
    case 'SET_SAVED_PROMPTS':
      return { ...state, savedPrompts: action.payload, loading: false, syncLoading: false };
    case 'SET_PROMPT_PROJECTS':
      return { ...state, promptProjects: action.payload, loading: false, syncLoading: false };
    case 'SET_DATASET_PROJECTS':
      return { ...state, datasetProjects: action.payload, loading: false, syncLoading: false };
    case 'SET_SYSTEM_PROMPT_PROJECTS':
      return { ...state, systemPromptProjects: action.payload, loading: false, syncLoading: false };
    case 'SET_SYSTEM_DATASET_PROJECTS':
      return { ...state, systemDatasetProjects: action.payload, loading: false, syncLoading: false };
    case 'SET_CUSTOM_TEXT':
      return {
        ...state,
        promptBuilder: {
          ...state.promptBuilder,
          customText: action.payload
        }
      };
    case 'ADD_BLOCK_TO_BUILDER':
      return {
        ...state,
        promptBuilder: {
          ...state.promptBuilder,
          blockOrder: [...state.promptBuilder.blockOrder, action.payload]
        }
      };
    case 'REMOVE_BLOCK_FROM_BUILDER':
      return {
        ...state,
        promptBuilder: {
          ...state.promptBuilder,
          blockOrder: state.promptBuilder.blockOrder.filter(id => id !== action.payload)
        }
      };
    case 'REORDER_BLOCKS_IN_BUILDER':
      return {
        ...state,
        promptBuilder: {
          ...state.promptBuilder,
          blockOrder: action.payload
        }
      };
    case 'CLEAR_PROMPT_BUILDER':
      return {
        ...state,
        promptBuilder: {
          customText: '',
          blockOrder: []
        }
      };
    case 'TOGGLE_BLOCK_SELECTION':
      const { selectedBlockIds } = state.contextSelection;
      const blockId = action.payload;
      return {
        ...state,
        contextSelection: {
          selectedBlockIds: selectedBlockIds.includes(blockId)
            ? selectedBlockIds.filter(id => id !== blockId)
            : [...selectedBlockIds, blockId]
        }
      };
    case 'SET_SELECTED_BLOCKS':
      return {
        ...state,
        contextSelection: {
          selectedBlockIds: action.payload
        }
      };
    case 'CLEAR_BLOCK_SELECTION':
      return {
        ...state,
        contextSelection: {
          selectedBlockIds: []
        }
      };
    case 'CREATE_CONTEXT_BLOCK':
      return {
        ...state,
        contextBlocks: [action.payload, ...state.contextBlocks]
      };
    case 'UPDATE_CONTEXT_BLOCK':
      return {
        ...state,
        contextBlocks: state.contextBlocks.map(block =>
          block.id === action.payload.id
            ? { ...block, ...action.payload.blockData }
            : block
        )
      };
    case 'DELETE_CONTEXT_BLOCK':
      return {
        ...state,
        contextBlocks: state.contextBlocks.filter(block => block.id !== action.payload)
      };
    case 'CREATE_TEMPORARY_BLOCK':
      return {
        ...state,
        contextBlocks: [action.payload, ...state.contextBlocks],
        promptBuilder: {
          ...state.promptBuilder,
          blockOrder: [action.payload.id, ...state.promptBuilder.blockOrder]
        }
      };
    case 'UPDATE_TEMPORARY_BLOCK':
      return {
        ...state,
        contextBlocks: state.contextBlocks.map(block =>
          block.id === action.payload.id
            ? { ...block, ...action.payload.blockData, updated_at: new Date() }
            : block
        )
      };
    case 'REMOVE_TEMPORARY_BLOCK':
      return {
        ...state,
        contextBlocks: state.contextBlocks.filter(block => block.id !== action.payload),
        promptBuilder: {
          ...state.promptBuilder,
          blockOrder: state.promptBuilder.blockOrder.filter(id => id !== action.payload)
        }
      };
    case 'CREATE_SAVED_PROMPT':
      return {
        ...state,
        savedPrompts: [action.payload, ...state.savedPrompts]
      };
    case 'UPDATE_SAVED_PROMPT':
      return {
        ...state,
        savedPrompts: state.savedPrompts.map(prompt =>
          prompt.id === action.payload.id
            ? { ...prompt, ...action.payload.promptData }
            : prompt
        )
      };
    case 'DELETE_SAVED_PROMPT':
      return {
        ...state,
        savedPrompts: state.savedPrompts.filter(prompt => prompt.id !== action.payload)
      };
    case 'CREATE_PROMPT_PROJECT':
      return {
        ...state,
        promptProjects: [action.payload, ...state.promptProjects]
      };
    case 'UPDATE_PROMPT_PROJECT':
      return {
        ...state,
        promptProjects: state.promptProjects.map(project =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.projectData }
            : project
        )
      };
    case 'DELETE_PROMPT_PROJECT':
      return {
        ...state,
        promptProjects: state.promptProjects.filter(project => project.id !== action.payload)
      };
    case 'CREATE_DATASET_PROJECT':
      return {
        ...state,
        datasetProjects: [action.payload, ...state.datasetProjects]
      };
    case 'UPDATE_DATASET_PROJECT':
      return {
        ...state,
        datasetProjects: state.datasetProjects.map(project =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.projectData }
            : project
        )
      };
    case 'DELETE_DATASET_PROJECT':
      return {
        ...state,
        datasetProjects: state.datasetProjects.filter(project => project.id !== action.payload)
      };
    case 'OPEN_FOLDER_MODAL':
      return {
        ...state,
        folderModal: {
          isOpen: true,
          defaultType: action.payload,
          loading: false
        }
      };
    case 'CLOSE_FOLDER_MODAL':
      return {
        ...state,
        folderModal: {
          ...state.folderModal,
          isOpen: false,
          loading: false
        }
      };
    case 'SET_FOLDER_MODAL_LOADING':
      return {
        ...state,
        folderModal: {
          ...state.folderModal,
          loading: action.payload
        }
      };
    case 'SET_CHAT_PANEL_OPEN':
      return {
        ...state,
        chat: {
          ...state.chat,
          isChatPanelOpen: action.payload
        }
      };
    case 'SET_SELECTED_MODEL':
      return {
        ...state,
        chat: {
          ...state.chat,
          selectedModel: action.payload
        }
      };
    // Conversation cases
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload,
        conversationLoading: false,
        conversationError: null
      };
    case 'SET_CONVERSATION_LOADING':
      return {
        ...state,
        conversationLoading: action.payload
      };
    case 'SET_CONVERSATION_ERROR':
      return {
        ...state,
        conversationError: action.payload,
        conversationLoading: false
      };
    case 'SET_CONVERSATION_FILTERS':
      return {
        ...state,
        conversationFilters: action.payload
      };
    case 'CREATE_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations]
      };
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conversation =>
          conversation.id === action.payload.id
            ? { ...conversation, ...action.payload.conversationData }
            : conversation
        )
      };
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conversation => conversation.id !== action.payload)
      };
    default:
      return state;
  }
}

const LibraryContext = createContext<{
  state: LibraryState;
  dispatch: React.Dispatch<LibraryAction>;
  actions: any; // We'll define this properly below
} | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(libraryReducer, initialState);
  const { isAuthenticated, isLoading: authLoading } = useAuthState();

  // Refs for managing real-time subscriptions and debouncing
  const subscriptionsRef = useRef<RealtimeSubscription[]>([]);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);

  // Enhanced data refresh utility function with debouncing (Task 2.2 and 3.3) - MEMOIZED & RACE-CONDITION-FREE
  const refreshAllData = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    // Debounce rapid successive refreshes to prevent sync storms
    const now = Date.now();
    const minimumInterval = SYNC_CONSTANTS.DEBOUNCE_INTERVAL_MS;
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;

    if (timeSinceLastRefresh < minimumInterval) {
      // Only schedule if not already pending
      if (!refreshTimeoutRef.current) {
        refreshTimeoutRef.current = setTimeout(() => {
          refreshTimeoutRef.current = null;
          // Use direct execution instead of recursive call to prevent infinite loops
          const executeRefresh = async () => {
            try {
              if (!isAuthenticated) return;

              dispatch({ type: 'SET_SYNC_LOADING', payload: true });

              // Parallel loading of all data types
              const [contextBlocksResult, savedPromptsResult, conversationsResult, promptProjectsResult, datasetProjectsResult] = await Promise.all([
                ContextService.getContextBlocks(),
                PromptService.getPrompts(),
                ConversationService.getConversations(),
                ProjectService.getPromptProjects(),
                ProjectService.getDatasetProjects()
              ]);

              // Dispatch data updates
              if (contextBlocksResult.data) {
                dispatch({ type: 'SET_CONTEXT_BLOCKS', payload: contextBlocksResult.data });
              }
              if (savedPromptsResult.data) {
                dispatch({ type: 'SET_SAVED_PROMPTS', payload: savedPromptsResult.data });
              }
              if (conversationsResult.data) {
                dispatch({ type: 'SET_CONVERSATIONS', payload: conversationsResult.data });
              }
              if (promptProjectsResult.data) {
                dispatch({ type: 'SET_PROMPT_PROJECTS', payload: promptProjectsResult.data });
              }
              if (datasetProjectsResult.data) {
                dispatch({ type: 'SET_DATASET_PROJECTS', payload: datasetProjectsResult.data });
              }
  
              lastRefreshTimeRef.current = Date.now();
            } catch (error) {
              console.warn('Data refresh operation failed');
            } finally {
              dispatch({ type: 'SET_SYNC_LOADING', payload: false });
            }
          };

          executeRefresh();
        }, minimumInterval - timeSinceLastRefresh);
      }
      return;
    }

    lastRefreshTimeRef.current = now;
    dispatch({ type: 'SET_SYNC_LOADING', payload: true });

    try {
      // First, ensure unsorted folders exist for the user
      await ProjectService.ensureUnsortedFolders();

      // Load all user data in parallel
      const [contextBlocksResult, savedPromptsResult, conversationsResult, promptProjectsResult, datasetProjectsResult, systemPromptProjectsResult, systemDatasetProjectsResult] = await Promise.all([
        ContextService.getContextBlocks(),
        PromptService.getPrompts(),
        ConversationService.getConversations(),
        ProjectService.getUserProjects('prompt'),
        ProjectService.getUserProjects('dataset'),
        ProjectService.getSystemProjects('prompt'),
        ProjectService.getSystemProjects('dataset')
      ]);

      // Set the user's data, even if it's empty (this is normal for new users)
      dispatch({ type: 'SET_CONTEXT_BLOCKS', payload: contextBlocksResult.data || [] });
      dispatch({ type: 'SET_SAVED_PROMPTS', payload: savedPromptsResult.data || [] });
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversationsResult.data || [] });
      dispatch({ type: 'SET_PROMPT_PROJECTS', payload: promptProjectsResult.data || [] });
      dispatch({ type: 'SET_DATASET_PROJECTS', payload: datasetProjectsResult.data || [] });
      dispatch({ type: 'SET_SYSTEM_PROMPT_PROJECTS', payload: systemPromptProjectsResult.data || [] });
      dispatch({ type: 'SET_SYSTEM_DATASET_PROJECTS', payload: systemDatasetProjectsResult.data || [] });

      // Check for any errors from the service calls
      const errors = [
        contextBlocksResult.error,
        savedPromptsResult.error,
        conversationsResult.error,
        promptProjectsResult.error,
        datasetProjectsResult.error,
        systemPromptProjectsResult.error,
        systemDatasetProjectsResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.warn('Database operation failed during refresh');
        dispatch({ type: 'SET_ERROR', payload: errors[0] || 'Failed to refresh data' });
      }
    } catch (error) {
      console.warn('Data refresh operation failed');
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh data' });
    } finally {
      dispatch({ type: 'SET_SYNC_LOADING', payload: false });
      refreshTimeoutRef.current = null;
    }
  }, [isAuthenticated, dispatch]);

  // Real-time event handler (Task 3.2) - MEMOIZED
  const handleRealtimeEvent = useCallback((payload: any) => {
    // Type safety: Validate payload structure
    if (!payload || typeof payload !== 'object' || !('table' in payload)) {
      console.warn('Invalid realtime event payload received');
      return;
    }

    // Filter events by table and trigger refresh for relevant changes
    const supportedTables = ['context_blocks', 'prompts', 'conversations', 'prompt_projects', 'dataset_projects'];

    if (supportedTables.includes(payload.table)) {
      // Trigger a debounced refresh when real-time events are received
      refreshAllData();
    }
  }, [refreshAllData]);

  // Set up real-time subscriptions (Task 3.2) - SIMPLIFIED VERSION
  useEffect(() => {
    const setupSubscriptions = async () => {
      if (isAuthenticated && !authLoading) {
        try {
          console.log('Setting up real-time subscriptions...');
          const subscriptions = await DatabaseService.createAllSubscriptions(handleRealtimeEvent);
          subscriptionsRef.current = subscriptions;
          console.log(`Successfully set up ${subscriptions.length} real-time subscriptions`);
        } catch (error) {
          console.warn('Real-time subscription setup failed');
          // Don't show error to user - just continue without real-time sync
          // The auto-refresh after CRUD operations will still work
        }
      }
    };

    setupSubscriptions();

    // Cleanup function to remove subscriptions when component unmounts (Task 3.2)
    return () => {
      // Perform async cleanup without awaiting (React doesn't allow async cleanup)
      if (subscriptionsRef.current.length > 0) {
        DatabaseService.cleanupSubscriptions(subscriptionsRef.current).catch(console.warn);
        subscriptionsRef.current = [];
        console.log('Cleaned up real-time subscriptions');
      }

      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [isAuthenticated, authLoading]);

  // Load data when component mounts and when authentication state changes
  useEffect(() => {
    // Only load data if authentication is not loading
    if (!authLoading) {
      loadInitialData();
    }
  }, [authLoading, isAuthenticated]); // Reload when auth state changes

  const loadInitialData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      if (isAuthenticated) {
        await refreshAllData();
      } else {
        // Clear all user data when not authenticated
        dispatch({ type: 'SET_CONTEXT_BLOCKS', payload: [] });
        dispatch({ type: 'SET_SAVED_PROMPTS', payload: [] });
        dispatch({ type: 'SET_CONVERSATIONS', payload: [] });
        dispatch({ type: 'SET_PROMPT_PROJECTS', payload: [] });
        dispatch({ type: 'SET_DATASET_PROJECTS', payload: [] });
        dispatch({ type: 'SET_SYSTEM_PROMPT_PROJECTS', payload: [] });
        dispatch({ type: 'SET_SYSTEM_DATASET_PROJECTS', payload: [] });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
    } catch (error) {
      console.warn('Initial data loading failed');
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const actions = {
    setCustomText: (text: string) => dispatch({ type: 'SET_CUSTOM_TEXT', payload: text }),
    addBlockToBuilder: (blockId: string) => dispatch({ type: 'ADD_BLOCK_TO_BUILDER', payload: blockId }),
    removeBlockFromBuilder: (blockId: string) => dispatch({ type: 'REMOVE_BLOCK_FROM_BUILDER', payload: blockId }),
    reorderBlocksInBuilder: (order: string[]) => dispatch({ type: 'REORDER_BLOCKS_IN_BUILDER', payload: order }),
    clearPromptBuilder: () => dispatch({ type: 'CLEAR_PROMPT_BUILDER' }),
    setExecutionPanel: (open: boolean) => dispatch({ type: 'SET_EXECUTION_PANEL', payload: open }),

    // Context selection actions
    toggleBlockSelection: (blockId: string) => dispatch({ type: 'TOGGLE_BLOCK_SELECTION', payload: blockId }),
    setSelectedBlocks: (blockIds: string[]) => dispatch({ type: 'SET_SELECTED_BLOCKS', payload: blockIds }),
    clearBlockSelection: () => dispatch({ type: 'CLEAR_BLOCK_SELECTION' }),

    // Enhanced context block actions with auto-refresh (Task 2.3) - NO OPTIMISTIC UPDATES
    createContextBlock: async (blockData: Omit<ContextBlock, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const result = await ContextService.createContextBlock(blockData);
      // Wait for database confirmation, then refresh all data (no optimistic dispatch)
      if (!result.error) {
        await refreshAllData();
      }
      return result;
    },
    updateContextBlock: async (id: string, blockData: Partial<ContextBlock>) => {
      const result = await ContextService.updateContextBlock(id, blockData);
      // Wait for database confirmation, then refresh all data (no optimistic dispatch)
      if (!result.error) {
        await refreshAllData();
      }
      return result;
    },
    deleteContextBlock: async (id: string) => {
      const result = await ContextService.deleteContextBlock(id);
      // Wait for database confirmation, then refresh all data (no optimistic dispatch)
      if (!result.error) {
        await refreshAllData();
      }
      return result;
    },

    // Temporary block actions (unchanged - remain local-only)
    createTemporaryBlock: (blockData: Omit<ContextBlock, 'id' | 'user_id' | 'created_at' | 'updated_at'>): ContextBlock => {
      const temporaryBlock: ContextBlock = {
        ...blockData,
        id: crypto.randomUUID(),
        user_id: TEMPORARY.USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
        isTemporary: true
      };

      dispatch({ type: 'CREATE_TEMPORARY_BLOCK', payload: temporaryBlock });
      return temporaryBlock;
    },
    updateTemporaryBlock: (id: string, blockData: Partial<ContextBlock>) => {
      dispatch({ type: 'UPDATE_TEMPORARY_BLOCK', payload: { id, blockData } });
    },
    removeTemporaryBlock: (id: string) => {
      dispatch({ type: 'REMOVE_TEMPORARY_BLOCK', payload: id });
    },

    // Enhanced prompt actions with auto-refresh (Task 2.4) - NO OPTIMISTIC UPDATES
    createSavedPrompt: async (promptData: Omit<SavedPrompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const result = await PromptService.createPrompt(promptData);
      // Wait for database confirmation, then refresh all data (no optimistic dispatch)
      if (!result.error) {
        await refreshAllData();
      }
      return result;
    },
    updateSavedPrompt: async (id: string, promptData: Partial<SavedPrompt>) => {
      const result = await PromptService.updatePrompt(id, promptData);
      // Wait for database confirmation, then refresh all data (no optimistic dispatch)
      if (!result.error) {
        await refreshAllData();
      }
      return result;
    },
    deleteSavedPrompt: async (id: string) => {
      const result = await PromptService.deletePrompt(id);
      // Wait for database confirmation, then refresh all data (no optimistic dispatch)
      if (!result.error) {
        await refreshAllData();
      }
      return result;
    },

    // Enhanced project actions with auto-refresh (Task 2.5) - NO OPTIMISTIC UPDATES
    createPromptProject: async (projectData: { name: string; icon?: string; parent_id?: string }) => {
      const result = await ProjectService.createProject({ ...projectData, type: 'prompt' });
      // Wait for database confirmation, then refresh all data (no optimistic dispatch)
      if (!result.error) {
        await refreshAllData();
      }
      return result;
    },
    createDatasetProject: async (projectData: { name: string; icon?: string; parent_id?: string }) => {
      const result = await ProjectService.createProject({ ...projectData, type: 'dataset' });
      // Wait for database confirmation, then refresh all data (no optimistic dispatch)
      if (!result.error) {
        await refreshAllData();
      }
      return result;
    },

    // Folder modal actions
    openFolderModal: (type: 'prompts' | 'datasets') => dispatch({ type: 'OPEN_FOLDER_MODAL', payload: type }),
    closeFolderModal: () => dispatch({ type: 'CLOSE_FOLDER_MODAL' }),
    setFolderModalLoading: (loading: boolean) => dispatch({ type: 'SET_FOLDER_MODAL_LOADING', payload: loading }),

    // Enhanced folder creation with auto-refresh
    createFolder: async (folderData: { name: string; icon: string }) => {
      try {
        dispatch({ type: 'SET_FOLDER_MODAL_LOADING', payload: true });

        // Get the current folder type from the modal state
        const currentType = state.folderModal.defaultType;

        const result = currentType === 'prompts'
          ? await ProjectService.createProject({ name: folderData.name, icon: folderData.icon, type: 'prompt' })
          : await ProjectService.createProject({ name: folderData.name, icon: folderData.icon, type: 'dataset' });

        if (result.data) {
          dispatch({
            type: currentType === 'prompts' ? 'CREATE_PROMPT_PROJECT' : 'CREATE_DATASET_PROJECT',
            payload: result.data
          });
          // Wait for database confirmation, then refresh all data
          await refreshAllData();
        } else {
          console.warn('Project creation operation failed');
        }

        dispatch({ type: 'SET_FOLDER_MODAL_LOADING', payload: false });
        dispatch({ type: 'CLOSE_FOLDER_MODAL' });

        return result;
      } catch (error) {
        console.warn('Folder creation operation failed');
        dispatch({ type: 'SET_FOLDER_MODAL_LOADING', payload: false });
        throw error;
      }
    },

    // System project management (unchanged)
    refreshSystemProjects: async () => {
      try {
        const [systemPromptProjectsResult, systemDatasetProjectsResult] = await Promise.all([
          ProjectService.getSystemProjects('prompt'),
          ProjectService.getSystemProjects('dataset')
        ]);

        if (systemPromptProjectsResult.data) {
          dispatch({ type: 'SET_SYSTEM_PROMPT_PROJECTS', payload: systemPromptProjectsResult.data });
        }
        if (systemDatasetProjectsResult.data) {
          dispatch({ type: 'SET_SYSTEM_DATASET_PROJECTS', payload: systemDatasetProjectsResult.data });
        }
      } catch (error) {
        console.error('Error refreshing system projects:', error);
      }
    },

    deleteProject: async (id: string, type: 'prompt' | 'dataset') => {
      const result = await ProjectService.deleteProject(id, type);
      if (!result.error) {
        dispatch({
          type: type === 'prompt' ? 'DELETE_PROMPT_PROJECT' : 'DELETE_DATASET_PROJECT',
          payload: id
        });
        // Wait for database confirmation, then refresh all data
        await refreshAllData();
      }
      return result;
    },

    // Chat actions
    setChatPanelOpen: (open: boolean) => dispatch({ type: 'SET_CHAT_PANEL_OPEN', payload: open }),
    setSelectedModel: (model: string) => dispatch({ type: 'SET_SELECTED_MODEL', payload: model }),

    // Conversation actions
    setConversations: (conversations: Conversation[]) => dispatch({ type: 'SET_CONVERSATIONS', payload: conversations }),
    setConversationLoading: (loading: boolean) => dispatch({ type: 'SET_CONVERSATION_LOADING', payload: loading }),
    setConversationError: (error: string | null) => dispatch({ type: 'SET_CONVERSATION_ERROR', payload: error }),
    setConversationFilters: (filters: ConversationFilters) => dispatch({ type: 'SET_CONVERSATION_FILTERS', payload: filters }),

    loadConversations: async (options?: ConversationListOptions) => {
      dispatch({ type: 'SET_CONVERSATION_LOADING', payload: true });
      dispatch({ type: 'SET_CONVERSATION_ERROR', payload: null });

      try {
        const result = await ConversationService.getConversations(options);
        if (result.error) {
          dispatch({ type: 'SET_CONVERSATION_ERROR', payload: result.error });
        } else if (result.data) {
          dispatch({ type: 'SET_CONVERSATIONS', payload: result.data });
        }
      } catch (error) {
        dispatch({ type: 'SET_CONVERSATION_ERROR', payload: 'Failed to load conversations' });
      }
    },

    createConversation: async (conversationData: any) => {
      try {
        const result = await ConversationService.createConversation(conversationData);
        if (result.error) {
          dispatch({ type: 'SET_CONVERSATION_ERROR', payload: result.error });
        } else if (result.data) {
          dispatch({ type: 'CREATE_CONVERSATION', payload: result.data });
        }
        return result;
      } catch (error) {
        dispatch({ type: 'SET_CONVERSATION_ERROR', payload: 'Failed to create conversation' });
        return { data: null, error: 'Failed to create conversation' };
      }
    },

    updateConversation: async (id: string, conversationData: Partial<Conversation>) => {
      try {
        const result = await ConversationService.updateConversation(id, conversationData);
        if (result.error) {
          dispatch({ type: 'SET_CONVERSATION_ERROR', payload: result.error });
        } else if (result.data) {
          dispatch({ type: 'UPDATE_CONVERSATION', payload: { id, conversationData } });
        }
        return result;
      } catch (error) {
        dispatch({ type: 'SET_CONVERSATION_ERROR', payload: 'Failed to update conversation' });
        return { data: null, error: 'Failed to update conversation' };
      }
    },

    deleteConversation: async (id: string) => {
      try {
        const result = await ConversationService.deleteConversation(id);
        if (result.error) {
          dispatch({ type: 'SET_CONVERSATION_ERROR', payload: result.error });
        } else {
          dispatch({ type: 'DELETE_CONVERSATION', payload: id });
        }
        return result;
      } catch (error) {
        dispatch({ type: 'SET_CONVERSATION_ERROR', payload: 'Failed to delete conversation' });
        return { data: null, error: 'Failed to delete conversation' };
      }
    },

    searchConversations: async (query: string) => {
      try {
        const result = await ConversationService.searchConversations(query);
        if (result.error) {
          dispatch({ type: 'SET_CONVERSATION_ERROR', payload: result.error });
        } else if (result.data) {
          // Convert search results to Conversation format
          const conversations = result.data.map(searchResult => ({
            id: searchResult.id,
            user_id: '', // Will be populated by the service
            title: searchResult.title,
            description: searchResult.description,
            model_name: searchResult.model_name,
            model_provider: '',
            status: 'active' as const,
            is_favorite: searchResult.is_favorite,
            token_usage: 0,
            execution_duration_ms: 0,
            estimated_cost: 0,
            original_prompt_content: '',
            context_block_ids: [],
            metadata: {},
            created_at: searchResult.created_at,
            updated_at: searchResult.updated_at
          }));
          dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
        }
        return result;
      } catch (error) {
        dispatch({ type: 'SET_CONVERSATION_ERROR', payload: 'Failed to search conversations' });
        return { data: null, error: 'Failed to search conversations' };
      }
    },

    createConversationMessage: async (messageData: CreateConversationMessageData) => {
      try {
        const result = await ConversationMessageService.createMessage(messageData);
        return result;
      } catch (error) {
        console.error('Failed to create conversation message:', error);
        return { data: null, error: 'Failed to create conversation message' };
      }
    },

    // Legacy actions (保持向后兼容)
    savePromptAsTemplate: async (title: string) => {
      // Create a saved prompt from current prompt builder content
      const result = await PromptService.createPrompt({
        title: title,
        description: 'Created from prompt builder',
        content: state.promptBuilder.customText
      });

      if (!result.error && result.data) {
        // Refresh data to show the new prompt
        await refreshAllData();
        return result.data.id;
      }

      throw new Error('Failed to save prompt as template');
    },
    movePromptToFolder: (promptId: string, folderId: string) => {
      // Will be implemented
    }
  };

  return (
    <LibraryContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibraryState() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibraryState must be used within a LibraryProvider');
  }
  return context.state;
}

export function useLibraryActions() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibraryActions must be used within a LibraryProvider');
  }
  return context.actions;
}