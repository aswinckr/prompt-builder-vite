import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { AIPromptInput } from "./AIPromptInput";
import {
  X,
  Square,
  Copy,
  RotateCcw,
  Save,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react";
import { generateUUID } from "../utils/chat";
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface ChatInterfaceProps {
  formattedPrompt: string;
  selectedModel: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (conversation: any) => void;
}

export function ChatInterface({
  formattedPrompt,
  selectedModel,
  isOpen,
  onClose,
  onSave,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStreamingStarted, setHasStreamingStarted] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

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

  // Initialize with the prompt and automatically send the first message
  useEffect(() => {
    if (formattedPrompt && messages.length === 0 && isOpen) {
      // Automatically trigger the first AI response
      setTimeout(() => {
        handleFirstResponse();
      }, 500);
    }
  }, [formattedPrompt, isOpen]);

  const handleFirstResponse = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setHasStreamingStarted(false); // Reset streaming state

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

      if (!controller.signal.aborted) {
        // Final update to ensure the message is complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      }
    } catch (error: any) {
      console.error("Initial chat error:", error);
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
    if (!input.trim() || isLoading) return;

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
    setHasStreamingStarted(false); // Reset streaming state

    try {
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

      if (!controller.signal.aborted) {
        // Final update to ensure the message is complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      }
    } catch (error: any) {
      console.error("Chat error:", error);
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
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleSave = () => {
    const conversationData = {
      id: generateUUID(),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt || new Date(),
      })),
      model: selectedModel,
      context: formattedPrompt,
      timestamp: new Date().toISOString(),
    };

    onSave(conversationData);
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
        className={`fixed right-0 top-0 z-50 flex h-full w-full transform flex-col bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-neutral-100 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-panel-title"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/50 p-4">
          <h2 id="chat-panel-title" className="text-lg font-medium">
            AI Chat
          </h2>
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
                  className="rounded-lg bg-blue-500/10 p-2 text-blue-400 transition-colors hover:bg-blue-500/20"
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
                  className="rounded-lg bg-neutral-800/50 p-2 text-neutral-400 transition-colors hover:bg-neutral-800/70"
                  aria-label="Copy conversation"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-green-500/10 p-2 text-green-400 transition-colors hover:bg-green-500/20"
                  aria-label="Save conversation"
                >
                  <Save className="h-4 w-4" />
                </button>
              </>
            )}

            <button
              onClick={handleClose}
              className="rounded-lg bg-neutral-800/50 p-2 text-neutral-400 transition-colors hover:bg-neutral-800/70"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status indicator */}
        <div className="border-b border-neutral-800/30 px-4 py-2">
          {error && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {isLoading && !error && (
            <div className="flex items-center gap-2 text-green-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
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
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input form */}
        <div className="border-t border-neutral-800/50 p-4">
          <div className="mx-auto max-w-3xl">
            <AIPromptInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={isLoading}
              isLoading={isLoading}
              placeholder="Type your message..."
              minHeight={48}
              maxHeight={164}
            />
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
