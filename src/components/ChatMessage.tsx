import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { isUserMessage, formatTime } from '../utils/chat';
import 'highlight.js/styles/github-dark.css';

interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = isUserMessage(message.role);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-full rounded-lg p-4 ${
        isUser
          ? 'bg-purple-900/30 border border-purple-500/30 text-purple-100'
          : 'bg-neutral-800 border border-purple-700/30 text-neutral-100'
      }`}>
        <div className={`text-xs font-medium mb-2 ${
          isUser ? 'text-purple-400' : 'text-purple-300'
        }`}>
          {isUser ? 'You' : 'AI Assistant'}
          <span className="ml-2 text-neutral-500">
            {formatTime(message.createdAt || Date.now())}
          </span>
        </div>
        <div className="text-base prose prose-invert prose-neutral max-w-none leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Custom styling for code blocks
              code({ node, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { node?: unknown }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !className || !match;
                return !isInline ? (
                  <pre className="bg-neutral-900 border border-purple-700/30 rounded-lg p-4 overflow-x-auto">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-purple-900/30 border border-purple-700/20 px-1.5 py-0.5 rounded text-xs font-mono text-purple-300" {...props}>
                    {children}
                  </code>
                );
              },
              // Custom styling for blockquotes
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-purple-500/50 pl-4 italic my-4 text-purple-200">
                    {children}
                  </blockquote>
                );
              },
              // Custom styling for tables
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-purple-700/30">
                      {children}
                    </table>
                  </div>
                );
              },
              // Custom styling for table headers
              th({ children }) {
                return (
                  <th className="border border-purple-700/30 bg-purple-900/20 px-4 py-2 text-left font-semibold text-purple-100">
                    {children}
                  </th>
                );
              },
              // Custom styling for table cells
              td({ children }) {
                return (
                  <td className="border border-purple-700/30 px-4 py-2">
                    {children}
                  </td>
                );
              },
              // Custom styling for lists
              ul({ children }) {
                return <ul className="list-disc list-inside my-2">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside my-2">{children}</ol>;
              },
              // Custom styling for list items
              li({ children }) {
                return <li className="my-1">{children}</li>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}