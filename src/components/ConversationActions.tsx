import React, { useState } from 'react';
import { Star, StarOff, Trash2, Copy, Download, RotateCcw, ExternalLink } from 'lucide-react';
import { Conversation } from '../types/Conversation';
import { useLibraryActions } from '../contexts/LibraryContext';
import { useToast } from '../contexts/ToastContext';
import { formatDistanceToNow } from 'date-fns';
import { Modal } from './Modal';
import { ConfirmationModal } from './ConfirmationModal';

interface ConversationActionsProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationActions({ conversation, isOpen, onClose }: ConversationActionsProps) {
  const { toggleConversationFavorite, deleteConversation } = useLibraryActions();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteConversation(conversation.id);
      showToast('Conversation deleted successfully', 'success');
      setShowDeleteConfirmation(false);
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

  
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Conversation Actions"
      size="md"
      mobileBehavior="modal"
      aria-labelledby="conversation-actions-title"
    >
      {/* Conversation Info */}
      <div className="mb-6">
        <div className="bg-neutral-900/50 rounded-lg p-4 space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Title:</span>
            <span className="text-white font-medium">{conversation.title}</span>
          </div>
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
      <div className="space-y-2">
        {/* Primary Actions */}
        <div className="grid grid-cols-1 gap-2">
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
            onClick={handleCopyConversationLink}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Copy Link
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${conversation.title}"? This action cannot be undone and will permanently remove all messages.`}
        confirmText="Delete Conversation"
        cancelText="Cancel"
        type="delete"
        isLoading={isDeleting}
      />
    </Modal>
  );
}