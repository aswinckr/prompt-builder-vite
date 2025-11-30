import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle, Loader2, Plus, RefreshCw } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { ProjectSidebar } from './ProjectSidebar';
import { ProfileButton } from './ProfileButton';
import { KnowledgeHistoryButton } from './KnowledgeHistoryButton';
import { ProfileModal } from './ProfileModal';
import { GlobalSearch } from './GlobalSearch';
import { CollapsibleTagSection } from './CollapsibleTagSection';
import { ContextBlocksGrid } from './ContextBlocksGrid';
import { SavedPromptList } from './SavedPromptList';
import { CreateContextModal } from './CreateContextModal';
import { CreatePromptModal } from './CreatePromptModal';
import { CreateFolderModal } from './CreateFolderModal';
import { RenameFolderModal } from './RenameFolderModal';
import { DeleteFolderModal } from './DeleteFolderModal';
import { SynchronizedLoading } from './ui/SynchronizedLoading';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { useAuthState } from '../contexts/AuthContext';
import { Project } from '../services/projectService';
import { isHtmlContent } from '../utils/contentFormatUtils';
import { htmlToText } from '../utils/markdownUtils';

// Extended project interface with type information
interface ProjectWithType extends Project {
  type: 'prompts' | 'datasets';
}

// Action type for post-authentication trigger
type PostAuthAction = 'add-knowledge' | 'add-prompt' | 'create-folder' | null;
type FolderType = 'prompts' | 'datasets';

// Error types for better error handling
interface OperationError {
  message: string;
  type: 'network' | 'permission' | 'concurrent' | 'validation' | 'unknown';
  retryable?: boolean;
  action?: string;
  retry?: () => Promise<void>;
}

export function ContextLibrary() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateContextModalOpen, setIsCreateContextModalOpen] = useState(false);
  const [isCreatePromptModalOpen, setIsCreatePromptModalOpen] = useState(false);
  const [contextLibrarySidebarExpanded, setContextLibrarySidebarExpanded] = useState(
    window.innerWidth >= 768 // Auto-collapse on mobile
  );
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [postAuthAction, setPostAuthAction] = useState<PostAuthAction>(null);
  const [pendingFolderType, setPendingFolderType] = useState<FolderType>('prompts');

  // Error handling state
  const [operationError, setOperationError] = useState<OperationError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Get authentication state
  const { isAuthenticated } = useAuthState();

  // Get data from LibraryContext
  const {
    savedPrompts,
    promptProjects,
    datasetProjects,
    systemPromptProjects,
    systemDatasetProjects,
    loading,
    error,
    folderModal,
    renameModal,
    deleteModal
  } = useLibraryState();

  const {
    updateSavedPrompt,
    deleteSavedPrompt,
    createFolder,
    closeFolderModal,
    openFolderModal,
    setCustomText,
    clearPromptBuilder,
    openRenameModal,
    closeRenameModal,
    renameProject,
    openDeleteModal,
    closeDeleteModal,
    deleteProject,
    setDeleteModalLoading
  } = useLibraryActions();

  // Get navigation function
  const navigate = useNavigate();

  // Error handling utility functions
  const categorizeError = (error: unknown): OperationError => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    if (errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('fetch') ||
        errorMessage.toLowerCase().includes('timeout')) {
      return {
        message: errorMessage,
        type: 'network',
        retryable: true,
        action: 'Please check your internet connection and try again.'
      };
    }

    if (errorMessage.toLowerCase().includes('permission') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('forbidden')) {
      return {
        message: errorMessage,
        type: 'permission',
        retryable: false,
        action: 'You may need to log in again or contact an administrator.'
      };
    }

    if (errorMessage.toLowerCase().includes('concurrent') ||
        errorMessage.toLowerCase().includes('modified by another') ||
        errorMessage.toLowerCase().includes('already deleted')) {
      return {
        message: errorMessage,
        type: 'concurrent',
        retryable: true,
        action: 'Please refresh the page and try again.'
      };
    }

    if (errorMessage.toLowerCase().includes('validation') ||
        errorMessage.toLowerCase().includes('required') ||
        errorMessage.toLowerCase().includes('invalid')) {
      return {
        message: errorMessage,
        type: 'validation',
        retryable: false,
        action: 'Please check your input and try again.'
      };
    }

    return {
      message: errorMessage,
      type: 'unknown',
      retryable: false,
      action: 'Please try again or contact support if the problem persists.'
    };
  };

  const handleOperationError = (error: unknown, retry?: () => Promise<void>) => {
    const categorizedError = categorizeError(error);
    setOperationError({ ...categorizedError, retry });

    // Log error for debugging
    console.error('Folder operation error:', {
      error: categorizedError,
      timestamp: new Date().toISOString(),
      context: 'folder-management'
    });
  };

  const clearOperationError = () => {
    setOperationError(null);
    setIsRetrying(false);
  };

  const retryOperation = async () => {
    if (!operationError?.retryable || !operationError.retry) return;

    setIsRetrying(true);
    try {
      await operationError.retry();
      clearOperationError(); // Clear error on success
    } catch (error) {
      // Handle subsequent retry failures
      handleOperationError(error, operationError.retry);
    } finally {
      setIsRetrying(false);
    }
  };

  // Combine all projects for sidebar with type information (system projects first) - memoized for performance
  const allProjects: ProjectWithType[] = useMemo(() => [
    ...((systemPromptProjects || []).map(p => ({ ...p, type: 'prompts' as const }))),
    ...((systemDatasetProjects || []).map(p => ({ ...p, type: 'datasets' as const }))),
    ...((promptProjects || []).map(p => ({ ...p, type: 'prompts' as const }))),
    ...((datasetProjects || []).map(p => ({ ...p, type: 'datasets' as const })))
  ], [systemPromptProjects, systemDatasetProjects, promptProjects, datasetProjects]);

  // Set default project if none selected
  useEffect(() => {
    if (!selectedProject && allProjects.length > 0) {
      setSelectedProject(allProjects[0].id);
    }
  }, [selectedProject, allProjects]);

  // Handle post-authentication action triggering
  const handleAuthSuccess = () => {
    if (postAuthAction) {
      // Execute the stored action after successful authentication
      switch (postAuthAction) {
        case 'add-knowledge':
          handleOpenCreateContextModal();
          break;
        case 'add-prompt':
          handleOpenCreatePromptModal();
          break;
        case 'create-folder':
          openFolderModal(pendingFolderType);
          break;
      }
      // Clear the stored action
      setPostAuthAction(null);
    }
  };

  // Handle authentication failure or cancellation
  const handleAuthFailure = () => {
    // Clear the stored action and folder type, return to clean state
    setPostAuthAction(null);
    setPendingFolderType('prompts');
  };

  // Remove blocking empty state - let users access the interface even with no projects

  const toggleContextLibrarySidebar = () => {
    setContextLibrarySidebarExpanded(!contextLibrarySidebarExpanded);
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleOpenCreateContextModal = () => {
    setIsCreateContextModalOpen(true);
  };

  const handleCloseCreateContextModal = () => {
    setIsCreateContextModalOpen(false);
  };

  const handleOpenCreatePromptModal = () => {
    setIsCreatePromptModalOpen(true);
  };

  const handleCloseCreatePromptModal = () => {
    setIsCreatePromptModalOpen(false);
  };

  // Enhanced handlers for add buttons that check authentication
  const handleAddKnowledge = () => {
    if (!isAuthenticated) {
      // Store the intended action and open auth modal
      setPostAuthAction('add-knowledge');
      setIsProfileModalOpen(true);
    } else {
      handleOpenCreateContextModal();
    }
  };

  const handleAddPrompt = () => {
    if (!isAuthenticated) {
      // Store the intended action and open auth modal
      setPostAuthAction('add-prompt');
      setIsProfileModalOpen(true);
    } else {
      handleOpenCreatePromptModal();
    }
  };

  const handleCreateFolder = (type: FolderType) => {
    if (!isAuthenticated) {
      // Store the intended action and folder type, then open auth modal
      setPostAuthAction('create-folder');
      setPendingFolderType(type);
      setIsProfileModalOpen(true);
    } else {
      openFolderModal(type);
    }
  };

  // Handle folder rename with error handling
  const handleRenameFolder = (folder: Project, type: 'prompts' | 'datasets') => {
    clearOperationError();
    openRenameModal(folder, type);
  };

  // Handle folder rename submission with enhanced error handling
  const handleRenameFolderSubmit = async (data: { name: string; folderId: string; type: 'prompts' | 'datasets' }) => {
    const renameOperation = async () => {
      await renameProject(data.folderId, data.type, data.name);
    };

    try {
      clearOperationError();
      await renameOperation();
    } catch (error) {
      handleOperationError(error, renameOperation);
      // Re-throw to let the modal handle the error display
      throw error;
    }
  };

  // Handle folder delete with error handling
  const handleDeleteFolder = (folder: Project, type: 'prompts' | 'datasets') => {
    clearOperationError();
    openDeleteModal(folder, type);
  };

  // Handle folder delete confirmation with enhanced error handling
  const handleDeleteFolderConfirm = async () => {
    if (!deleteModal.folder) return;

    const folderId = deleteModal.folder.id;
    const deleteOperation = async () => {
      await deleteProject(folderId, deleteModal.type);
      closeDeleteModal();

      // If the deleted folder was selected, clear the selection
      if (selectedProject === folderId) {
        setSelectedProject('');
      }
    };

    try {
      clearOperationError();
      setDeleteModalLoading(true);

      await deleteOperation();
    } catch (error) {
      handleOperationError(error, deleteOperation);
      setDeleteModalLoading(false);
      // Keep modal open for user to see error
    }
  };

  // Helper function to get the type of the current selected project
  const getCurrentProjectType = (): 'prompts' | 'datasets' => {
    const currentProject = allProjects.find(p => p.id === selectedProject);
    return currentProject?.type || 'datasets'; // Default to datasets for backward compatibility
  };

  // Handle prompt updates with database and error handling
  const handlePromptUpdate = async (updatedPrompt: any) => {
    const updateOperation = async () => {
      await updateSavedPrompt(updatedPrompt.id, updatedPrompt);
    };

    try {
      clearOperationError();
      await updateOperation();
    } catch (error) {
      handleOperationError(error, updateOperation);
      // Error could be shown in a toast notification
    }
  };

  // Handle prompt deletion with database and error handling
  const handlePromptDelete = async (promptId: string) => {
    const deleteOperation = async () => {
      await deleteSavedPrompt(promptId);
    };

    try {
      clearOperationError();
      await deleteOperation();
    } catch (error) {
      handleOperationError(error, deleteOperation);
      // Error could be shown in a toast notification
    }
  };

  // Handle prompt loading
  const handlePromptLoad = (promptId: string) => {
    const prompt = savedPrompts?.find(p => p.id === promptId);
    if (prompt) {
      // Preserve HTML content for TipTap editor
      const rawContent = prompt.content || '';

      // Ensure content is in HTML format for TipTap
      const htmlContent = isHtmlContent(rawContent) ? rawContent :
        rawContent.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');

      // Clear existing content and load the prompt content as HTML
      clearPromptBuilder();
      setCustomText(htmlContent);

      // Add a small delay to ensure state is updated before navigation
      Promise.resolve().then(() => {
        navigate('/prompt');
      });
    }
  };

  // Find the current project to determine its type
  const currentProject = allProjects.find(p => p.id === selectedProject);
  // Default to context blocks view if no project or if project is a dataset
  const isPromptProject = currentProject?.type === 'prompts';

  // Modify error handling - don't show error overlay for authentication-related issues
  const shouldShowErrorOverlay = error && !error.toLowerCase().includes('user not authenticated');

  return (
    <SynchronizedLoading
      isLoading={loading && !shouldShowErrorOverlay && !operationError && allProjects.length === 0}
      message="Loading your data..."
    >
      <div className="h-full flex overflow-hidden">
      {/* Mobile Overlay - Only visible on mobile when sidebar is expanded */}
      {contextLibrarySidebarExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleContextLibrarySidebar}
        />
      )}

      {/* Project Sidebar - Fixed height, no scrolling */}
      <div
        className={`${
          contextLibrarySidebarExpanded ? 'w-64 md:w-64' : 'w-16'
        } bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 ease-out h-full z-50 fixed md:relative h-full ${
          contextLibrarySidebarExpanded ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 min-h-[73px]">
          {contextLibrarySidebarExpanded && <AppLogo />}

          {/* Toggle Button - Always visible */}
          <button
            onClick={toggleContextLibrarySidebar}
            className={`p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              !contextLibrarySidebarExpanded ? 'mx-auto' : ''
            }`}
            aria-label={contextLibrarySidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            data-testid="context-library-sidebar-toggle"
          >
            {contextLibrarySidebarExpanded ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Project Navigation - Only rendered when sidebar is expanded, no scrolling */}
        {contextLibrarySidebarExpanded && (
          <div className="flex-1 overflow-hidden">
            <ProjectSidebar
              projects={allProjects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              loading={loading}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
            />
          </div>
        )}

        {/* Bottom Section - Profile Button */}
        {contextLibrarySidebarExpanded && (
          <div className="border-t border-sidebar-border p-4">
            {/* Profile Button */}
            <ProfileButton onClick={handleProfileClick} />
          </div>
        )}
      </div>

      {/* Main Content Area - Fixed header elements, scrollable content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          {/* Unified Search Bar with Mobile Sidebar Toggle */}
          <div className="border-b border-sidebar-border">
            <div className="flex items-center gap-3 p-4 md:p-6">
                {/* Mobile Sidebar Toggle - Only visible on mobile when sidebar is collapsed */}
                <button
                  onClick={toggleContextLibrarySidebar}
                  className="md:hidden p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 flex-shrink-0"
                  aria-label="Expand sidebar"
                  data-testid="mobile-sidebar-toggle"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Global Search - Responsive across all screen sizes */}
                <div className="flex-1 min-w-0">
                  <GlobalSearch />
                </div>

                {/* Add Buttons */}
                {isAuthenticated && (
                  <div className="flex gap-2">
                    {getCurrentProjectType() === 'datasets' && (
                      <button
                        onClick={handleAddKnowledge}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 whitespace-nowrap"
                        aria-label="Add new knowledge context block"
                      >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Knowledge</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    )}
                    {getCurrentProjectType() === 'prompts' && (
                      <button
                        onClick={handleAddPrompt}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 whitespace-nowrap"
                        aria-label="Add new prompt template"
                      >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Prompt</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    )}
                  </div>
                )}
            </div>
            </div>

          {/* Collapsible Tag Filter Section - Only for context blocks */}
          {!isPromptProject && <CollapsibleTagSection />}
        </div>

        {/* Operation Error Banner */}
        {operationError && (
          <div className="flex-shrink-0 border-l-4 border-red-500 bg-red-900/20 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-400">
                  {operationError.type === 'network' && 'Connection Error'}
                  {operationError.type === 'permission' && 'Permission Error'}
                  {operationError.type === 'concurrent' && 'Synchronization Error'}
                  {operationError.type === 'validation' && 'Validation Error'}
                  {operationError.type === 'unknown' && 'Error'}
                </p>
                <p className="text-sm text-red-300 mt-1">{operationError.message}</p>
                {operationError.action && (
                  <p className="text-xs text-red-200 mt-2">{operationError.action}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {operationError.retryable && (
                  <button
                    onClick={retryOperation}
                    disabled={isRetrying}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying...' : 'Retry'}
                  </button>
                )}
                <button
                  onClick={clearOperationError}
                  className="p-1 text-red-300 hover:text-red-200 transition-colors"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content - Always show interface, default to context blocks */}
        <div className="flex-1 overflow-hidden">
          {/* Show prompts list only when we have a prompt project selected */}
          {isPromptProject && currentProject ? (
            <SavedPromptList
              selectedProject={selectedProject}
              prompts={savedPrompts || []}
              onPromptUpdate={handlePromptUpdate}
              onPromptDelete={handlePromptDelete}
              onPromptLoad={handlePromptLoad}
            />
          ) : (
            // Always show context blocks grid (for datasets or when no project)
            <ContextBlocksGrid selectedProject={selectedProject} />
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onAuthSuccess={handleAuthSuccess}
        onAuthFailure={handleAuthFailure}
      />

      {/* Create Context Modal */}
      <CreateContextModal
        isOpen={isCreateContextModalOpen}
        onClose={handleCloseCreateContextModal}
        selectedProjectId={isPromptProject ? null : selectedProject}
      />

      {/* Create Prompt Modal */}
      <CreatePromptModal
        isOpen={isCreatePromptModalOpen}
        onClose={handleCloseCreatePromptModal}
        selectedProjectId={isPromptProject ? selectedProject : null}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={folderModal.isOpen}
        onClose={closeFolderModal}
        onCreateFolder={createFolder}
        folderType={folderModal.defaultType}
        loading={folderModal.loading}
      />

      {/* Rename Folder Modal */}
      {renameModal.folder && (
        <RenameFolderModal
          isOpen={renameModal.isOpen}
          onClose={closeRenameModal}
          onRename={handleRenameFolderSubmit}
          folder={renameModal.folder}
          type={renameModal.type}
          loading={renameModal.loading}
        />
      )}

      {/* Delete Folder Modal */}
      {deleteModal.folder && (
        <DeleteFolderModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteFolderConfirm}
          folder={deleteModal.folder}
          type={deleteModal.type}
          isLoading={deleteModal.loading}
        />
      )}

      {/* Error State Overlay - Only show for non-authentication errors */}
      {shouldShowErrorOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-neutral-800 rounded-lg p-6 max-w-md mx-4 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-400 mb-2 font-medium">Failed to load data</p>
            <p className="text-neutral-400 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
    </SynchronizedLoading>
  );
}