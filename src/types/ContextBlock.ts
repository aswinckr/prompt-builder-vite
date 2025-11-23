export interface ContextBlock {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  content: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  project?: {
    id: string;
    name: string;
    icon: string;
  } | null;
}