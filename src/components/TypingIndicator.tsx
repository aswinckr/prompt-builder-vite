import React from 'react';
import { ANIMATION_DELAYS } from '../utils/constants';

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] rounded-lg p-4 bg-neutral-800/30 border border-neutral-700/30">
        <div className="text-xs font-medium text-green-400 mb-2">
          AI Assistant
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: ANIMATION_DELAYS.TYPING_INDICATOR_1 }}></div>
          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: ANIMATION_DELAYS.TYPING_INDICATOR_2 }}></div>
        </div>
      </div>
    </div>
  );
}