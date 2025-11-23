import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

export interface EditorContent {
  html: string;
  json: any;
  text: string;
}

export interface UseTiptapEditorProps {
  content?: string;
  onUpdate?: (content: EditorContent) => void;
  editable?: boolean;
  placeholder?: string;
}

/**
 * Custom hook for managing Tiptap editor instance
 */
export function useTiptapEditor({
  content = '',
  onUpdate,
  editable = true,
  placeholder
}: UseTiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure extensions as needed
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate({
          html: editor.getHTML(),
          json: editor.getJSON(),
          text: editor.getText(),
        });
      }
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return editor;
}