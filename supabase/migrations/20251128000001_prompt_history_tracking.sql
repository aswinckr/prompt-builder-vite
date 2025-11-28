-- Prompt History Tracking Schema for Supabase
-- Migration: 2025-11-28-prompt-history-tracking
-- Description: Add conversation history tracking with metadata and favorites support

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table to store complete chat sessions
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Conversation',
    description TEXT NULL,
    model_name TEXT NOT NULL,
    model_provider TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    is_favorite BOOLEAN DEFAULT false,
    token_usage INTEGER DEFAULT 0,
    execution_duration_ms INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10, 6) DEFAULT 0.000000,
    original_prompt_content TEXT NOT NULL,
    context_block_ids TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table to store individual messages within conversations
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    message_order INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation tags table for categorization
CREATE TABLE IF NOT EXISTS conversation_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, tag)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_is_favorite ON conversations(is_favorite);
CREATE INDEX IF NOT EXISTS idx_conversations_model_name ON conversations(model_name);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_user_project ON conversations(user_id, project_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_conversations_search ON conversations USING gin(
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || original_prompt_content)
);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_search ON conversation_messages USING gin(
    to_tsvector('english', content)
);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_order ON conversation_messages(conversation_id, message_order);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_role ON conversation_messages(role);

-- Tags table indexes
CREATE INDEX IF NOT EXISTS idx_conversation_tags_conversation_id ON conversation_tags(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_tags_tag ON conversation_tags(tag);

-- Row Level Security (RLS) policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations table
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for conversation_messages table
CREATE POLICY "Users can view messages of own conversations" ON conversation_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = conversation_messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in own conversations" ON conversation_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = conversation_messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in own conversations" ON conversation_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = conversation_messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in own conversations" ON conversation_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = conversation_messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

-- RLS policies for conversation_tags table
CREATE POLICY "Users can view tags of own conversations" ON conversation_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = conversation_tags.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tags for own conversations" ON conversation_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = conversation_tags.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tags of own conversations" ON conversation_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = conversation_tags.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp management
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_messages_updated_at
    BEFORE UPDATE ON conversation_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for searching conversations with full-text search
CREATE OR REPLACE FUNCTION search_conversations(
    search_query TEXT,
    user_uuid UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    model_name TEXT,
    is_favorite BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.title,
        c.description,
        c.model_name,
        c.is_favorite,
        c.created_at,
        c.updated_at,
        ts_rank(
            to_tsvector('english', c.title || ' ' || COALESCE(c.description, '') || ' ' || c.original_prompt_content),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM conversations c
    WHERE
        (user_uuid IS NULL OR c.user_id = user_uuid)
        AND c.status = 'active'
        AND to_tsvector('english', c.title || ' ' || COALESCE(c.description, '') || ' ' || c.original_prompt_content)
            @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, c.updated_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function for getting conversation statistics
CREATE OR REPLACE FUNCTION get_conversation_stats(user_uuid UUID)
RETURNS TABLE (
    total_conversations BIGINT,
    favorite_conversations BIGINT,
    total_messages BIGINT,
    total_tokens BIGINT,
    total_cost DECIMAL(12, 6)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(c.id) as total_conversations,
        COUNT(c.id) FILTER (WHERE c.is_favorite = true) as favorite_conversations,
        SUM(COALESCE(message_stats.total_messages, 0))::BIGINT as total_messages,
        COALESCE(SUM(c.token_usage), 0) as total_tokens,
        COALESCE(SUM(c.estimated_cost), 0) as total_cost
    FROM conversations c
    LEFT JOIN (
        SELECT
            cm.conversation_id,
            COUNT(*) as total_messages
        FROM conversation_messages cm
        JOIN conversations c_inner ON cm.conversation_id = c_inner.id
        WHERE c_inner.user_id = user_uuid
        GROUP BY cm.conversation_id
    ) message_stats ON c.id = message_stats.conversation_id
    WHERE c.user_id = user_uuid AND c.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_messages TO authenticated;
GRANT SELECT, INSERT, DELETE ON conversation_tags TO authenticated;
GRANT EXECUTE ON FUNCTION search_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_stats TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column TO authenticated;

-- Grant usage on UUID generation function
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO authenticated;