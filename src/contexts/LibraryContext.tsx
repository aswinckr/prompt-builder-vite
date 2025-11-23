import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ContextBlock } from '../types/ContextBlock';
import { SavedPrompt } from '../types/SavedPrompt';
import { ContextService } from '../services/contextService';
import { DatabaseResponse } from '../services/databaseService';
import { PromptService } from '../services/promptService';
import { ProjectService, Project } from '../services/projectService';

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
  promptProjects: Project[];
  datasetProjects: Project[];
  systemPromptProjects: Project[];
  systemDatasetProjects: Project[];
  loading: boolean;
  error: string | null;
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

const initialState: LibraryState = {
  promptBuilder: {
    customText: '',
    blockOrder: []
  },
  chat: {
    isChatPanelOpen: false,
    selectedModel: 'gemini-3-pro',
  },
  contextSelection: {
    selectedBlockIds: []
  },
  contextBlocks: [],
  savedPrompts: [],
  promptProjects: [],
  datasetProjects: [],
  systemPromptProjects: [],
  systemDatasetProjects: [],
  loading: false,
  error: null,
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
    case 'SET_CONTEXT_BLOCKS':
      return { ...state, contextBlocks: action.payload, loading: false };
    case 'SET_SAVED_PROMPTS':
      return { ...state, savedPrompts: action.payload, loading: false };
    case 'SET_PROMPT_PROJECTS':
      return { ...state, promptProjects: action.payload, loading: false };
    case 'SET_DATASET_PROJECTS':
      return { ...state, datasetProjects: action.payload, loading: false };
    case 'SET_SYSTEM_PROMPT_PROJECTS':
      return { ...state, systemPromptProjects: action.payload, loading: false };
    case 'SET_SYSTEM_DATASET_PROJECTS':
      return { ...state, systemDatasetProjects: action.payload, loading: false };
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

  // Load initial data when component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // First, ensure unsorted folders exist for the user
      await ProjectService.ensureUnsortedFolders();

      // Load all data in parallel
      const [contextBlocksResult, savedPromptsResult, promptProjectsResult, datasetProjectsResult, systemPromptProjectsResult, systemDatasetProjectsResult] = await Promise.all([
        ContextService.getContextBlocks(),
        PromptService.getPrompts(),
        ProjectService.getUserProjects('prompt'),
        ProjectService.getUserProjects('dataset'),
        ProjectService.getSystemProjects('prompt'),
        ProjectService.getSystemProjects('dataset')
      ]);

      // Always set the data, even if it's empty (this is normal for new users)
      dispatch({ type: 'SET_CONTEXT_BLOCKS', payload: contextBlocksResult.data || [] });
      dispatch({ type: 'SET_SAVED_PROMPTS', payload: savedPromptsResult.data || [] });
      dispatch({ type: 'SET_PROMPT_PROJECTS', payload: promptProjectsResult.data || [] });
      dispatch({ type: 'SET_DATASET_PROJECTS', payload: datasetProjectsResult.data || [] });
      dispatch({ type: 'SET_SYSTEM_PROMPT_PROJECTS', payload: systemPromptProjectsResult.data || [] });
      dispatch({ type: 'SET_SYSTEM_DATASET_PROJECTS', payload: systemDatasetProjectsResult.data || [] });

      // Check for any errors from the service calls
      const errors = [
        contextBlocksResult.error,
        savedPromptsResult.error,
        promptProjectsResult.error,
        datasetProjectsResult.error,
        systemPromptProjectsResult.error,
        systemDatasetProjectsResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Database errors:', errors);
        dispatch({ type: 'SET_ERROR', payload: errors[0] || 'Failed to load data' });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
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

    // Context block actions
    createContextBlock: async (blockData: Omit<ContextBlock, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const result = await ContextService.createContextBlock(blockData);
      if (result.data) {
        dispatch({ type: 'CREATE_CONTEXT_BLOCK', payload: result.data });
      }
      return result;
    },
    updateContextBlock: async (id: string, blockData: Partial<ContextBlock>) => {
      const result = await ContextService.updateContextBlock(id, blockData);
      if (result.data) {
        dispatch({ type: 'UPDATE_CONTEXT_BLOCK', payload: { id, blockData } });
      }
      return result;
    },
    deleteContextBlock: async (id: string) => {
      const result = await ContextService.deleteContextBlock(id);
      if (!result.error) {
        dispatch({ type: 'DELETE_CONTEXT_BLOCK', payload: id });
      }
      return result;
    },

    // Prompt actions
    createSavedPrompt: async (promptData: Omit<SavedPrompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const result = await PromptService.createPrompt(promptData);
      if (result.data) {
        dispatch({ type: 'CREATE_SAVED_PROMPT', payload: result.data });
      }
      return result;
    },
    updateSavedPrompt: async (id: string, promptData: Partial<SavedPrompt>) => {
      const result = await PromptService.updatePrompt(id, promptData);
      if (result.data) {
        dispatch({ type: 'UPDATE_SAVED_PROMPT', payload: { id, promptData } });
      }
      return result;
    },
    deleteSavedPrompt: async (id: string) => {
      const result = await PromptService.deletePrompt(id);
      if (!result.error) {
        dispatch({ type: 'DELETE_SAVED_PROMPT', payload: id });
      }
      return result;
    },

    // Project actions
    createPromptProject: async (projectData: { name: string; icon?: string; parent_id?: string }) => {
      const result = await ProjectService.createProject({ ...projectData, type: 'prompt' });
      if (result.data) {
        dispatch({ type: 'CREATE_PROMPT_PROJECT', payload: result.data });
      }
      return result;
    },
    createDatasetProject: async (projectData: { name: string; icon?: string; parent_id?: string }) => {
      const result = await ProjectService.createProject({ ...projectData, type: 'dataset' });
      if (result.data) {
        dispatch({ type: 'CREATE_DATASET_PROJECT', payload: result.data });
      }
      return result;
    },

    // Folder modal actions
    openFolderModal: (type: 'prompts' | 'datasets') => dispatch({ type: 'OPEN_FOLDER_MODAL', payload: type }),
    closeFolderModal: () => dispatch({ type: 'CLOSE_FOLDER_MODAL' }),
    setFolderModalLoading: (loading: boolean) => dispatch({ type: 'SET_FOLDER_MODAL_LOADING', payload: loading }),

    // Unified folder creation (type is determined by modal context)
    createFolder: async (folderData: { name: string; icon: string }) => {
      console.log('🔨 Create folder called with:', folderData);
      console.log('📊 Current modal state:', state.folderModal);

      try {
        dispatch({ type: 'SET_FOLDER_MODAL_LOADING', payload: true });

        // Get the current folder type from the modal state
        const currentType = state.folderModal.defaultType;
        console.log('🎯 Creating folder of type:', currentType);

        const result = currentType === 'prompts'
          ? await ProjectService.createProject({ name: folderData.name, icon: folderData.icon, type: 'prompt' })
          : await ProjectService.createProject({ name: folderData.name, icon: folderData.icon, type: 'dataset' });

        console.log('✅ ProjectService result:', result);

        if (result.data) {
          console.log('📝 Dispatching project creation to state');
          dispatch({
            type: currentType === 'prompts' ? 'CREATE_PROMPT_PROJECT' : 'CREATE_DATASET_PROJECT',
            payload: result.data
          });
        } else {
          console.error('❌ No data returned from ProjectService:', result.error);
        }

        dispatch({ type: 'SET_FOLDER_MODAL_LOADING', payload: false });
        dispatch({ type: 'CLOSE_FOLDER_MODAL' });

        return result;
      } catch (error) {
        console.error('❌ Error creating folder:', error);
        dispatch({ type: 'SET_FOLDER_MODAL_LOADING', payload: false });
        throw error;
      }
    },

    // System project management
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
      }
      return result;
    },

    // Chat actions
    setChatPanelOpen: (open: boolean) => dispatch({ type: 'SET_CHAT_PANEL_OPEN', payload: open }),
    setSelectedModel: (model: string) => dispatch({ type: 'SET_SELECTED_MODEL', payload: model }),

    // Legacy actions (保持向后兼容)
    savePromptAsTemplate: (name: string) => {
      return Date.now().toString();
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

