import React from 'react';

/**
 * AppLogo component displays the application logo and branding
 * Positioned in the top-left area for consistent brand presence
 */
export function AppLogo() {
  const handleLogoClick = () => {
    // Future: Navigate to home/dashboard
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLogoClick();
    }
  };

  return (
    <button
      onClick={handleLogoClick}
      onKeyDown={handleKeyDown}
      className="flex items-center transition-colors hover:bg-neutral-700/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
      aria-label="Prompt Builder - Navigate to home"
      data-testid="app-logo"
    >
      {/* Logo Icon - Using a placeholder div since we don't have the logo image */}
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 rounded">
        <span className="text-white font-bold text-sm">PB</span>
      </div>
    </button>
  );
}