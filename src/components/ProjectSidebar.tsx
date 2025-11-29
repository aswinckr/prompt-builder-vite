import React, { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useLibraryActions } from "../contexts/LibraryContext";
import { Project } from "../services/projectService";

interface ProjectSidebarProps {
  projects: (Project & { type: "prompts" | "datasets" })[];
  selectedProject: string;
  setSelectedProject: (id: string) => void;
  loading?: boolean;
  onCreateFolder?: (type: "prompts" | "datasets") => void;
}

export function ProjectSidebar({
  projects,
  selectedProject,
  setSelectedProject,
  loading = false,
  onCreateFolder,
}: ProjectSidebarProps) {
  const { openFolderModal } = useLibraryActions();

  // Organize projects by type
  const promptProjects = projects.filter((p) => p.type === "prompts");
  const datasetProjects = projects.filter((p) => p.type === "datasets");

  // Handle project creation - use authentication-aware handler if provided, otherwise fallback to direct modal
  const handleCreateProject = useCallback(
    (type: "prompts" | "datasets") => {
      if (onCreateFolder) {
        onCreateFolder(type);
      } else {
        openFolderModal(type);
      }
    },
    [onCreateFolder, openFolderModal]
  );

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const interactiveElements = event.currentTarget.querySelectorAll(
      "[data-project-button], [data-add-button]"
    );
    const currentIndex = Array.from(interactiveElements).findIndex(
      (element) => element === document.activeElement
    );

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % interactiveElements.length;
        (interactiveElements[nextIndex] as HTMLElement).focus();
        break;

      case "ArrowUp":
        event.preventDefault();
        const prevIndex =
          currentIndex <= 0 ? interactiveElements.length - 1 : currentIndex - 1;
        (interactiveElements[prevIndex] as HTMLElement).focus();
        break;

      case "Enter":
      case " ":
        event.preventDefault();
        const activeElement = document.activeElement as HTMLElement;

        if (activeElement.hasAttribute("data-project-name")) {
          const projectId = activeElement.getAttribute("data-project-name");
          if (projectId) {
            setSelectedProject(projectId);
          }
        } else if (activeElement.hasAttribute("data-add-button")) {
          const projectType = activeElement.getAttribute("data-add-button") as
            | "prompts"
            | "datasets";
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
    type,
  }: {
    title: string;
    projects: Project[];
    type: "prompts" | "datasets";
  }) => {
    // Sort projects: system projects first, then alphabetically
    const sortedProjects = [...projects].sort((a, b) => {
      if (a.is_system && !b.is_system) return -1;
      if (!a.is_system && b.is_system) return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            {title}
          </h3>
          <button
            onClick={() => handleCreateProject(type)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCreateProject(type);
              }
            }}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            aria-label={`Add new ${type.slice(0, -1)} project`}
            data-add-button={type}
            data-testid={`add-${type}-project`}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1" role="list">
          {sortedProjects.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No projects yet
            </div>
          ) : (
            sortedProjects.map((project, index) => (
              <button
                key={project.id}
                data-project-button
                data-project-name={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                  selectedProject === project.id
                    ? project.is_system
                      ? "border border-primary/30 bg-primary/20 text-primary shadow-glow-sm"
                      : "border border-primary/20 bg-primary/10 text-primary shadow-glow-sm"
                    : project.is_system
                    ? "border border-primary/20 text-primary/70 hover:bg-primary/10 hover:text-primary"
                    : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                role="listitem"
                aria-label={`Select ${project.name} project`}
                aria-pressed={selectedProject === project.id}
                tabIndex={
                  index === 0 && selectedProject !== project.id
                    ? 0
                    : selectedProject === project.id
                    ? 0
                    : -1
                }
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" role="img" aria-hidden="true">
                    {project.icon}
                  </span>
                  <span className="text-sm font-medium">{project.name}</span>
                </div>
                {type === "prompts" && project.promptCount !== undefined && (
                  <span
                    className={`text-xs ${
                      selectedProject === project.id
                        ? "text-primary/80"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    ({project.promptCount})
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
    <div className="flex flex-col p-4" onKeyDown={handleKeyDown}>
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
