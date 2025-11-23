import React, { useState, useRef, useEffect } from "react";
import { useLibraryState, useLibraryActions } from "../contexts/LibraryContext";
import { Send } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (e?: React.FormEvent) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
}

function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask Away..",
  minHeight = 128,
  maxHeight = 384,
  className = "",
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to get the scroll height
      textarea.style.height = 'auto';

      // Calculate new height
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      // Set the new height
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
    // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) support
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && value.trim()) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`relative bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 hover:border-neutral-600/50 hover:bg-neutral-800/70 ${className}`}
      >
        <div className="flex items-end">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent p-4 text-neutral-100 placeholder-neutral-500 resize-none outline-none overflow-hidden"
            style={{
              minHeight: `${minHeight}px`,
              maxHeight: `${maxHeight}px`,
              fontSize: "16px", // Prevents zoom on iOS
              lineHeight: "1.6",
            }}
            rows={1}
            aria-label="Add custom text to your prompt"
          />
          {onSubmit && (
            <button
              type="submit"
              disabled={!value.trim()}
              className="p-3 m-2 text-neutral-400 hover:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg hover:bg-neutral-700/30"
              title="Run prompt (Enter or Cmd+Enter)"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

interface CustomTextInputProps {
  onRunPrompt?: () => void;
}

export function CustomTextInput({ onRunPrompt }: CustomTextInputProps) {
  const { promptBuilder } = useLibraryState();
  const { setCustomText } = useLibraryActions();

  const handleTextChange = (value: string) => {
    setCustomText(value);
  };

  const handleSubmit = () => {
    if (onRunPrompt) {
      onRunPrompt();
    }
  };

  return (
    <div className="w-full">
      <PromptInput
        value={promptBuilder.customText}
        onChange={handleTextChange}
        onSubmit={handleSubmit}
        placeholder="Ask Away.."
        minHeight={128}
        maxHeight={384}
      />

      {/* Subtle hint text */}
      {!promptBuilder.customText && (
        <div className="mt-2 text-xs text-neutral-600 text-center">
          Add context blocks below for more detailed responses
        </div>
      )}
    </div>
  );
}