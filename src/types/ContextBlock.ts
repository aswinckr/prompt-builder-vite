export interface ContextBlock {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  content: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  isTemporary?: boolean; // New field to distinguish temporary text blocks from permanent knowledge blocks
  project?: {
    id: string;
    name: string;
    icon: string;
  } | null;
}