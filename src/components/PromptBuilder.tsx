import React, { useState, useMemo } from 'react';
import { Play, ChevronDown, User, MessageCircle } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CustomTextInput } from './CustomTextInput';
import { PromptBuilderBlockList } from './PromptBuilderBlockList';
import { PromptBuilderActions } from './PromptBuilderActions';
import { StreamingSidePanel } from './StreamingSidePanel';
import { ChatInterface } from './ChatInterface';
import { ProfileModal } from './ProfileModal';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { useAuthState } from '../contexts/AuthContext';

export function PromptBuilder() {
  const { promptBuilder, streaming, contextBlocks } = useLibraryState();
  const { user, isAuthenticated, isLoading } = useAuthState();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [executionMode, setExecutionMode] = useState<'stream' | 'chat'>('stream');

  const {
    setCustomText,
    setStreamingPanelOpen,
    setChatPanelOpen,
    setSelectedModel
  } = useLibraryActions();

  // Assemble the full prompt from blocks and custom text
  const assembledPrompt = useMemo(() => {
    const blocks = promptBuilder.blockOrder
      .map(blockId => contextBlocks.find(block => block.id === blockId))
      .filter((block): block is NonNullable<typeof block> => block !== undefined);

    const blockTexts = blocks.map(block => block.content);

    // Combine custom text and block contents
    const allTexts = [];
    if (promptBuilder.customText) {
      allTexts.push(promptBuilder.customText);
    }
    allTexts.push(...blockTexts);

    return allTexts.join('\n\n');
  }, [promptBuilder.blockOrder, promptBuilder.customText]);

  const handleRunPrompt = () => {
    // Format the prompt according to the specified structure
    const formattedPrompt = [
      "Help me with the following task:",
      "",
      promptBuilder.customText || "",
      "",
      "Context:",
      ""
    ];

    // Add all context blocks from the current context
    const blocks = promptBuilder.blockOrder
      .map(blockId => contextBlocks.find(block => block.id === blockId))
      .filter((block): block is NonNullable<typeof block> => block !== undefined);

    blocks.forEach(block => {
      formattedPrompt.push(block.content);
    });

    const finalPrompt = formattedPrompt.join('\n');

    console.log('=== FULL PROMPT ===');
    console.log(finalPrompt);
    console.log('==================');

    // Open the appropriate panel based on execution mode
    if (executionMode === 'chat') {
      setChatPanelOpen(true);
    } else {
      setStreamingPanelOpen(true);
    }
  };

  const handleSaveChat = (conversation: any) => {
    // For now, just log the conversation. In a real implementation,
    // you'd save this to your database or state
    console.log('Saving conversation:', conversation);
    alert('Chat conversation saved!');
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  // Available models - includes actual OpenRouter models
  const availableModels = [
    { value: 'gemini-3-pro', label: 'Gemini 3 Pro', group: 'Google' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', group: 'Google' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', group: 'Google' },
    { value: 'gpt-4o', label: 'GPT-4o', group: 'OpenAI' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', group: 'OpenAI' },
    { value: 'claude-sonnet', label: 'Claude 3 Sonnet', group: 'Anthropic' },
    { value: 'claude-haiku', label: 'Claude 3 Haiku', group: 'Anthropic' },
    { value: 'claude-opus', label: 'Claude 3 Opus', group: 'Anthropic' },
  ];

  // Group models by provider
  const groupedModels = availableModels.reduce((acc, model) => {
    if (!acc[model.group]) {
      acc[model.group] = [];
    }
    acc[model.group].push(model);
    return acc;
  }, {} as Record<string, typeof availableModels>);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-neutral-100">
        {/* Header with Model Selector and Actions */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800/50 backdrop-blur-sm">
          {/* Left side - Model Selector */}
          <div className="relative">
            <select
              className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl px-4 py-2 text-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-neutral-800/70 min-w-[160px]"
              value={streaming.selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
            >
              {Object.entries(groupedModels).map(([group, models]) => (
                <optgroup key={group} label={group}>
                  {models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          {/* Right side - Execution Mode, Prompt Actions and Run Button */}
          <div className="flex items-center gap-3">
            {/* Execution Mode Selector */}
            <div className="relative">
              <select
                value={executionMode}
                onChange={(e) => setExecutionMode(e.target.value as 'stream' | 'chat')}
                className="appearance-none bg-neutral-800/50 border border-neutral-700/30 text-neutral-100 px-3 py-2 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-200 cursor-pointer"
              >
                <option value="stream">Stream</option>
                <option value="chat">Chat</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>

            {/* Prompt Builder Actions */}
            <PromptBuilderActions />

            {/* Run Prompt Button */}
            <button
              onClick={handleRunPrompt}
              disabled={!promptBuilder.customText && promptBuilder.blockOrder.length === 0}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              aria-label={`Run prompt with ${executionMode} mode`}
            >
              {executionMode === 'chat' ? (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Chat with Prompt
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Prompt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content - ChatGPT-style Centered Layout */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Profile Circle - Bottom Left */}
          <div className="fixed bottom-6 left-6 z-50">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsProfileModalOpen(true);
                }
              }}
              className="w-10 h-10 rounded-full bg-neutral-700 hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 overflow-hidden shadow-lg flex items-center justify-center"
              aria-label="Open profile menu"
            >
              {isLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-neutral-400 border-t-white"></div>
              ) : isAuthenticated && user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to user initial if avatar fails to load
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-sm font-medium text-neutral-300 flex items-center justify-center w-full h-full">${user?.email?.charAt(0).toUpperCase() || 'U'}</span>`;
                    }
                  }}
                />
              ) : isAuthenticated && user?.email ? (
                <span className="text-sm font-medium text-neutral-300">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User
                  size={18}
                  className="text-neutral-300"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="w-full max-w-3xl mx-auto space-y-6 min-h-full flex flex-col justify-center">
              {/* Title - Like Claude/ChatGPT branding */}
              <div className="text-center">
                <h1 className="text-4xl lg:text-6xl font-medium text-neutral-100 mb-4"
                    style={{ fontFamily: '"Libra Baskerville", Georgia, serif' }}>
                  Time to cook, <span className="italic">Ash</span>
                </h1>
              </div>

              {/* Centered Main Input Area */}
              <div className="relative">
                <CustomTextInput />
              </div>

              {/* Context Blocks - Displayed below input as cards */}
              <PromptBuilderBlockList />
            </div>
          </div>
        </div>

        {/* Streaming Side Panel */}
        {streaming.isStreamingPanelOpen && (
          <StreamingSidePanel formattedPrompt={assembledPrompt} />
        )}

        {/* Chat Interface */}
        {streaming.isChatPanelOpen && (
          <ChatInterface
            formattedPrompt={assembledPrompt}
            selectedModel={streaming.selectedModel}
            isOpen={streaming.isChatPanelOpen}
            onClose={() => setChatPanelOpen(false)}
            onSave={handleSaveChat}
          />
        )}

        {/* Profile Modal */}
        {isProfileModalOpen && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}