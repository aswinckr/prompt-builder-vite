import React from 'react';
import { History } from 'lucide-react';
import { HistoryMenuButton } from './HistoryMenuButton';

interface KnowledgeHistoryButtonProps {
  // Optional prop to customize positioning
  className?: string;
}

export function KnowledgeHistoryButton({ className = '' }: KnowledgeHistoryButtonProps) {
  return (
    <HistoryMenuButton
      icon={<History data-testid="history-icon" className="w-5 h-5" />}
      defaultValue="history"
      containerClassName={`relative ${className}`}
      data-testid="history-button"
    />
  );
}