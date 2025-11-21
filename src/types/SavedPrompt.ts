export interface SavedPrompt {
  id: number;
  title: string;
  description: string;
  content: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  folder: string | null;
  tags: string[];
}