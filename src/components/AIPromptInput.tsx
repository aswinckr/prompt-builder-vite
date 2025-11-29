import React, { useRef, useEffect, useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface AIPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
}

export function AIPromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your message...",
  disabled = false,
  isLoading = false,
  minHeight = 48,
  maxHeight = 164,
  className = "",
}: AIPromptInputProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`relative border border-purple-700/30 bg-neutral-800 rounded-xl overflow-hidden transition-all duration-200 focus-within:border-purple-500/50 hover:border-purple-700/50 ${className}`}
    >
      <div className="flex items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 resize-none outline-none overflow-hidden"
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
          }}
          rows={1}
        />
        <button
          type="submit"
          disabled={disabled || isLoading || !value.trim()}
          className="p-3 text-purple-400 hover:text-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 m-1 rounded-lg hover:bg-purple-700/30"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
}