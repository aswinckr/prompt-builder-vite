import React from 'react';
import { CustomTextInput } from './CustomTextInput';
import { PromptBuilderBlockList } from './PromptBuilderBlockList';

interface PromptBuilderContentProps {
  onRunPrompt: () => void;
}

/**
 * Main content area component for the prompt builder
 *
 * Contains the text input and context blocks display
 */
export function PromptBuilderContent({ onRunPrompt }: PromptBuilderContentProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center space-y-6">
        {/* Title - Like Claude/ChatGPT branding */}
        <div className="text-center">
          <h1
            className="mb-4 text-4xl font-medium text-neutral-100 lg:text-5xl"
            style={{ fontFamily: '"Libra Baskerville", Georgia, serif' }}
          >
            What can I help with?
          </h1>
        </div>

        {/* Centered Main Input Area */}
        <div className="relative">
          <CustomTextInput onRunPrompt={onRunPrompt} />
        </div>

        {/* Context Blocks - Displayed below input as cards */}
        <PromptBuilderBlockList />
      </div>
    </div>
  );
}