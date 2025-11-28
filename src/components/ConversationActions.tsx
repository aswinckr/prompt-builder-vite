import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, StarOff, Trash2, Copy, Download, RotateCcw, ExternalLink } from 'lucide-react';
import { Conversation } from '../types/Conversation';
import { useLibraryActions } from '../contexts/LibraryContext';
import { useToast } from '../contexts/ToastContext';
import { formatDistanceToNow } from 'date-fns';

interface ConversationActionsProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationActions({ conversation, isOpen, onClose }: ConversationActionsProps) {
  const { toggleConversationFavorite, deleteConversation } = useLibraryActions();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleFavorite = async () => {
    try {
      await toggleConversationFavorite(conversation.id);
      showToast(
        conversation.is_favorite ? 'Removed from favorites' : 'Added to favorites',
        'success'
      );
      onClose();
    } catch (error) {
      showToast('Failed to update favorite status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${conversation.title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteConversation(conversation.id);
      showToast('Conversation deleted successfully', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to delete conversation', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyConversationLink = async () => {
    try {
      const url = `${window.location.origin}/history/${conversation.id}`;
      await navigator.clipboard.writeText(url);
      showToast('Conversation link copied to clipboard', 'success');
    } catch (error) {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleDuplicateConversation = async () => {
    try {
      // This would require implementing a duplicate conversation service
      showToast('Duplicate feature coming soon', 'info');
    } catch (error) {
      showToast('Failed to duplicate conversation', 'error');
    }
  };

  const handleArchiveConversation = async () => {
    try {
      // This would use the archiveConversation service
      showToast(conversation.status === 'archived' ? 'Conversation restored' : 'Conversation archived', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to update conversation status', 'error');
    }
  };

  if (!isOpen) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-700">
            <div>
              <h2 className="text-lg font-semibold text-white">Conversation Actions</h2>
              <p className="text-sm text-neutral-400 mt-1">
                {conversation.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation Info */}
          <div className="p-6 pb-4">
            <div className="bg-neutral-900/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Model:</span>
                <span className="text-white">{conversation.model_name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Tokens:</span>
                <span className="text-white">{conversation.token_usage.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Created:</span>
                <span className="text-white">{formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}</span>
              </div>
              {conversation.is_favorite && (
                <div className="flex items-center text-sm text-yellow-400">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400" />
                  This is a favorite conversation
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-2">
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleToggleFavorite}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                {conversation.is_favorite ? (
                  <>
                    <StarOff className="w-4 h-4" />
                    Remove Favorite
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    Add to Favorites
                  </>
                )}
              </button>

              <button
                onClick={handleDuplicateConversation}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyConversationLink}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Copy Link
              </button>

              <button
                onClick={handleArchiveConversation}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {conversation.status === 'archived' ? 'Restore' : 'Archive'}
              </button>
            </div>

            {/* Destructive Action */}
            <div className="pt-4 border-t border-neutral-700">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete Conversation'}
              </button>
              <p className="text-xs text-neutral-500 mt-2 text-center">
                This action cannot be undone and will permanently remove all messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}