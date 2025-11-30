import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Trash2,
  Copy,
  Download,
  Clock,
  Cpu,
  TrendingUp,
  Calendar,
  Tag,
  Info,
} from "lucide-react";
import { Conversation, ConversationMessage } from "../types/Conversation";
import { useLibraryState, useLibraryActions } from "../contexts/LibraryContext";
import { ConversationMessageService } from "../services/conversationMessageService";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "../contexts/ToastContext";
import { formatDistanceToNow } from "date-fns";
import { ChatMessage } from "./ChatMessage";
import { markdownToText } from "../utils/markdownUtils";

export function ConversationDetail() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { conversations, loading } = useLibraryState();
  const { deleteConversation, updateConversation } = useLibraryActions();

  // Find the current conversation from the conversations array
  const conversation = conversationId
    ? conversations.find((c) => c.id === conversationId)
    : null;
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) return;

      setMessagesLoading(true);
      setMessagesError(null);

      try {
        const result =
          await ConversationMessageService.getMessagesByConversationId(
            conversationId
          );

        if (result.error) {
          setMessagesError(result.error);
          console.error("Failed to load messages:", result.error);
        } else if (result.data) {
          setMessages(result.data);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load messages";
        setMessagesError(errorMessage);
        console.error("Error loading messages:", error);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"></div>
          Loading conversation...
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Conversation not found
          </h2>
          <p className="mb-4 text-muted-foreground">
            The conversation you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <button
            onClick={() => navigate("/prompt")}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const handleToggleFavorite = async () => {
    try {
      await updateConversation(conversation.id, {
        is_favorite: !conversation.is_favorite,
      });
      showToast(
        conversation.is_favorite
          ? "Removed from favorites"
          : "Added to favorites",
        "success"
      );
    } catch (error) {
      showToast("Failed to update favorite status", "error");
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteConversation(conversation.id);
      showToast("Conversation deleted", "success");
      navigate("/history");
    } catch (error) {
      showToast("Failed to delete conversation", "error");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleCopyConversation = async () => {
    try {
      const conversationText = messages
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}:\n${msg.content}`
        )
        .join("\n\n");

      await navigator.clipboard.writeText(conversationText);
      setIsCopied(true);
      showToast("Conversation copied to clipboard", "success");

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      showToast("Failed to copy conversation", "error");
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
        metadata: conversation.metadata,
      },
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at,
        metadata: msg.metadata,
      })),
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${conversation.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Conversation exported", "success");
  };

  
  return (
    <div className="flex h-full flex-col bg-neutral-900">
      {/* Header */}
      <div className="border-b border-purple-800/30 bg-neutral-900">
        <div className="px-6 py-6">
          {/* Back Navigation */}
          <Link
            to="/prompt"
            className="mb-4 inline-flex items-center gap-2 text-purple-400 transition-colors hover:text-purple-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Title and Actions */}
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="truncate text-2xl font-bold text-white">
                  {markdownToText(conversation.title)}
                </h1>
                {conversation.is_favorite && (
                  <Star className="h-5 w-5 flex-shrink-0 fill-yellow-400 text-yellow-400" />
                )}
              </div>

              {conversation.description && (
                <p className="text-muted-foreground">
                  {conversation.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-purple-500/20 hover:text-yellow-400"
                title={
                  conversation.is_favorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Star
                  className={`h-4 w-4 ${
                    conversation.is_favorite
                      ? "fill-yellow-400 text-yellow-400"
                      : ""
                  }`}
                />
              </button>

              <button
                onClick={handleCopyConversation}
                className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-purple-500/20 hover:text-purple-300"
                title="Copy conversation"
              >
                <Copy className="h-4 w-4" />
              </button>

              <button
                onClick={handleExportConversation}
                className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-purple-500/20 hover:text-purple-300"
                title="Export conversation"
              >
                <Download className="h-4 w-4" />
              </button>

              <button
                onClick={() => setInfoModalOpen(true)}
                className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-purple-500/20 hover:text-purple-300"
                title="Conversation info"
              >
                <Info className="h-4 w-4" />
              </button>

              <button
                onClick={handleDeleteClick}
                className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                title="Delete conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
          {messagesLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"></div>
                Loading messages...
              </div>
            </div>
          ) : messagesError ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <Tag className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">
                Error loading messages
              </h3>
              <p className="text-muted-foreground">{messagesError}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Tag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">
                No messages yet
              </h3>
              <p className="text-muted-foreground">
                This conversation doesn't have any messages.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={{
                    id: message.id,
                    role: message.role as "user" | "assistant",
                    content: message.content,
                    createdAt: new Date(message.created_at),
                  }}
                />
              ))}
            </div>
          )}
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

      {/* Info Modal */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-md overflow-auto rounded-lg border border-purple-700/30 bg-neutral-900">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-purple-100">
                  Conversation Details
                </h2>
                <button
                  onClick={() => setInfoModalOpen(false)}
                  className="rounded-lg p-1 text-purple-400 hover:bg-purple-700/30 hover:text-purple-300"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-purple-700/30 bg-purple-900/10 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-100">
                      Model
                    </span>
                  </div>
                  <p className="text-base text-purple-200">
                    {conversation.model_name}
                  </p>
                </div>

                <div className="rounded-lg border border-purple-700/30 bg-purple-900/10 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-100">
                      Tokens
                    </span>
                  </div>
                  <p className="text-base text-purple-200">
                    {conversation.token_usage.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg border border-purple-700/30 bg-purple-900/10 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-100">
                      Duration
                    </span>
                  </div>
                  <p className="text-base text-purple-200">
                    {Math.round(conversation.execution_duration_ms / 1000)}s
                  </p>
                </div>

                <div className="rounded-lg border border-purple-700/30 bg-purple-900/10 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-100">
                      Created
                    </span>
                  </div>
                  <p className="text-base text-purple-200">
                    {formatDistanceToNow(new Date(conversation.updated_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {conversation.estimated_cost > 0.001 && (
                  <div className="rounded-lg border border-purple-700/30 bg-purple-900/10 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-100">
                        Estimated Cost
                      </span>
                    </div>
                    <p className="text-base text-purple-200">
                      ${conversation.estimated_cost.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
