export interface SavedPrompt {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  content: string;
  folder?: string | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  project?: {
    id: string;
    name: string;
    icon: string;
  } | null;
}