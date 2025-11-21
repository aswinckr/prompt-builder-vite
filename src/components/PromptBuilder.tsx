import React, { useState, useMemo } from 'react';
import { Play, ChevronDown } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CustomTextInput } from './CustomTextInput';
import { PromptBuilderBlockList } from './PromptBuilderBlockList';
import { PromptBuilderActions } from './PromptBuilderActions';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { mockContextBlocks } from '../data/mockData';

export function PromptBuilder() {
  const { promptBuilder } = useLibraryState();
  const { setCustomText, setExecutionPanel } = useLibraryActions();

  // Assemble the full prompt from blocks and custom text
  const assembledPrompt = useMemo(() => {
    const blocks = promptBuilder.blockOrder
      .map(blockId => mockContextBlocks.find(block => block.id === blockId))
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
    setExecutionPanel(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-neutral-100">
        {/* Header with Model Selector and Actions */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800/50 backdrop-blur-sm">
          {/* Left side - Model Selector */}
          <div className="relative">
            <select
              className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl px-4 py-2 text-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-neutral-800/70"
              defaultValue="claude-sonnet"
            >
              <option value="claude-sonnet">Claude 3 Sonnet</option>
              <option value="claude-haiku">Claude 3 Haiku</option>
              <option value="claude-opus">Claude 3 Opus</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          {/* Right side - Prompt Actions and Run Button */}
          <div className="flex items-center gap-3">
            {/* Prompt Builder Actions */}
            <PromptBuilderActions />

            {/* Run Prompt Button */}
            <button
              onClick={handleRunPrompt}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Play className="w-4 h-4" />
              Run Prompt
            </button>
          </div>
        </div>

        {/* Main Content - ChatGPT-style Centered Layout */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
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
      </div>
    </DndProvider>
  );
}