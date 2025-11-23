import React from 'react';
import { isUserMessage, formatTime } from '../utils/chat';

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
      <div className={`max-w-[80%] rounded-lg p-4 ${
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
        <div className="whitespace-pre-wrap text-sm">
          {message.content}
        </div>
      </div>
    </div>
  );
}