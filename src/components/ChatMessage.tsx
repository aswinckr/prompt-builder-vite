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
          ? 'bg-blue-500/10 border border-blue-500/20 text-blue-100'
          : 'bg-neutral-800/30 border border-neutral-700/30 text-neutral-100'
      }`}>
        <div className={`text-xs font-medium mb-2 ${
          isUser ? 'text-blue-400' : 'text-green-400'
        }`}>
          {isUser ? 'You' : 'AI Assistant'}
          <span className="ml-2 text-neutral-500">
            {formatTime(message.createdAt || Date.now())}
          </span>
        </div>
        <div className="text-sm prose prose-invert prose-neutral max-w-none">
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom styling for code blocks
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !className || !match;
                  return !isInline ? (
                    <pre className="bg-neutral-900 rounded-lg p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                // Custom styling for blockquotes
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-neutral-600 pl-4 italic my-4">
                      {children}
                    </blockquote>
                  );
                },
                // Custom styling for tables
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border-collapse border border-neutral-700">
                        {children}
                      </table>
                    </div>
                  );
                },
                // Custom styling for table headers
                th({ children }) {
                  return (
                    <th className="border border-neutral-700 bg-neutral-800 px-4 py-2 text-left font-semibold">
                      {children}
                    </th>
                  );
                },
                // Custom styling for table cells
                td({ children }) {
                  return (
                    <td className="border border-neutral-700 px-4 py-2">
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
          )}
        </div>
      </div>
    </div>
  );
}