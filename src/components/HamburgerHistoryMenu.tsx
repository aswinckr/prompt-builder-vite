import React from 'react';
import { Menu } from 'lucide-react';
import { HistoryMenuButton } from './HistoryMenuButton';

interface HamburgerHistoryMenuProps {
  // Optional prop to customize positioning
  className?: string;
}

export function HamburgerHistoryMenu({ className = '' }: HamburgerHistoryMenuProps) {
  return (
    <HistoryMenuButton
      icon={<Menu className="w-5 h-5" />}
      defaultValue="menu"
      containerClassName={`absolute top-4 left-4 z-30 ${className}`}
    />
  );
}