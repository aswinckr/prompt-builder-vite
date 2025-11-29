import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { AIPromptInput } from "./AIPromptInput";
import { ConversationMessageService } from '../services/conversationMessageService';
import {
  X,
  Square,
  Copy,
  RotateCcw,
  Save,
  Loader2,
  AlertCircle,
  Send,
  Star,
  MessageSquare,
} from "lucide-react";
import { generateUUID } from "../utils/chat";
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { useLibraryActions } from "../contexts/LibraryContext";
import { useToast } from "../contexts/ToastContext";
import { ConversationMessage } from "../types/Conversation";

interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
  tokenCount?: number;
}

interface ChatInterfaceProps {
  formattedPrompt: string;
  selectedModel: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatInterface({
  formattedPrompt,
  selectedModel,
  isOpen,
  onClose,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStreamingStarted, setHasStreamingStarted] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);
  const [executionStartTime, setExecutionStartTime] = useState<number>(Date.now());

  const { createConversation, createConversationMessage, updateConversation } = useLibraryActions();
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize OpenRouter client
  const openrouter = createOpenRouter({
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  });

  // Map model names to provider format
  const modelMap: Record<string, string> = {
    "gemini-3-pro": "google/gemini-3-pro-preview",
    "gemini-2.5-flash": "google/gemini-2.5-flash-preview-09-2025",
    "gemini-2.5-flash-lite": "google/gemini-2.5-flash-lite-preview-09-2025",
    "claude-sonnet": "anthropic/claude-3-sonnet",
    "claude-haiku": "anthropic/claude-3-haiku-20240307",
    "claude-opus": "anthropic/claude-3-opus-20240229",
    "gpt-4o": "openai/gpt-4o-2024-08-06",
    "gpt-4o-mini": "openai/gpt-4o-mini",
  };

  // Create conversation when first message is about to be sent
  const createNewConversation = async () => {
    try {
      const title = formattedPrompt.length > 50
        ? `${formattedPrompt.substring(0, 50)}...`
        : formattedPrompt;

      const result = await createConversation({
        title,
        model_name: selectedModel,
        model_provider: 'openrouter',
        original_prompt_content: formattedPrompt,
        metadata: {
          started_at: new Date().toISOString(),
          interface: 'chat_interface'
        }
      });

      if (result.data) {
        setConversationId(result.data.id);
        setConversationTitle(title);
        return result.data.id;
      }
    } catch (error) {
      showToast('Failed to save conversation', 'error');
    }
    return null;
  };

  // Save a message to the database
  const saveMessage = async (conversationId: string, messageData: Omit<ConversationMessage, 'id' | 'conversation_id' | 'created_at' | 'updated_at' | 'message_order'>) => {
    try {
      // Let the ConversationMessageService handle message_order automatically
      await createConversationMessage({
        conversation_id: conversationId,
        ...messageData
        // message_order is omitted - will be auto-calculated by the service
      });
    } catch (error) {
      showToast('Failed to save message to conversation', 'error');
    }
  };

  // Update conversation with execution statistics
  const updateConversationStats = async (conversationId: string, usageData?: any) => {
    try {
      const executionDuration = Date.now() - executionStartTime;

      // Use accurate token counts from API if available, otherwise calculate from message database
      let totalTokens;
      if (usageData && usageData.totalTokens) {
        totalTokens = usageData.totalTokens;
      } else {
        // Fallback: Calculate from actual message token counts in database
        // This is more accurate than local message estimates
        try {
          const messageResult = await ConversationMessageService.getMessagesByConversationId(conversationId);
          if (messageResult.data) {
            totalTokens = messageResult.data.reduce((sum, msg) => sum + (msg.token_count || 0), 0);
          } else {
            // Final fallback: use local message estimates
            totalTokens = messages.reduce((sum, msg) => sum + (msg.tokenCount || 0), 0);
          }
        } catch (error) {
          totalTokens = messages.reduce((sum, msg) => sum + (msg.tokenCount || 0), 0);
        }
      }

      // Estimate cost (more accurate with real token data)
      const costPerToken = selectedModel.includes('gpt-4') ? 0.00003 :
                          selectedModel.includes('claude') ? 0.000015 :
                          selectedModel.includes('gemini') ? 0.00001 : 0.00002;

      const estimatedCost = totalTokens * costPerToken;

      const result = await updateConversation(conversationId, {
        token_usage: totalTokens,
        execution_duration_ms: executionDuration,
        estimated_cost: estimatedCost,
        metadata: {
          completed_at: new Date().toISOString(),
          message_count: messages.length,
          ...(usageData && {
            prompt_tokens: usageData.promptTokens,
            completion_tokens: usageData.completionTokens,
            model_provided_usage: true
          })
        }
      });
    } catch (error) {
      // Error handled silently - conversation stats update is non-critical
    }
  };

  // Initialize with the prompt and automatically send the first message
  useEffect(() => {
    if (formattedPrompt && messages.length === 0 && isOpen) {
      // Auto-create conversation when chat opens
      setTimeout(() => {
        handleFirstResponse();
      }, 500);
    }
  }, [formattedPrompt, isOpen]);

  const handleFirstResponse = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setHasStreamingStarted(false);
      setExecutionStartTime(Date.now());

      // Create conversation for this chat session
      const convId = await createNewConversation();

      // Prepare messages with context
      const conversationMessages = [
        {
          role: "user" as const,
          content: formattedPrompt,
        },
      ];

      // Add the user message to the UI
      const userMessage: ChatMessageData = {
        id: generateUUID(),
        role: "user",
        content: formattedPrompt,
        createdAt: new Date(),
      };
      setMessages([userMessage]);

      // Save user message to database
      if (convId) {
        await saveMessage(convId, {
          role: 'user',
          content: formattedPrompt,
          token_count: Math.round(formattedPrompt.length / 4), // Rough estimation - will be updated after API response
          metadata: {}
        });
      }

      const controller = new AbortController();
      setAbortController(controller);

      const mappedModel = modelMap[selectedModel] || selectedModel;

      const result = await streamText({
        model: openrouter(mappedModel),
        messages: conversationMessages,
        temperature: 0.7,
        abortSignal: controller.signal,
      });

      let accumulatedContent = "";
      const assistantId = generateUUID();
      let usageData = null;

      for await (const delta of result.textStream) {
        if (controller.signal.aborted) {
          break;
        }
        accumulatedContent += delta;

        // Add the assistant message only when we have content, or update existing one
        setMessages((prev) => {
          const existingMessage = prev.find((msg) => msg.id === assistantId);
          if (existingMessage) {
            // Update existing message
            return prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: accumulatedContent }
                : msg
            );
          } else {
            // Add new message with first content and set streaming started
            setHasStreamingStarted(true);
            return [
              ...prev,
              {
                id: assistantId,
                role: "assistant",
                content: accumulatedContent,
                createdAt: new Date(),
              },
            ];
          }
        });
      }

      // Capture usage data after streaming is complete
      try {
        // In Vercel AI SDK v5, usage might be a promise or direct property
        usageData = await Promise.resolve(result.usage);
      } catch (error) {
        usageData = null;
      }

      if (!controller.signal.aborted && convId) {
        // Save final assistant message to database
        await saveMessage(convId, {
          role: 'assistant',
          content: accumulatedContent,
          token_count: (usageData as any)?.completionTokens || Math.round(accumulatedContent.length / 4), // Use API data or fallback
          metadata: usageData ? {
            prompt_tokens: (usageData as any).promptTokens,
            completion_tokens: (usageData as any).completionTokens,
            total_tokens: (usageData as any).totalTokens
          } : {}
        });

        // Update user message token count with accurate API data
        if (usageData && (usageData as any).promptTokens) {
          try {
            await ConversationMessageService.updateUserMessageTokens(
              convId,
              (usageData as any).promptTokens
            );

            // Update the UI to reflect accurate token counts
            setMessages(prev => {
              const userMessages = prev.filter(m => m.role === 'user');
              const lastUserMessage = userMessages[userMessages.length - 1];

              return prev.map(msg => {
                if (msg.role === 'user' && lastUserMessage && msg.id === lastUserMessage.id) {
                  return {
                    ...msg,
                    tokenCount: (usageData as any).promptTokens
                  };
                }
                return msg;
              });
            });
          } catch (error) {
            // Silently handle the error - user message token update is non-critical
            console.warn('Failed to update user message token count:', error);
          }
        }

        // Update conversation statistics
        await updateConversationStats(convId, usageData);
      }
    } catch (error: any) {
      setError(error.message || "Failed to generate response");
    } finally {
      setIsLoading(false);
      setHasStreamingStarted(false);
      setAbortController(null);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !conversationId) return;

    const userMessage: ChatMessageData = {
      id: generateUUID(),
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);
    setHasStreamingStarted(false);

    try {
      // Save user message to database
      await saveMessage(conversationId, {
        role: 'user',
        content: userMessage.content,
        token_count: Math.round(userMessage.content.length / 4), // Rough estimation - will be updated after API response
        metadata: {}
      });

      // Prepare messages with context
      let conversationMessages = messages.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }));

      // Add the new user message
      conversationMessages.push({
        role: "user" as const,
        content: userMessage.content,
      });

      const controller = new AbortController();
      setAbortController(controller);

      const mappedModel = modelMap[selectedModel] || selectedModel;

      const result = await streamText({
        model: openrouter(mappedModel),
        messages: conversationMessages,
        temperature: 0.7,
        abortSignal: controller.signal,
      });

      let accumulatedContent = "";
      const assistantId = generateUUID();
      let usageData = null;

      for await (const delta of result.textStream) {
        if (controller.signal.aborted) {
          break;
        }
        accumulatedContent += delta;

        // Add the assistant message only when we have content, or update existing one
        setMessages((prev) => {
          const existingMessage = prev.find((msg) => msg.id === assistantId);
          if (existingMessage) {
            // Update existing message
            return prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: accumulatedContent }
                : msg
            );
          } else {
            // Add new message with first content and set streaming started
            setHasStreamingStarted(true);
            return [
              ...prev,
              {
                id: assistantId,
                role: "assistant",
                content: accumulatedContent,
                createdAt: new Date(),
              },
            ];
          }
        });
      }

      // Capture usage data after streaming is complete
      try {
        // In Vercel AI SDK v5, usage might be a promise or direct property
        usageData = await Promise.resolve(result.usage);
      } catch (error) {
        usageData = null;
      }

      if (!controller.signal.aborted) {
        // Save final assistant message to database
        await saveMessage(conversationId, {
          role: 'assistant',
          content: accumulatedContent,
          token_count: (usageData as any)?.completionTokens || Math.round(accumulatedContent.length / 4), // Use API data or fallback
          metadata: usageData ? {
            prompt_tokens: (usageData as any).promptTokens,
            completion_tokens: (usageData as any).completionTokens,
            total_tokens: (usageData as any).totalTokens
          } : {}
        });

        // Update user message token count with accurate API data
        if (usageData && (usageData as any).promptTokens) {
          try {
            await ConversationMessageService.updateUserMessageTokens(
              conversationId,
              (usageData as any).promptTokens
            );
          } catch (error) {
            // Silently handle the error - user message token update is non-critical
          }
        }

        // Update conversation statistics
        await updateConversationStats(conversationId, usageData);
      }
    } catch (error: any) {
      setError(error.message || "Failed to generate response");

      // Remove the empty assistant message if error occurred
      setMessages((prev) => prev.filter((msg) => msg.content !== ""));
    } finally {
      setIsLoading(false);
      setHasStreamingStarted(false);
      setAbortController(null);
    }
  };

  const stop = () => {
    if (abortController) {
      abortController.abort();
    }
    setIsLoading(false);
    setAbortController(null);
  };

  const reload = async () => {
    if (messages.length === 0) return;

    // Remove the last assistant message and regenerate
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "assistant") {
      setMessages((prev) => prev.slice(0, -1));

      // Trigger regeneration by resubmitting the user's last message
      const userMessages = messages.filter((msg) => msg.role === "user");
      if (userMessages.length > 0) {
        const lastUserMessage = userMessages[userMessages.length - 1];
        setInput(lastUserMessage.content);
        // Use setTimeout to avoid React state conflicts
        setTimeout(() => {
          const formEvent = new Event("submit", { cancelable: true }) as any;
          formEvent.preventDefault = () => {};
          handleSubmit(formEvent);
        }, 100);
      }
    }
  };

  const handleCopy = async () => {
    try {
      const textToCopy = messages
        .filter((msg) => msg.role === "assistant")
        .map((msg) => msg.content)
        .join("\n\n");

      await navigator.clipboard.writeText(textToCopy);
      showToast('Conversation copied to clipboard', 'success');
    } catch (error) {
      showToast('Failed to copy conversation', 'error');
    }
  };

  const handleToggleFavorite = async () => {
    if (!conversationId) return;

    try {
      // This would integrate with the toggle conversation favorite action
      showToast('Toggle favorite feature coming soon', 'info');
    } catch (error) {
      showToast('Failed to update favorite status', 'error');
    }
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      reload();
    }
  };

  const handleClose = () => {
    if (isLoading) {
      stop();
    }

    // Update conversation stats before closing if we have a conversation
    if (conversationId) {
      updateConversationStats(conversationId);
    }

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const content = (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Side panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full transform flex-col bg-neutral-900 text-neutral-100 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-panel-title"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-800/30 p-4">
          <div className="flex items-center gap-3">
            <h2 id="chat-panel-title" className="text-lg font-medium truncate">
              {conversationTitle || 'AI Chat'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Control buttons */}
            {isLoading ? (
              <button
                onClick={stop}
                className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                aria-label="Stop generation"
              >
                <Square className="h-4 w-4" />
              </button>
            ) : (
              messages.length > 0 && (
                <button
                  onClick={handleRetry}
                  className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-purple-500/20"
                  aria-label="Regenerate last response"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )
            )}

            {messages.length > 0 && (
              <>
                <button
                  onClick={handleCopy}
                  className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-purple-500/20"
                  aria-label="Copy conversation"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {conversationId && (
                  <button
                    onClick={handleToggleFavorite}
                    className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-purple-500/20"
                    aria-label="Toggle favorite"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
              </>
            )}

            <button
              onClick={handleClose}
              className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-purple-500/20"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="mx-auto max-w-3xl px-8">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && !hasStreamingStarted && <TypingIndicator />}

            {/* Empty state */}
            {messages.length === 0 && !isLoading && (
              <div className="py-8 text-center text-neutral-500">
                <div className="mb-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800/50">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                </div>
                <p className="text-sm">Initializing conversation...</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input form */}
        <div className="border-t border-purple-800/30 p-4">
          <div className="mx-auto max-w-3xl">
            <AIPromptInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={isLoading || !conversationId}
              isLoading={isLoading}
              placeholder="Type your message..."
              minHeight={48}
              maxHeight={164}
            />
            {!conversationId && !isLoading && (
              <p className="text-xs text-neutral-500 mt-2 text-center">
                Conversation will be saved automatically
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}