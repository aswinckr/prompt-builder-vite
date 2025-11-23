// Generate UUID for message IDs
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Extract text from complex message parts if needed
export function getTextFromMessage(message: any): string {
  if (typeof message === 'string') return message;

  if (message.content) {
    return typeof message.content === 'string'
      ? message.content
      : message.parts?.filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('') || '';
  }

  return '';
}

// Format timestamp for display
export function formatTime(timestamp: number | string | Date): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Check if a message is from the user
export function isUserMessage(role: string): boolean {
  return role === 'user';
}

// Check if a message is from the assistant
export function isAssistantMessage(role: string): boolean {
  return role === 'assistant';
}

// Sanitize message content for display
export function sanitizeMessageContent(content: string): string {
  return content.trim();
}