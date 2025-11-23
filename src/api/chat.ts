import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
});

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  model?: string;
  context?: string;
}

// Map model names to provider format
const modelMap: Record<string, string> = {
  'gemini-3-pro': 'google/gemini-3-pro-preview',
  'gemini-2.5-flash': 'google/gemini-2.5-flash-preview-09-2025',
  'gemini-2.5-flash-lite': 'google/gemini-2.5-flash-lite-preview-09-2025',
  'claude-sonnet': 'anthropic/claude-3-sonnet',
  'claude-haiku': 'anthropic/claude-3-haiku-20240307',
  'claude-opus': 'anthropic/claude-3-opus-20240229',
  'gpt-4o': 'openai/gpt-4o-2024-08-06',
  'gpt-4o-mini': 'openai/gpt-4o-mini'
};

export async function chatApi(request: ChatRequest) {
  const { messages, model = 'gemini-3-pro', context } = request;

  // Prepare messages with context if provided
  let preparedMessages = [...messages];

  // Add system message with context if available
  if (context && messages.length > 0 && messages[0].role !== 'system') {
    preparedMessages = [
      {
        role: 'system' as const,
        content: `You are an AI assistant helping with a prompt builder. The user has built a prompt with the following context:\n\n${context}\n\nPlease help them with their request while considering this context.`
      },
      ...messages
    ];
  }

  const selectedModel = modelMap[model] || model;

  try {
    const result = await streamText({
      model: openrouter(selectedModel),
      messages: preparedMessages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    throw new Error('Failed to generate response');
  }
}