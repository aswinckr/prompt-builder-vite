import React, { useState } from 'react';
import { User } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { useAuthState } from '../contexts/AuthContext';

/**
 * User profile button and modal component
 *
 * Displays user avatar and manages profile modal state
 */
export function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuthState();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsProfileModalOpen(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsProfileModalOpen(true)}
          onKeyDown={handleKeyDown}
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-700 shadow-lg transition-colors hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
          aria-label="Open profile menu"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-white"></div>
          ) : isAuthenticated && user?.user_metadata?.avatar_url && !avatarImageError ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="User avatar"
              className="h-full w-full object-cover"
              onError={() => setAvatarImageError(true)}
            />
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
        </button>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}