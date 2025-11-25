import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Loader2, Plus } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { ProjectSidebar } from './ProjectSidebar';
import { ProfileButton } from './ProfileButton';
import { ProfileModal } from './ProfileModal';
import { SearchBar } from './SearchBar';
import { CollapsibleTagSection } from './CollapsibleTagSection';
import { ContextBlocksGrid } from './ContextBlocksGrid';
import { SavedPromptList } from './SavedPromptList';
import { CreateContextModal } from './CreateContextModal';
import { CreatePromptModal } from './CreatePromptModal';
import { CreateFolderModal } from './CreateFolderModal';
import { SynchronizedLoading } from './ui/SynchronizedLoading';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { useAuthState } from '../contexts/AuthContext';
import { Project } from '../services/projectService';

// Extended project interface with type information
interface ProjectWithType extends Project {
  type: 'prompts' | 'datasets';
}

// Action type for post-authentication trigger
type PostAuthAction = 'add-knowledge' | 'add-prompt' | 'create-folder' | null;
type FolderType = 'prompts' | 'datasets';

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

  // Get authentication state
  const { isAuthenticated } = useAuthState();

  // Get data from LibraryContext
  const { savedPrompts, promptProjects, datasetProjects, systemPromptProjects, systemDatasetProjects, loading, error, folderModal } = useLibraryState();
  const { updateSavedPrompt, deleteSavedPrompt, createFolder, closeFolderModal, openFolderModal } = useLibraryActions();

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

  // Helper function to get the type of the current selected project
  const getCurrentProjectType = (): 'prompts' | 'datasets' => {
    const currentProject = allProjects.find(p => p.id === selectedProject);
    return currentProject?.type || 'datasets'; // Default to datasets for backward compatibility
  };

  // Handle prompt updates with database
  const handlePromptUpdate = async (updatedPrompt: any) => {
    try {
      await updateSavedPrompt(updatedPrompt.id, updatedPrompt);
    } catch (error) {
      console.error('Failed to update prompt:', error);
      // Handle error - could show toast notification
    }
  };

  // Handle prompt deletion with database
  const handlePromptDelete = async (promptId: string) => {
    try {
      await deleteSavedPrompt(promptId);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      // Handle error - could show toast notification
    }
  };

  // Handle prompt loading
  const handlePromptLoad = (promptId: string) => {
    const prompt = savedPrompts?.find(p => p.id === promptId);
    if (prompt) {
            // Here you could implement logic to load the prompt into the main editor
      // For now, we'll just log it
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
      isLoading={loading && !shouldShowErrorOverlay && allProjects.length === 0}
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
        } bg-neutral-800 border-r border-neutral-700 flex-col transition-all duration-300 ease-out h-full z-50 fixed md:relative h-full ${
          contextLibrarySidebarExpanded ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 min-h-[73px]">
          {contextLibrarySidebarExpanded && <AppLogo />}

          {/* Toggle Button - Always visible */}
          <button
            onClick={toggleContextLibrarySidebar}
            className={`p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            />
          </div>
        )}

        {/* Profile Button - Only show when sidebar is expanded */}
        {contextLibrarySidebarExpanded && (
          <div className="p-4">
            <ProfileButton onClick={handleProfileClick} />
          </div>
        )}
      </div>

      {/* Main Content Area - Fixed header elements, scrollable content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          {/* Unified Search Bar with Mobile Sidebar Toggle */}
          <div className="border-b border-neutral-700">
            <div className="flex items-center gap-3 p-4 md:p-6">
                {/* Mobile Sidebar Toggle - Only visible on mobile when sidebar is collapsed */}
                <button
                  onClick={toggleContextLibrarySidebar}
                  className="md:hidden p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                  aria-label="Expand sidebar"
                  data-testid="mobile-sidebar-toggle"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Search Bar - Responsive across all screen sizes */}
                <div className="flex-1 min-w-0">
                  <SearchBar
                    showFullWidth={false}
                    onAddKnowledge={getCurrentProjectType() === 'datasets' ? handleAddKnowledge : undefined}
                    onAddPrompt={handleAddPrompt}
                    searchType={getCurrentProjectType() === 'prompts' ? 'prompts' : 'context'}
                  />
                </div>
            </div>
            </div>

          {/* Collapsible Tag Filter Section - Only for context blocks */}
          {!isPromptProject && <CollapsibleTagSection />}
        </div>

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