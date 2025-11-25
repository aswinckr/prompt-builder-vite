import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';

interface Model {
  value: string;
  label: string;
  group: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

/**
 * Model selector dropdown component
 *
 * Provides AI model selection with grouped options by provider
 */
export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  // Available models - includes actual OpenRouter models
  const availableModels: Model[] = [
    { value: "gemini-3-pro", label: "Gemini 3 Pro", group: "Google" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", group: "Google" },
    {
      value: "gemini-2.5-flash-lite",
      label: "Gemini 2.5 Flash Lite",
      group: "Google",
    },
    { value: "gpt-4o", label: "GPT-4o", group: "OpenAI" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini", group: "OpenAI" },
    { value: "claude-sonnet", label: "Claude 3 Sonnet", group: "Anthropic" },
    { value: "claude-haiku", label: "Claude 3 Haiku", group: "Anthropic" },
    { value: "claude-opus", label: "Claude 3 Opus", group: "Anthropic" },
  ];

  // Group models by provider
  const groupedModels = availableModels.reduce((acc, model) => {
    if (!acc[model.group]) {
      acc[model.group] = [];
    }
    acc[model.group].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  return (
    <div className="relative">
      <select
        className="min-w-[160px] appearance-none rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-4 py-2 pr-8 text-sm backdrop-blur-sm transition-all duration-200 hover:bg-neutral-800/70 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
      >
        {Object.entries(groupedModels).map(([group, models]) => (
          <optgroup key={group} label={group}>
            {models.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-neutral-400" />
    </div>
  );
}