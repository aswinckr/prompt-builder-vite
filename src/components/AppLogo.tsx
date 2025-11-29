import React from "react";

/**
 * AppLogo component displays the application logo and branding
 * Positioned in the top-left area for consistent brand presence
 */
export function AppLogo() {
  const handleLogoClick = () => {
    // Future: Navigate to home/dashboard
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLogoClick();
    }
  };

  return (
    <button
      onClick={handleLogoClick}
      onKeyDown={handleKeyDown}
      className="flex items-center rounded-lg p-2 transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Prompt Builder - Navigate to home"
      data-testid="app-logo"
    >
      {/* Logo Icon - Using a placeholder div since we don't have the logo image */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-primary shadow-glow-sm">
        <span className="text-sm font-bold text-primary-foreground">PB</span>
      </div>
    </button>
  );
}
