import React from 'react';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  return (
    <header className={`bg-neutral-900 border-b border-neutral-800 ${className}`}>
      {/* Empty header - can be used for future header content */}
    </header>
  );
}