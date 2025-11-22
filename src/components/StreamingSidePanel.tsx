import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Square, Copy, RotateCcw, Save, Loader2, AlertCircle } from 'lucide-react';
import { useLibraryState, useLibraryActions, StreamingMessage } from '../contexts/LibraryContext';
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

interface StreamingSidePanelProps {
  formattedPrompt: string;
}

export function StreamingSidePanel({ formattedPrompt }: StreamingSidePanelProps) {
  const { streaming } = useLibraryState();
  const {
    setStreamingPanelOpen,
    updateStreamingContent,
    setStreamingStatus,
    addConversationMessage,
    clearConversationHistory,
    setStreamingError,
    setAbortController,
    stopStreaming,
    setSelectedModel
  } = useLibraryActions();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const openrouter = createOpenRouter({
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [streaming.streamingContent, streaming.conversationHistory]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleStartStreaming = async () => {
    try {
      // Clear previous content and status
      updateStreamingContent('');
      setStreamingStatus('connecting');
      clearConversationHistory();

      // Add user message to conversation
      const userMessage: StreamingMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: formattedPrompt,
        timestamp: new Date()
      };
      addConversationMessage(userMessage);

      // Create abort controller
      const abortController = new AbortController();
      setAbortController(abortController);

      // Map model names to provider format
      const modelMap: Record<string, string> = {
        'gemini-3-pro': 'google/gemini-3-pro-preview',
        'gemini-2.5-flash': 'google/gemini-2.5-flash-preview-09-2025',
        'gemini-2.5-flash-lite': 'google/gemini-2.5-flash-lite-preview-09-2025',
        'claude-sonnet': 'anthropic/claude-3-sonnet',
        'claude-haiku': 'anthropic/claude-3-haiku-20240307',
        'claude-opus': 'anthropic/claude-3-opus-20240229',
        'gpt-4o': 'openai/gpt-4o-2024-08-06',
        'gpt-4o-mini': 'openai/gpt-4o-mini'
      };

      const selectedModel = modelMap[streaming.selectedModel] || streaming.selectedModel;

      // Start streaming
      setStreamingStatus('streaming');
      setIsTyping(true);

      const result = await streamText({
        model: openrouter(selectedModel),
        messages: [
          {
            role: 'user',
            content: formattedPrompt
          }
        ],
        abortSignal: abortController.signal,
      });

      let accumulatedContent = '';

      for await (const delta of result.textStream) {
        if (abortController.signal.aborted) {
          break;
        }
        accumulatedContent += delta;
        updateStreamingContent(accumulatedContent);
      }

      if (!abortController.signal.aborted) {
        // Add assistant message to conversation
        const assistantMessage: StreamingMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: accumulatedContent,
          timestamp: new Date()
        };
        addConversationMessage(assistantMessage);

        setStreamingStatus('idle');
      }

      setIsTyping(false);
      setAbortController(undefined);

    } catch (error: any) {
      setIsTyping(false);
      setAbortController(undefined);

      if (error.name === 'AbortError') {
        setStreamingStatus('stopped');
      } else {
        console.error('Streaming error:', error);
        setStreamingError(error.message || 'Failed to connect to AI service');
      }
    }
  };

  const handleStop = () => {
    stopStreaming();
    setIsTyping(false);
  };

  const handleClose = () => {
    if (streaming.streamingStatus === 'streaming') {
      handleStop();
    }
    setStreamingPanelOpen(false);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = streaming.streamingContent ||
        streaming.conversationHistory
          .filter(msg => msg.role === 'assistant')
          .map(msg => msg.content)
          .join('\n\n');

      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleRetry = () => {
    handleStartStreaming();
  };

  const handleSave = () => {
    // In a real implementation, this would save to your backend
    const conversationData = {
      prompt: formattedPrompt,
      response: streaming.streamingContent,
      model: streaming.selectedModel,
      timestamp: new Date().toISOString(),
      conversationHistory: streaming.conversationHistory
    };

    console.log('Saving conversation:', conversationData);
    // You could call an API here to save the conversation
    alert('Conversation saved successfully!');
  };

  // Auto-start streaming when panel opens
  useEffect(() => {
    if (streaming.isStreamingPanelOpen && streaming.streamingStatus === 'idle' && !streaming.streamingContent) {
      handleStartStreaming();
    }
  }, [streaming.isStreamingPanelOpen]);

  const renderStreamingStatus = () => {
    switch (streaming.streamingStatus) {
      case 'connecting':
        return (
          <div className="flex items-center gap-2 text-yellow-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Connecting to AI...</span>
          </div>
        );
      case 'streaming':
        return (
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Streaming response...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Error: {streaming.errorMessage}</span>
          </div>
        );
      case 'stopped':
        return (
          <div className="flex items-center gap-2 text-orange-400">
            <Square className="w-4 h-4" />
            <span className="text-sm">Streaming stopped</span>
          </div>
        );
      default:
        return null;
    }
  };

  const content = (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Side panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-2/5 lg:w-2/5 xl:w-2/5 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-neutral-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          streaming.isStreamingPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="streaming-panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800/50">
          <h2 id="streaming-panel-title" className="text-lg font-medium">
            AI Response
          </h2>
          <div className="flex items-center gap-2">
            {/* Control buttons */}
            {streaming.streamingStatus === 'streaming' ? (
              <button
                onClick={handleStop}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                aria-label="Stop streaming"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              streaming.streamingStatus === 'error' && (
                <button
                  onClick={handleRetry}
                  className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                  aria-label="Retry"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )
            )}

            {(streaming.streamingContent || streaming.conversationHistory.length > 0) && (
              <>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800/70 transition-colors"
                  aria-label="Copy response"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                  aria-label="Save conversation"
                >
                  <Save className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800/70 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status indicator */}
        <div className="px-4 py-2 border-b border-neutral-800/30">
          {renderStreamingStatus()}
        </div>

        {/* Content area */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ height: 'calc(100% - 120px)' }}
        >
          {/* Show conversation history */}
          {streaming.conversationHistory.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`text-xs font-medium ${
                message.role === 'user' ? 'text-blue-400' : 'text-green-400'
              }`}>
                {message.role === 'user' ? 'You' : 'AI Assistant'}
                <span className="ml-2 text-neutral-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={`p-3 rounded-lg whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-blue-500/5 border border-blue-500/20'
                  : 'bg-neutral-800/30 border border-neutral-700/30'
              }`}>
                {message.content}
              </div>
            </div>
          ))}

          {/* Show current streaming content */}
          {streaming.streamingContent && streaming.streamingStatus === 'streaming' && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-green-400">
                AI Assistant
                <span className="ml-2 text-neutral-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/30 whitespace-pre-wrap">
                {streaming.streamingContent}
                {isTyping && <span className="inline-block w-2 h-4 bg-neutral-400 animate-pulse ml-1"></span>}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!streaming.streamingContent && streaming.conversationHistory.length === 0 &&
           streaming.streamingStatus !== 'connecting' && (
            <div className="text-center text-neutral-500 py-8">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-neutral-800/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <p>Preparing your AI response...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}