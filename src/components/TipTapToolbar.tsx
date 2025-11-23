import React from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code
} from 'lucide-react';
import { Editor } from '@tiptap/react';

interface TipTapToolbarProps {
  editor: Editor | null;
}

/**
 * Toolbar component for Tiptap editor with formatting controls
 */
export function TipTapToolbar({ editor }: TipTapToolbarProps) {
  if (!editor) {
    return null;
  }

  const toolbarButtonClasses = "p-2 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const activeButtonClasses = "bg-neutral-700 text-white";

  return (
    <div className="flex items-center gap-1 p-2 border-b border-neutral-700 bg-neutral-800/50">
      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${toolbarButtonClasses} ${editor.isActive('bold') ? activeButtonClasses : ''}`}
        title="Bold"
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${toolbarButtonClasses} ${editor.isActive('italic') ? activeButtonClasses : ''}`}
        title="Italic"
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </button>

      <div className="w-px h-6 bg-neutral-600 mx-1" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${toolbarButtonClasses} ${editor.isActive('heading', { level: 1 }) ? activeButtonClasses : ''}`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${toolbarButtonClasses} ${editor.isActive('heading', { level: 2 }) ? activeButtonClasses : ''}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${toolbarButtonClasses} ${editor.isActive('heading', { level: 3 }) ? activeButtonClasses : ''}`}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <div className="w-px h-6 bg-neutral-600 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${toolbarButtonClasses} ${editor.isActive('bulletList') ? activeButtonClasses : ''}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${toolbarButtonClasses} ${editor.isActive('orderedList') ? activeButtonClasses : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-px h-6 bg-neutral-600 mx-1" />

      {/* Code Block */}
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`${toolbarButtonClasses} ${editor.isActive('codeBlock') ? activeButtonClasses : ''}`}
        title="Code Block"
      >
        <Code size={16} />
      </button>
    </div>
  );
}