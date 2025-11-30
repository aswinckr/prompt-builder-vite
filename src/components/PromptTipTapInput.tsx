import React, { useState, useRef, useEffect } from "react";
import { useLibraryState, useLibraryActions } from "../contexts/LibraryContext";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTiptapEditor } from "../hooks/useTiptapEditor";
import { TipTapToolbar } from "./TipTapToolbar";
import "../styles/tiptap.css";
import { EditorContent } from "@tiptap/react";

interface PromptTipTapInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (e?: React.FormEvent) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  showToolbar?: boolean;
}

function PromptTipTapEditor({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask Away..",
  minHeight = 128,
  maxHeight = 384,
  className = "",
  showToolbar = false,
}: PromptTipTapInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Handle plain text to HTML conversion for initial content
  const initializeContent = (text: string): string => {
    if (!text) return '';

    // Check if content is already HTML (contains common HTML tags)
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(text);
    if (isHtml) return text;

    // Convert plain text to paragraphs
    return text.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
  };

  // Initialize TipTap editor with HTML content
  const editor = useTiptapEditor({
    content: initializeContent(value),
    onUpdate: (content) => {
      if (!isComposing) {
        // Store HTML content directly to preserve formatting
        onChange(content.html);
      }
    },
    editable: true,
    placeholder,
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && !isComposing) {
      const currentHtml = editor.getHTML();
      const newValue = initializeContent(value);

      // Avoid unnecessary updates to prevent cursor jumping
      if (currentHtml !== newValue) {
        editor.commands.setContent(newValue);
      }
    }
  }, [value, editor, isComposing]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  if (!editor) {
    return (
      <div className={`relative border border-neutral-700/60 rounded-xl overflow-hidden transition-all duration-200 ${className}`}>
        <div className="flex items-end p-4 min-h-[128px] bg-transparent">
          <div className="flex-1 animate-pulse">
            <div className="h-4 w-3/4 bg-neutral-700 rounded mb-2"></div>
            <div className="h-4 w-1/2 bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        ref={containerRef}
        className={`relative border border-neutral-700/60 rounded-xl overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 hover:border-neutral-600 bg-transparent ${className}`}
      >
        {/* Optional toolbar - shown based on showToolbar prop */}
        {showToolbar && (
          <div className="border-b border-neutral-700/60 bg-neutral-800/50">
            <TipTapToolbar editor={editor} />
          </div>
        )}

        <div className="flex items-end">
          <div className="flex-1 relative">
            <EditorContent
              editor={editor}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              className="prompt-tiptap-editor"
            />
          </div>

          {onSubmit && (
            <Button
              type="submit"
              size="icon"
              disabled={!value.trim()}
              className="m-2 hover:bg-muted/50 flex-shrink-0"
              title="Run prompt (Cmd/Ctrl+Enter)"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

interface CustomTipTapInputProps {
  onRunPrompt?: () => void;
  showToolbar?: boolean;
}

export function PromptTipTapInput({ onRunPrompt, showToolbar = false }: CustomTipTapInputProps) {
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
      <PromptTipTapEditor
        value={promptBuilder.customText}
        onChange={handleTextChange}
        onSubmit={handleSubmit}
        placeholder="Ask Away.."
        minHeight={128}
        maxHeight={384}
        showToolbar={showToolbar}
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