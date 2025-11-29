import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Trash2, Copy, Download, RotateCcw, Clock, Cpu, TrendingUp, Calendar, Tag, User, Bot } from 'lucide-react';
import { Conversation, ConversationMessage } from '../types/Conversation';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { ConversationMessageService } from '../services/conversationMessageService';
import { ConfirmationModal } from './ConfirmationModal';
import { useToast } from '../contexts/ToastContext';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage } from './ChatMessage';
import { AIPromptInput } from './AIPromptInput';

export function ConversationDetail() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { conversations, loading } = useLibraryState();
  const {
    deleteConversation,
    updateConversation
  } = useLibraryActions();

  // Find the current conversation from the conversations array
  const conversation = conversationId ? conversations.find(c => c.id === conversationId) : null;
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [continuationInput, setContinuationInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) return;

      setMessagesLoading(true);
      setMessagesError(null);

      try {
        const result = await ConversationMessageService.getMessagesByConversationId(conversationId);

        if (result.error) {
          setMessagesError(result.error);
          console.error('Failed to load messages:', result.error);
        } else if (result.data) {
          setMessages(result.data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
        setMessagesError(errorMessage);
        console.error('Error loading messages:', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-900">
        <div className="flex items-center gap-3 text-neutral-400">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-600 border-t-blue-500"></div>
          Loading conversation...
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Conversation not found</h2>
          <p className="text-neutral-400 mb-4">The conversation you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/prompt')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back
          </button>
          </div>
      </div>
    );
  }

  const handleToggleFavorite = async () => {
    try {
      await updateConversation(conversation.id, { is_favorite: !conversation.is_favorite });
      showToast(conversation.is_favorite ? 'Removed from favorites' : 'Added to favorites', 'success');
    } catch (error) {
      showToast('Failed to update favorite status', 'error');
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteConversation(conversation.id);
      showToast('Conversation deleted', 'success');
      navigate('/history');
    } catch (error) {
      showToast('Failed to delete conversation', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleCopyConversation = async () => {
    try {
      const conversationText = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}:\n${msg.content}`)
        .join('\n\n');

      await navigator.clipboard.writeText(conversationText);
      setIsCopied(true);
      showToast('Conversation copied to clipboard', 'success');

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      showToast('Failed to copy conversation', 'error');
    }
  };

  const handleExportConversation = () => {
    const conversationData = {
      conversation: {
        id: conversation.id,
        title: conversation.title,
        description: conversation.description,
        model_name: conversation.model_name,
        model_provider: conversation.model_provider,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        metadata: conversation.metadata
      },
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at,
        metadata: msg.metadata
      }))
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversation.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Conversation exported', 'success');
  };

  const handleContinueConversation = async () => {
    if (!continuationInput.trim()) return;

    setIsContinuing(true);
    try {
      // This would integrate with the ChatInterface for continuation
      // For now, we'll just show a message
      showToast('Conversation continuation feature coming soon', 'info');
      setContinuationInput('');
    } catch (error) {
      showToast('Failed to continue conversation', 'error');
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-900">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm">
        <div className="p-6">
          {/* Back Navigation */}
          <Link
            to="/prompt"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          {/* Title and Actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white truncate">{conversation.title}</h1>
                {conversation.is_favorite && (
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                  conversation.status === 'active'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-neutral-700/50 text-neutral-400'
                }`}>
                  {conversation.status}
                </span>
              </div>

              {conversation.description && (
                <p className="text-neutral-300">{conversation.description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-yellow-400 transition-colors"
                title={conversation.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-4 h-4 ${conversation.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>

              <button
                onClick={handleCopyConversation}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                title="Copy conversation"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportConversation}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                title="Export conversation"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-red-600/20 text-neutral-400 hover:text-red-400 transition-colors"
                title="Delete conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-neutral-400">
              <Cpu className="w-4 h-4" />
              <span>{conversation.model_name}</span>
            </div>

            <div className="flex items-center gap-2 text-neutral-400">
              <TrendingUp className="w-4 h-4" />
              <span>{conversation.token_usage.toLocaleString()} tokens</span>
            </div>

            <div className="flex items-center gap-2 text-neutral-400">
              <Clock className="w-4 h-4" />
              <span>{Math.round(conversation.execution_duration_ms / 1000)}s</span>
            </div>

            <div className="flex items-center gap-2 text-neutral-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}</span>
            </div>
          </div>

          {conversation.estimated_cost > 0.001 && (
            <div className="mt-2 text-sm text-neutral-400">
              Estimated cost: <span className="text-white">${conversation.estimated_cost.toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-3 text-neutral-400">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-600 border-t-blue-500"></div>
                Loading messages...
              </div>
            </div>
          ) : messagesError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Error loading messages</h3>
              <p className="text-neutral-400">{messagesError}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
              <p className="text-neutral-400">This conversation doesn't have any messages.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={message.id} className="flex gap-4">
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-green-500/10 text-green-400'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-neutral-100 whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>

                    {message.token_count > 0 && (
                      <div className="mt-2 text-xs text-neutral-500">
                        Tokens: {message.token_count}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Continuation Input */}
      <div className="border-t border-neutral-800 p-6 bg-neutral-900/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="mb-2">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Continue Conversation
            </h3>
            <p className="text-xs text-neutral-500">Send a message to continue this conversation</p>
          </div>

          <AIPromptInput
            value={continuationInput}
            onChange={setContinuationInput}
            onSubmit={handleContinueConversation}
            disabled={isContinuing}
            isLoading={isContinuing}
            placeholder="Type your message to continue..."
            minHeight={60}
            maxHeight={120}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Conversation"
        message={`Are you sure you want to delete '${conversation.title}'? This action cannot be undone and will permanently remove all messages in this conversation.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        isLoading={isDeleting}
      />
    </div>
  );
}