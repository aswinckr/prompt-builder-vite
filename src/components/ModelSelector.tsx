import React, { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Group models by provider - memoized for performance
  const groupedModels = useMemo(() => {
    return availableModels.reduce((acc, model) => {
      if (!acc[model.group]) {
        acc[model.group] = [];
      }
      acc[model.group].push(model);
      return acc;
    }, {} as Record<string, Model[]>);
  }, [availableModels]);

  return (
    <Select value={selectedModel} onValueChange={onModelChange}>
      <SelectTrigger className="min-w-[160px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(groupedModels).map(([group, models]) => (
          <SelectGroup key={group}>
            <SelectLabel>{group}</SelectLabel>
            {models.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}