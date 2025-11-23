-- Drop all existing tables first
DROP TABLE IF EXISTS prompt_context_blocks CASCADE;
DROP TABLE IF EXISTS context_blocks CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS dataset_projects CASCADE;
DROP TABLE IF EXISTS prompt_projects CASCADE;

-- Create prompt projects/folders table
CREATE TABLE prompt_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '📁',
  folder_path text NULL,
  parent_id uuid REFERENCES prompt_projects(id) ON DELETE CASCADE,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name, parent_id)
);

-- Create dataset projects/folders table (for context blocks)
CREATE TABLE dataset_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '📁',
  folder_path text NULL,
  parent_id uuid REFERENCES dataset_projects(id) ON DELETE CASCADE,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name, parent_id)
);

-- Create prompts table
CREATE TABLE prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES prompt_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text NOT NULL,
  folder text NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create context blocks table
CREATE TABLE context_blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES dataset_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create junction table for prompt-context relationships
CREATE TABLE prompt_context_blocks (
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  context_block_id uuid REFERENCES context_blocks(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, context_block_id)
);

-- Enable Row Level Security
ALTER TABLE prompt_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_context_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt projects
CREATE POLICY "Users can manage own prompt projects" ON prompt_projects
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for dataset projects
CREATE POLICY "Users can manage own dataset projects" ON dataset_projects
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for prompts
CREATE POLICY "Users can manage own prompts" ON prompts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for context blocks
CREATE POLICY "Users can manage own context blocks" ON context_blocks
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policy for junction table
CREATE POLICY "Users can manage prompt-context relationships" ON prompt_context_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM prompts WHERE prompts.id = prompt_context_blocks.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

-- Performance indexes
CREATE INDEX idx_prompt_projects_user_id ON prompt_projects(user_id);
CREATE INDEX idx_prompt_projects_parent_id ON prompt_projects(parent_id);
CREATE INDEX idx_dataset_projects_user_id ON dataset_projects(user_id);
CREATE INDEX idx_dataset_projects_parent_id ON dataset_projects(parent_id);
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_project_id ON prompts(project_id);
CREATE INDEX idx_context_blocks_user_id ON context_blocks(user_id);
CREATE INDEX idx_context_blocks_project_id ON context_blocks(project_id);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_context_blocks_created_at ON context_blocks(created_at DESC);