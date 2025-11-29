import React from 'react';
import { Menu } from 'lucide-react';
import { HistoryMenuButton } from './HistoryMenuButton';

interface HamburgerHistoryMenuProps {
  // Optional prop to customize styling
  className?: string;
}

export function HamburgerHistoryMenu({ className = '' }: HamburgerHistoryMenuProps) {
  return (
    <HistoryMenuButton
      icon={<Menu className="w-4 h-4" />}
      defaultValue="menu"
      containerClassName={className}
    />
  );
}