import React from "react";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-[var(--z-sticky)] border-b border-border bg-background/80 backdrop-blur-md ${className}`}
    >
      {/* Empty header - can be used for future header content */}
    </header>
  );
}
