import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';

// Mock project data
const mockProjects = [
  { id: 'notes', name: 'Notes', icon: '📝', type: 'datasets' },
  { id: 'project1', name: 'Prompt Project 1', icon: '📁', type: 'prompts', promptCount: 12 },
  { id: 'project2', name: 'Dataset Project 1', icon: '📊', type: 'datasets' },
  { id: 'project3', name: 'Prompt Project 2', icon: '📁', type: 'prompts', promptCount: 8 },
];

interface ProjectSidebarProps {
  selectedProject: string;
  setSelectedProject: (id: string) => void;
}

export function ProjectSidebar({ selectedProject, setSelectedProject }: ProjectSidebarProps) {
  const [projects, setProjects] = useState(mockProjects);

  // Organize projects by type
  const promptProjects = projects.filter(p => p.type === 'prompts');
  const datasetProjects = projects.filter(p => p.type === 'datasets');

  // Handle project creation
  const handleCreateProject = useCallback(async (type: 'prompts' | 'datasets') => {
    const count = type === 'prompts' ? promptProjects.length + 1 : datasetProjects.length + 1;
    const name = type === 'prompts' ? `Prompt Project ${count}` : `Dataset Project ${count}`;

    const newProject = {
      id: `project${Date.now()}`,
      name,
      type,
      icon: type === 'prompts' ? '📁' : '📊',
      ...(type === 'prompts' ? { promptCount: 0 } : {})
    };

    setProjects(prev => [...prev, newProject]);
    setSelectedProject(newProject.id);
  }, [promptProjects.length, datasetProjects.length]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const interactiveElements = event.currentTarget.querySelectorAll('[data-project-button], [data-add-button]');
    const currentIndex = Array.from(interactiveElements).findIndex(
      element => element === document.activeElement
    );

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % interactiveElements.length;
        (interactiveElements[nextIndex] as HTMLElement).focus();
        break;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex <= 0 ? interactiveElements.length - 1 : currentIndex - 1;
        (interactiveElements[prevIndex] as HTMLElement).focus();
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        const activeElement = document.activeElement as HTMLElement;

        if (activeElement.hasAttribute('data-project-name')) {
          const projectId = activeElement.getAttribute('data-project-name');
          console.log('ProjectSidebar - clicked project ID:', projectId);
          if (projectId) {
            setSelectedProject(projectId);
            console.log('ProjectSidebar - set selectedProject to:', projectId);
          }
        } else if (activeElement.hasAttribute('data-add-button')) {
          const projectType = activeElement.getAttribute('data-add-button') as 'prompts' | 'datasets';
          if (projectType) {
            handleCreateProject(projectType);
          }
        }
        break;
    }
  };

  // Project Section Component
  const ProjectSection = ({
    title,
    projects,
    type
  }: {
    title: string;
    projects: any[];
    type: 'prompts' | 'datasets';
  }) => {
    // Sort projects: Notes first, then alphabetically
    const sortedProjects = [...projects].sort((a, b) => {
      if (a.id === 'notes') return -1;
      if (b.id === 'notes') return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">
            {title}
          </h3>
          <button
            onClick={() => handleCreateProject(type)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCreateProject(type);
              }
            }}
            className="p-1 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
            aria-label={`Add new ${type.slice(0, -1)} project`}
            data-add-button={type}
            data-testid={`add-${type}-project`}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1" role="list">
          {sortedProjects.length === 0 ? (
            <div className="px-3 py-2 text-sm text-neutral-500">No projects yet</div>
          ) : (
            sortedProjects.map((project, index) => (
              <button
                key={project.id}
                data-project-button
                data-project-name={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800 ${
                  selectedProject === project.id
                    ? 'bg-neutral-700 text-white'
                    : 'text-neutral-400 hover:bg-neutral-750 hover:text-neutral-200'
                }`}
                role="listitem"
                aria-label={`Select ${project.name} project`}
                aria-pressed={selectedProject === project.id}
                tabIndex={index === 0 && selectedProject !== project.id ? 0 : selectedProject === project.id ? 0 : -1}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" role="img" aria-hidden="true">
                    {project.icon}
                  </span>
                  <span className="text-sm font-medium">{project.name}</span>
                </div>
                {type === 'prompts' && project.promptCount !== undefined && (
                  <span className="text-xs text-neutral-500">
                    ({project.promptCount})
                  </span>
                )}
                {project.id === 'notes' && (
                  <span className="text-xs text-neutral-500 ml-1">
                    System
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="p-4 flex flex-col"
      onKeyDown={handleKeyDown}
    >
      {/* PROMPTS Section */}
      <ProjectSection
        title="PROMPTS"
        projects={promptProjects}
        type="prompts"
      />

      {/* DATASETS Section */}
      <ProjectSection
        title="DATASETS"
        projects={datasetProjects}
        type="datasets"
      />
    </div>
  );
}