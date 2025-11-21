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

export function ContextLibrary() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [contextLibrarySidebarExpanded, setContextLibrarySidebarExpanded] = useState(true);
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

  // Determine if this is a prompt project (for demo purposes)
  const isPromptProject = selectedProject === 'prompts';

  return (
    <div className="h-full flex overflow-hidden">
      {/* Project Sidebar - Fixed height, no scrolling */}
      <div
        className={`${
          contextLibrarySidebarExpanded ? 'w-64' : 'w-16'
        } bg-neutral-800 border-r border-neutral-700 flex flex-col transition-all duration-300 ease-out h-full`}
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
            <ProjectSidebar />
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          {/* Search Bar */}
          <SearchBar />

          {/* Collapsible Tag Filter Section */}
          <CollapsibleTagSection />
        </div>

        {/* Scrollable Content - Conditional rendering based on project type */}
        <div className="flex-1 overflow-hidden">
          {isPromptProject ? (
            <SavedPromptList />
          ) : (
            <ContextBlocksGrid />
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