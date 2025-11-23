import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { ProjectSidebar } from './ProjectSidebar';
import { ProfileButton } from './ProfileButton';
import { ProfileModal } from './ProfileModal';
import { SearchBar } from './SearchBar';
import { CollapsibleTagSection } from './CollapsibleTagSection';
import { ContextBlocksGrid } from './ContextBlocksGrid';
import { SavedPromptList } from './SavedPromptList';
import { mockProjects } from '../data/mockData';

export function ContextLibrary() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [contextLibrarySidebarExpanded, setContextLibrarySidebarExpanded] = useState(
    window.innerWidth >= 768 // Auto-collapse on mobile
  );
  const [selectedProject, setSelectedProject] = useState('notes');

  const toggleContextLibrarySidebar = () => {
    setContextLibrarySidebarExpanded(!contextLibrarySidebarExpanded);
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  
  // Find the current project to determine its type
  const currentProject = mockProjects.find(p => p.id === selectedProject);
  const isPromptProject = currentProject?.type === 'prompts';

  // Debug logging
  console.log('Selected Project:', selectedProject, 'Type:', currentProject?.type, 'Is Prompt Project:', isPromptProject);

  return (
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
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
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
          {/* Mobile Sidebar Toggle and Search Bar */}
          {!isPromptProject && (
            <div className="flex items-center gap-3 p-4 md:p-6 border-b border-neutral-700">
              {/* Mobile Sidebar Toggle - Only visible on mobile when sidebar is collapsed */}
              <button
                onClick={toggleContextLibrarySidebar}
                className="md:hidden p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Expand sidebar"
                data-testid="mobile-sidebar-toggle"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex-1">
                <SearchBar showFullWidth={false} />
              </div>
            </div>
          )}

          {/* Desktop Search Bar - Only visible on desktop */}
          {!isPromptProject && (
            <div className="hidden md:block">
              <SearchBar />
            </div>
          )}

          {/* Collapsible Tag Filter Section - Only for context blocks */}
          {!isPromptProject && <CollapsibleTagSection />}
        </div>

        {/* Scrollable Content - Conditional rendering based on project type */}
        <div className="flex-1 overflow-hidden">
          {isPromptProject ? (
            <SavedPromptList selectedProject={selectedProject} />
          ) : (
            <ContextBlocksGrid selectedProject={selectedProject} />
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
      />
    </div>
  );
}