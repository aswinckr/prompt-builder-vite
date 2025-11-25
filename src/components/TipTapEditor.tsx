import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { EditorContent } from "@tiptap/react";
import { useTiptapEditor } from "../hooks/useTiptapEditor";
import { TipTapToolbar } from "./TipTapToolbar";
import "../styles/tiptap.css";

interface TipTapEditorProps {
  content?: string;
  onUpdate?: (content: { html: string; json: any; text: string }) => void;
  editable?: boolean;
  placeholder?: string;
}

export interface TipTapEditorRef {
  focus: () => void;
}

/**
 * Complete Tiptap editor component with toolbar and content area
 */
export const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(({
  content = "",
  onUpdate,
  editable = true,
  placeholder = "Start writing...",
}, ref) => {
  const editor = useTiptapEditor({
    content,
    onUpdate,
    editable,
    placeholder,
  });

  // Expose focus method to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (editor) {
        editor.commands.focus();
      }
    },
  }), [editor]);

  if (!editor) {
    return (
      <div className="min-h-[200px] rounded-lg border border-neutral-700 bg-neutral-800">
        <div className="animate-pulse">
          <div className="h-10 rounded-t-lg bg-neutral-700"></div>
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 rounded bg-neutral-700"></div>
            <div className="h-4 w-1/2 rounded bg-neutral-700"></div>
            <div className="h-4 w-5/6 rounded bg-neutral-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
      <TipTapToolbar editor={editor} />

      <div className="prose prose-invert relative max-w-none">
        <EditorContent
          editor={editor}
          className="min-h-[200px] p-4 focus:outline-none"
        />
      </div>
    </div>
  );
});

TipTapEditor.displayName = "TipTapEditor";