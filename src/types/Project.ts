export interface Project {
  id: string;
  name: string;
  icon: string;
  type: 'prompts' | 'datasets';
  folderPath?: string | null;
  promptCount: number; // Number of prompts in this project
  isSystem: boolean; // True for system projects like Unsorted
  parentId?: string | null; // For nested folder structure (future feature)
  createdAt: Date;
  updatedAt: Date;
}