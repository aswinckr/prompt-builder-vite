import React, { useState } from "react";
import { useLibraryState, useLibraryActions } from "../contexts/LibraryContext";

export function CustomTextInput() {
  const { promptBuilder } = useLibraryState();
  const { setCustomText } = useLibraryActions();

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomText(event.target.value);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        {promptBuilder.customText && (
          <button
            className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-all duration-200 border border-transparent hover:border-neutral-700"
            title="Edit with rich text editor"
          >
            Custom Formatting
          </button>
        )}
      </div>

      <textarea
        value={promptBuilder.customText}
        onChange={handleTextChange}
        className="w-full h-32 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 text-neutral-100 placeholder-neutral-500 resize-y min-h-[8rem] max-h-[24rem] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:border-neutral-600/50 hover:bg-neutral-800/70"
        rows={4}
        aria-label="Add custom text to your prompt"
        placeholder="Ask Away.."
        style={{
          fontSize: "16px", // Prevents zoom on iOS
          lineHeight: "1.6",
        }}
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