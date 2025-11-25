import React from 'react';

/**
 * Helper component that displays information about variable placeholder syntax
 * for prompt templates
 */
export function VariablePlaceholderHelper() {
  return (
    <div className="mt-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
      <p className="text-xs text-blue-400 font-medium mb-2">💡 Variable Placeholder Syntax:</p>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Use double curly braces:</span>
          <code className="bg-neutral-700 px-2 py-1 rounded text-xs text-blue-300">{"{{user_name}}"}</code>
          <span className="text-xs text-neutral-500">,</span>
          <code className="bg-neutral-700 px-2 py-1 rounded text-xs text-blue-300">{"{{topic}}"}</code>
          <span className="text-xs text-neutral-500">,</span>
          <code className="bg-neutral-700 px-2 py-1 rounded text-xs text-blue-300">{"{{company}}"}</code>
        </div>
        <div className="text-xs text-neutral-400">
          <p className="font-medium text-blue-300 mb-1">Examples:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li><code className="bg-neutral-700 px-1 py-0.5 rounded text-xs">Hello {"{{user_name}}"}, welcome to {"{{company}}"}</code></li>
            <li><code className="bg-neutral-700 px-1 py-0.5 rounded text-xs">Please analyze {"{{topic}}"} and provide recommendations</code></li>
            <li><code className="bg-neutral-700 px-1 py-0.5 rounded text-xs">Summarize the document about {"{{document_title}}"}</code></li>
          </ul>
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Variables will be preserved as plain text in your prompt template.
        </p>
      </div>
    </div>
  );
}