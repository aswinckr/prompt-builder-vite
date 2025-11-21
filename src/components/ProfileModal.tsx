import React from 'react';
import { X, Settings, LogOut } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ProfileModal component displays user profile information and settings
 */
export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md mx-4 border border-neutral-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 id="profile-modal-title" className="text-lg font-semibold text-white">
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close profile modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-neutral-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-neutral-300">JD</span>
            </div>
            <div>
              <h3 className="text-white font-medium text-lg">John Doe</h3>
              <p className="text-neutral-400 text-sm">john.doe@example.com</p>
            </div>
          </div>

          {/* Account Type */}
          <div className="mb-6 p-4 bg-neutral-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Account Type</h4>
                <p className="text-neutral-400 text-sm">Personal Account</p>
              </div>
              <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>

          {/* Settings Options */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-neutral-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-neutral-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}