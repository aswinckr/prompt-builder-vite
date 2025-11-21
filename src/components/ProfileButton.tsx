import React from 'react';
import { User } from 'lucide-react';

interface ProfileButtonProps {
  onClick: () => void;
}

/**
 * ProfileButton component displays at the bottom of the sidebar
 * Shows user avatar and name with click functionality to open profile modal
 */
export function ProfileButton({ onClick }: ProfileButtonProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const displayName = 'John Doe';
  const accountType = 'Personal Account';

  return (
    <div className="p-4 border-t border-neutral-700">
      <button
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
        aria-label="Open profile menu"
        data-testid="profile-button"
      >
        {/* Avatar Icon */}
        <div className="flex-shrink-0 w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center overflow-hidden">
          <User
            size={18}
            className="text-neutral-300"
            aria-hidden="true"
          />
        </div>

        {/* User Name and Account Type */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-neutral-500">{accountType}</span>
        </div>
      </button>
    </div>
  );
}