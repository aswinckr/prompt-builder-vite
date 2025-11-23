import React from 'react';
import { User } from 'lucide-react';
import { useAuthState } from '../contexts/AuthContext';

interface ProfileButtonProps {
  onClick: () => void;
}

/**
 * ProfileButton component displays at the bottom of the sidebar
 * Shows user avatar and name with click functionality to open profile modal
 */
export function ProfileButton({ onClick }: ProfileButtonProps) {
  const { user, isAuthenticated, isLoading } = useAuthState();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const displayName = isAuthenticated
    ? (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User')
    : 'Sign In';
  const accountType = isAuthenticated ? 'Personal Account' : 'Click to sign in';

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
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-white"></div>
          ) : isAuthenticated && user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="User avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to user initial if avatar fails to load
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback content */}
          {isAuthenticated && user?.user_metadata?.avatar_url ? (
            <span
              className="text-sm font-medium text-neutral-300"
              style={{display: 'none'}}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          ) : isAuthenticated && user?.email ? (
            <span className="text-sm font-medium text-neutral-300">
              {user.email.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User
              size={18}
              className="text-neutral-300"
              aria-hidden="true"
            />
          )}
        </div>

        {/* User Name and Account Type */}
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-medium text-left">{displayName}</span>
          <span className="text-xs text-neutral-500 text-left">{accountType}</span>
        </div>
      </button>
    </div>
  );
}