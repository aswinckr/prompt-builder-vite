import React, { useState, useRef, useEffect } from "react";
import { useLibraryState, useLibraryActions } from "../contexts/LibraryContext";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    // Only Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) triggers submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
    // Let Enter behave normally (adds new line)
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
        className={`relative border border-neutral-700/60 rounded-xl overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 hover:border-neutral-600 ${className}`}
      >
        <div className="flex items-end">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 border-0 resize-none focus-visible:ring-0 shadow-none bg-transparent"
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
            <Button
              type="submit"
              size="icon"
              disabled={!value.trim()}
              className="m-2 hover:bg-muted/50"
              title="Run prompt (Enter or Cmd+Enter)"
            >
              <Send className="h-4 w-4" />
            </Button>
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